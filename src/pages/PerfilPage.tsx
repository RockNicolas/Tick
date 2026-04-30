import {
  UserRound,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import PerfilConquistasCard from '../components/perfil/PerfilConquistasCard'
import PerfilHeroCard from '../components/perfil/PerfilHeroCard'
import PerfilPerformanceHubCard from '../components/perfil/PerfilPerformanceHubCard'
import PerfilWishlistResumoCard from '../components/perfil/PerfilWishlistResumoCard'
import { type WishItem } from '../components/perfil/types'
import { fetchGoals } from '../api/goals'
import { fetchWishlist } from '../api/wishlist'
import { fetchUserAchievements, unlockAchievement } from '../api/achievements'
import { useTickSettingsVersion } from '../hooks/useTickSettings'
import {
  readProfileAchievementsEnabledForCurrentUser,
  readProfileWishlistEnabledForCurrentUser,
  readWishlistEnabledForCurrentUser,
} from '../lib/tickSettings'
import { getUserInitials, readTickStoredUser } from '../lib/tickUser'

const FIXED_GOAL_CATEGORIES = [
  { key: 'fitness', label: 'Fitness', color: '#22d3ee' },
  { key: 'financeiro', label: 'Finanças', color: '#34d399' },
  { key: 'ler', label: 'Leitura', color: '#a78bfa' },
  { key: 'outros', label: 'Outros', color: '#f59e0b' },
] as const

type MonthlyCategoryStat = {
  category: string
  label: string
  percent: number
  color: string
}

function normalizeGoalCategory(raw: string) {
  const value = raw.trim().toLowerCase()
  if (value === 'fitness') return 'fitness'
  if (value === 'financas' || value === 'finanças' || value === 'financeiro') return 'financeiro'
  if (value === 'leitura' || value === 'ler') return 'ler'
  return 'outros'
}

export default function PerfilPage() {
  const tickSettingsVersion = useTickSettingsVersion()
  void tickSettingsVersion
  const user = readTickStoredUser()
  const wishlistEnabled = readWishlistEnabledForCurrentUser()
  const profileAchievementsEnabled = readProfileAchievementsEnabledForCurrentUser()
  const profileWishlistEnabled = readProfileWishlistEnabledForCurrentUser()
  const userName = user?.name?.trim() ? user.name : 'Usuário Tick'
  const userEmail = user?.email ?? 'usuario@tick.app'
  const initials = getUserInitials(userName)
  const [monthlyCompletionRate, setMonthlyCompletionRate] = useState(0)
  const [monthlyFocus, setMonthlyFocus] = useState('sem foco definido')
  const [monthlyCategoryStats, setMonthlyCategoryStats] = useState<MonthlyCategoryStat[]>([])
  const [completedGoalsCount, setCompletedGoalsCount] = useState(0)
  const [wishItems, setWishItems] = useState<WishItem[]>([])
  const [savedUnlockedMedalIds, setSavedUnlockedMedalIds] = useState<string[]>([])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      if (!wishlistEnabled || !profileWishlistEnabled) {
        if (cancelled) return
        setWishItems([])
        return
      }
      try {
        const items = await fetchWishlist()
        if (cancelled) return
        setWishItems(
          items.map(({ id, title, link, category, priority, done }) => ({
            id,
            title,
            link,
            category: category || 'geral',
            priority: priority || 'media',
            done,
          })),
        )
      } catch {
        if (cancelled) return
        setWishItems([])
      }
    })()
    return () => {
      cancelled = true
    }
  }, [wishlistEnabled, profileWishlistEnabled])

  useEffect(() => {
    let cancelled = false

    ;(async () => {
      try {
        const activeGoals = await fetchGoals('active')
        const completedGoals = await fetchGoals('completed')

        if (cancelled) return

        const byCategory = new Map<string, { totalProgress: number; goals: number }>()
        for (const goal of activeGoals) {
          const bucket = normalizeGoalCategory(goal.category || 'outros')
          const prev = byCategory.get(bucket) ?? { totalProgress: 0, goals: 0 }
          byCategory.set(bucket, {
            totalProgress: prev.totalProgress + Math.max(0, Math.min(100, goal.progress)),
            goals: prev.goals + 1,
          })
        }
        setMonthlyCategoryStats(
          FIXED_GOAL_CATEGORIES.map(({ key, label, color }) => {
            const aggregate = byCategory.get(key)
            const goals = aggregate?.goals ?? 0
            const avgPercent = goals > 0 ? Math.round((aggregate?.totalProgress ?? 0) / goals) : 0
            return { category: key, label, percent: avgPercent, color }
          }), 
        )
        const goalsCount = activeGoals.length
        const totalProgress = activeGoals.reduce((sum, goal) => sum + Math.max(0, Math.min(100, goal.progress)), 0)
        setMonthlyCompletionRate(goalsCount > 0 ? Math.round(totalProgress / goalsCount) : 0)
        setCompletedGoalsCount(completedGoals.length)

        if (byCategory.size === 0) {
          setMonthlyFocus('sem foco definido')
        } else {
          let monthTopCategory = 'outros'
          let monthTopAvg = -1
          for (const [category, aggregate] of byCategory.entries()) {
            const avg = aggregate.goals > 0 ? aggregate.totalProgress / aggregate.goals : 0
            if (avg > monthTopAvg) {
              monthTopAvg = avg
              monthTopCategory = category
            }
          }
          const topCategory = FIXED_GOAL_CATEGORIES.find((entry) => entry.key === monthTopCategory)
          setMonthlyFocus(topCategory?.label.toLowerCase() ?? 'sem foco definido')
        }
      } catch {
        if (cancelled) return
        setMonthlyCompletionRate(0)
        setMonthlyFocus('sem foco definido')
        setCompletedGoalsCount(0)
        setMonthlyCategoryStats(
          FIXED_GOAL_CATEGORIES.map(({ key, label, color }) => ({ category: key, label, percent: 0, color })),
        )
      }
    })()

    return () => {
      cancelled = true
    }
  }, [])

  const weakestCategory = useMemo(() => {
    const sorted = [...monthlyCategoryStats].sort((a, b) => a.percent - b.percent)
    return sorted[0]?.label ?? 'metas'
  }, [monthlyCategoryStats])

  const doneWishCount = useMemo(
    () => (wishlistEnabled ? wishItems.filter((item) => item.done).length : 0),
    [wishItems, wishlistEnabled],
  )
  const liveUnlockedMedalIds = useMemo(() => {
    const byCategory = new Map(monthlyCategoryStats.map((entry) => [entry.category, entry.percent]))
    const ids: string[] = []

    if (completedGoalsCount >= 1) ids.push('goal')
    if ((byCategory.get('fitness') ?? 0) >= 70) ids.push('fit')
    if ((byCategory.get('financeiro') ?? 0) >= 70) ids.push('money')
    if ((byCategory.get('ler') ?? 0) >= 70) ids.push('read')
    if (doneWishCount >= 1) ids.push('tag')
    if (doneWishCount >= 10) ids.push('gem')

    return ids
  }, [monthlyCategoryStats, doneWishCount, completedGoalsCount])
  const unlockedMedalIds = useMemo(
    () => [...new Set([...savedUnlockedMedalIds, ...liveUnlockedMedalIds])],
    [savedUnlockedMedalIds, liveUnlockedMedalIds],
  )

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const achievements = await fetchUserAchievements()
        if (cancelled) return
        setSavedUnlockedMedalIds(achievements.map((entry) => entry.medalId))
      } catch {
        if (cancelled) return
        setSavedUnlockedMedalIds([])
      }
    })()
    return () => {
      cancelled = true
    }
  }, [tickSettingsVersion, user?.id])

  useEffect(() => {
    if (liveUnlockedMedalIds.length === 0) return
    const missing = liveUnlockedMedalIds.filter((id) => !savedUnlockedMedalIds.includes(id))
    if (missing.length === 0) return
    ;(async () => {
      try {
        await Promise.all(missing.map((id) => unlockAchievement(id)))
        setSavedUnlockedMedalIds((prev) => [...new Set([...prev, ...missing])])
      } catch {
        // nao bloqueia tela de perfil
      }
    })()
  }, [liveUnlockedMedalIds, savedUnlockedMedalIds])
  const showAchievementsCard = profileAchievementsEnabled
  const showWishlistCard = wishlistEnabled && profileWishlistEnabled
  const profileGridClass = showWishlistCard
    ? 'grid grid-cols-1 items-start gap-4 xl:grid-cols-[220px_minmax(0,1fr)_280px]'
    : 'grid grid-cols-1 items-start gap-4 xl:grid-cols-[260px_minmax(0,1fr)]'
  const chartPercents = useMemo(() => {
    const fallback = [0, 0, 0, 0]
    if (monthlyCategoryStats.length < 4) return fallback
    return monthlyCategoryStats.slice(0, 4).map((item) => Math.max(0, Math.min(100, item.percent)))
  }, [monthlyCategoryStats])

  return (
    <div className="min-w-0 space-y-4 overflow-x-hidden">
      <div className="flex min-w-0 items-center gap-2 text-2xl font-semibold text-zinc-900 dark:text-zinc-100 sm:text-3xl">
        <UserRound className="h-7 w-7 shrink-0 text-zinc-700 dark:text-zinc-300" />
        <span>Perfil de usuário</span>
      </div>

      <div className={profileGridClass}>
        <div>
          <PerfilHeroCard initials={initials} userName={userName} userEmail={userEmail} />
          {showAchievementsCard ? (
            <div className="pt-4 xl:pt-11">
              <PerfilConquistasCard doneWishCount={doneWishCount} unlockedMedalIds={unlockedMedalIds} />
            </div>
          ) : null}
        </div>
        <div className="min-w-0">
          <PerfilPerformanceHubCard
            monthlyCompletionRate={monthlyCompletionRate}
            monthlyCategoryStats={monthlyCategoryStats}
            chartPercents={chartPercents}
            weakestCategory={weakestCategory}
            monthlyFocus={monthlyFocus}
          />
        </div>

        {showWishlistCard ? (
          <div className="min-w-0">
            <PerfilWishlistResumoCard wishItems={wishItems} />
          </div>
        ) : null}
      </div>
    </div>
  )
}
