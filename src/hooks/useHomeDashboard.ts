import { useEffect, useMemo, useState } from 'react'
import { fetchUserAchievements } from '../api/achievements'
import { dateKeyFromDate, fetchDayDemandsForWeek, startOfWeekSunday } from '../api/dayDemands'
import { fetchGoals } from '../api/goals'
import { fetchWishlist } from '../api/wishlist'
import {
  readGoalsEnabledForCurrentUser,
  readWeekEnabledForCurrentUser,
  readWishlistEnabledForCurrentUser,
} from '../lib/tickSettings'
import type { MonthlyDemand } from '../types/monthlyDemand'

export type HomeUpcomingItem = {
  id: string
  dateKey: string
  title: string
  category: string
  done: boolean
  priority: 'baixa' | 'media' | 'importante'
  startTime: string | null
}

function normalizeGoalCategory(raw: string) {
  const value = raw.trim().toLowerCase()
  if (value === 'fitness') return 'fitness'
  if (value === 'financas' || value === 'finanças' || value === 'financeiro') return 'financeiro'
  if (value === 'leitura' || value === 'ler') return 'ler'
  return 'outros'
}

function demandSortValue(dateKey: string, startTime: string | null) {
  const base = `${dateKey}T${startTime ?? '23:59'}:00`
  const parsed = new Date(base)
  if (Number.isNaN(parsed.getTime())) return Number.MAX_SAFE_INTEGER
  return parsed.getTime()
}

export function useHomeDashboard() {
  const [isLoading, setIsLoading] = useState(true)
  const [todayDemands, setTodayDemands] = useState<MonthlyDemand[]>([])
  const [upcomingItems, setUpcomingItems] = useState<HomeUpcomingItem[]>([])
  const [monthlyCompletionRate, setMonthlyCompletionRate] = useState(0)
  const [monthlyFocus, setMonthlyFocus] = useState('sem foco definido')
  const [monthlyCategoryStats, setMonthlyCategoryStats] = useState<
    { category: string; label: string; percent: number; color: string }[]
  >([
    { category: 'fitness', label: 'Fitness', percent: 0, color: '#22d3ee' },
    { category: 'financeiro', label: 'Finanças', percent: 0, color: '#34d399' },
    { category: 'ler', label: 'Leitura', percent: 0, color: '#a78bfa' },
    { category: 'outros', label: 'Outros', percent: 0, color: '#f59e0b' },
  ])
  const [wishItems, setWishItems] = useState<
    { id: string; title: string; link: string; category: string; priority: 'baixa' | 'media' | 'alta'; done: boolean }[]
  >([])
  const [unlockedMedalIds, setUnlockedMedalIds] = useState<string[]>([])

  const weekEnabled = readWeekEnabledForCurrentUser()
  const goalsEnabled = readGoalsEnabledForCurrentUser()
  const wishlistEnabled = readWishlistEnabledForCurrentUser()

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setIsLoading(true)
      try {
        const now = new Date()
        const weekStart = startOfWeekSunday(now)
        const todayKey = dateKeyFromDate(now)

        const [weekDemands, activeGoals, wishlist, achievements] = await Promise.all([
          fetchDayDemandsForWeek(weekStart),
          goalsEnabled ? fetchGoals('active') : Promise.resolve([]),
          wishlistEnabled ? fetchWishlist() : Promise.resolve([]),
          fetchUserAchievements(),
        ])
        if (cancelled) return

        const todayList = weekDemands[todayKey] ?? []
        setTodayDemands(todayList)

        const upcoming = Object.entries(weekDemands)
          .flatMap(([dateKey, list]) =>
            list.map((demand, index) => ({
              id: `${dateKey}-${index}-${demand.title}`,
              dateKey,
              title: demand.title,
              category: demand.category || 'geral',
              done: Boolean(demand.done),
              priority: demand.priority ?? 'media',
              startTime: demand.startTime ?? null,
            })),
          )
          .filter((item) => !item.done && demandSortValue(item.dateKey, item.startTime) >= demandSortValue(todayKey, '00:00'))
          .sort((a, b) => demandSortValue(a.dateKey, a.startTime) - demandSortValue(b.dateKey, b.startTime))
          .slice(0, 5)
        setUpcomingItems(upcoming)

        const byCategory = new Map<string, { totalProgress: number; goals: number }>()
        for (const goal of activeGoals) {
          const bucket = normalizeGoalCategory(goal.category || 'outros')
          const prev = byCategory.get(bucket) ?? { totalProgress: 0, goals: 0 }
          byCategory.set(bucket, {
            totalProgress: prev.totalProgress + Math.max(0, Math.min(100, goal.progress)),
            goals: prev.goals + 1,
          })
        }

        const fixedCategories = [
          { key: 'fitness', label: 'Fitness', color: '#22d3ee' },
          { key: 'financeiro', label: 'Finanças', color: '#34d399' },
          { key: 'ler', label: 'Leitura', color: '#a78bfa' },
          { key: 'outros', label: 'Outros', color: '#f59e0b' },
        ] as const

        const categoryStats = fixedCategories.map(({ key, label, color }) => {
          const aggregate = byCategory.get(key)
          const goals = aggregate?.goals ?? 0
          const avgPercent = goals > 0 ? Math.round((aggregate?.totalProgress ?? 0) / goals) : 0
          return { category: key, label, percent: avgPercent, color }
        })
        setMonthlyCategoryStats(categoryStats)

        const goalsCount = activeGoals.length
        const totalProgress = activeGoals.reduce((sum, goal) => sum + Math.max(0, Math.min(100, goal.progress)), 0)
        setMonthlyCompletionRate(goalsCount > 0 ? Math.round(totalProgress / goalsCount) : 0)

        if (byCategory.size === 0) {
          setMonthlyFocus('sem foco definido')
        } else {
          let topCategory = 'outros'
          let topAvg = -1
          for (const [category, aggregate] of byCategory.entries()) {
            const avg = aggregate.goals > 0 ? aggregate.totalProgress / aggregate.goals : 0
            if (avg > topAvg) {
              topAvg = avg
              topCategory = category
            }
          }
          const top = fixedCategories.find((entry) => entry.key === topCategory)
          setMonthlyFocus(top?.label.toLowerCase() ?? 'sem foco definido')
        }

        setWishItems(
          wishlist.map((item) => ({
            id: item.id,
            title: item.title,
            link: item.link,
            category: item.category || 'geral',
            priority: item.priority || 'media',
            done: item.done,
          })),
        )
        setUnlockedMedalIds(achievements.map((entry) => entry.medalId))
      } catch {
        if (cancelled) return
        setTodayDemands([])
        setUpcomingItems([])
        setMonthlyCompletionRate(0)
        setMonthlyFocus('sem foco definido')
        setWishItems([])
        setUnlockedMedalIds([])
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [goalsEnabled, wishlistEnabled])

  const doneTodayCount = useMemo(() => todayDemands.filter((item) => item.done).length, [todayDemands])
  const pendingTodayCount = useMemo(() => todayDemands.length - doneTodayCount, [todayDemands.length, doneTodayCount])
  const chartPercents = useMemo(() => {
    const fallback = [0, 0, 0, 0]
    if (monthlyCategoryStats.length < 4) return fallback
    return monthlyCategoryStats.slice(0, 4).map((item) => Math.max(0, Math.min(100, item.percent)))
  }, [monthlyCategoryStats])
  const weakestCategory = useMemo(() => {
    const sorted = [...monthlyCategoryStats].sort((a, b) => a.percent - b.percent)
    return sorted[0]?.label ?? 'metas'
  }, [monthlyCategoryStats])
  const doneWishCount = useMemo(() => wishItems.filter((item) => item.done).length, [wishItems])

  return {
    isLoading,
    weekEnabled,
    goalsEnabled,
    wishlistEnabled,
    todayDemands,
    doneTodayCount,
    pendingTodayCount,
    upcomingItems,
    monthlyCompletionRate,
    monthlyFocus,
    monthlyCategoryStats,
    chartPercents,
    weakestCategory,
    wishItems,
    doneWishCount,
    unlockedMedalIds,
  }
}
