import {
  UserRound,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import PerfilConquistasCard from '../components/perfil/PerfilConquistasCard'
import PerfilHeroCard from '../components/perfil/PerfilHeroCard'
import PerfilPerformanceHubCard from '../components/perfil/PerfilPerformanceHubCard'
import { type WishItem } from '../components/perfil/types'
import PerfilWishlistMarcosCard from '../components/perfil/PerfilWishlistMarcosCard'
import { fetchDayDemandsForMonth } from '../api/dayDemands'
import { fetchGoals } from '../api/goals'
import { categoryDisplayLabel } from '../lib/categoryOptions'
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
  const user = useMemo(() => readTickStoredUser(), [])
  const userName = user?.name?.trim() ? user.name : 'Usuário Tick'
  const userEmail = user?.email ?? 'usuario@tick.app'
  const initials = getUserInitials(userName)
  const [monthlyCompletionRate, setMonthlyCompletionRate] = useState(0)
  const [monthlyFocus, setMonthlyFocus] = useState('sem foco definido')
  const [monthlyCategoryStats, setMonthlyCategoryStats] = useState<MonthlyCategoryStat[]>([])
  const [wishItems, setWishItems] = useState<WishItem[]>([])
  const [newWishTitle, setNewWishTitle] = useState('')
  const [newWishPrice, setNewWishPrice] = useState('')

  useEffect(() => {
    try {
      const raw = localStorage.getItem('tick:wishlist')
      if (!raw) return
      const parsed = JSON.parse(raw) as WishItem[]
      if (!Array.isArray(parsed)) return
      const sanitized = parsed
        .filter((item) => item && typeof item.title === 'string')
        .map((item) => ({
          id: String(item.id || crypto.randomUUID()),
          title: item.title.trim(),
          price: typeof item.price === 'string' ? item.price : '',
          done: Boolean(item.done),
        }))
        .filter((item) => item.title.length > 0)
      setWishItems(sanitized)
    } catch {
      setWishItems([])
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('tick:wishlist', JSON.stringify(wishItems))
  }, [wishItems])

  useEffect(() => {
    let cancelled = false

    ;(async () => {
      try {
        const activeGoals = await fetchGoals('active')

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

        const now = new Date()
        const monthDemands = await fetchDayDemandsForMonth(now.getFullYear(), now.getMonth() + 1)
        if (cancelled) return
        let monthDone = 0
        let monthTotal = 0
        const monthDoneByCategory = new Map<string, number>()
        for (const list of Object.values(monthDemands)) {
          for (const demand of list) {
            monthTotal += 1
            if (!demand.done) continue
            monthDone += 1
            const key = (demand.category || 'geral').trim().toLowerCase() || 'geral'
            monthDoneByCategory.set(key, (monthDoneByCategory.get(key) ?? 0) + 1)
          }
        }
        setMonthlyCompletionRate(monthTotal > 0 ? Math.round((monthDone / monthTotal) * 100) : 0)
        if (monthDoneByCategory.size === 0) {
          setMonthlyFocus('sem foco definido')
        } else {
          let monthTopCategory = 'geral'
          let monthTopCount = -1
          for (const [category, count] of monthDoneByCategory.entries()) {
            if (count > monthTopCount) {
              monthTopCategory = category
              monthTopCount = count
            }
          }
          setMonthlyFocus(categoryDisplayLabel(monthTopCategory).toLowerCase())
        }
      } catch {
        if (cancelled) return
        setMonthlyCompletionRate(0)
        setMonthlyFocus('sem foco definido')
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

  const doneWishCount = useMemo(() => wishItems.filter((item) => item.done).length, [wishItems])
  const chartPercents = useMemo(() => {
    const fallback = [0, 0, 0, 0]
    if (monthlyCategoryStats.length < 4) return fallback
    return monthlyCategoryStats.slice(0, 4).map((item) => Math.max(0, Math.min(100, item.percent)))
  }, [monthlyCategoryStats])

  return (
    <div className="min-w-0 space-y-4">
      <div className="flex min-w-0 items-center gap-2 text-2xl font-semibold text-zinc-900 dark:text-zinc-100 sm:text-3xl">
        <UserRound className="h-7 w-7 shrink-0 text-zinc-700 dark:text-zinc-300" />
        <span>Perfil de usuário</span>
      </div>

      <div className="grid grid-cols-1 items-start gap-4 xl:grid-cols-[220px_1fr_300px]">
        <PerfilHeroCard initials={initials} userName={userName} userEmail={userEmail} />
        <PerfilPerformanceHubCard
          monthlyCompletionRate={monthlyCompletionRate}
          monthlyCategoryStats={monthlyCategoryStats}
          chartPercents={chartPercents}
          weakestCategory={weakestCategory}
          monthlyFocus={monthlyFocus}
        />

        <div className="space-y-4">
          <PerfilWishlistMarcosCard
            wishItems={wishItems}
            newWishTitle={newWishTitle}
            newWishPrice={newWishPrice}
            onNewWishTitleChange={setNewWishTitle}
            onNewWishPriceChange={setNewWishPrice}
            onAddWishItem={() => {
              const title = newWishTitle.trim()
              if (!title) return
              setWishItems((prev) => [
                ...prev,
                { id: crypto.randomUUID(), title, price: newWishPrice.trim(), done: false },
              ])
              setNewWishTitle('')
              setNewWishPrice('')
            }}
            onToggleWishItem={(id) =>
              setWishItems((prev) =>
                prev.map((entry) => (entry.id === id ? { ...entry, done: !entry.done } : entry)),
              )
            }
          />
          <PerfilConquistasCard doneWishCount={doneWishCount} />
        </div>
      </div>
    </div>
  )
}
