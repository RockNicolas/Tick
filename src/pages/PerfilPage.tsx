import {
  UserRound,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import PerfilConquistasCard from '../components/perfil/PerfilConquistasCard'
import PerfilHeroCard from '../components/perfil/PerfilHeroCard'
import PerfilPerformanceHubCard from '../components/perfil/PerfilPerformanceHubCard'
import { type WishItem } from '../components/perfil/types'
import PerfilWishlistMarcosCard from '../components/perfil/PerfilWishlistMarcosCard'
import { fetchGoals } from '../api/goals'
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
        const goalsCount = activeGoals.length
        const totalProgress = activeGoals.reduce((sum, goal) => sum + Math.max(0, Math.min(100, goal.progress)), 0)
        setMonthlyCompletionRate(goalsCount > 0 ? Math.round(totalProgress / goalsCount) : 0)

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
    <div className="min-w-0 space-y-4 overflow-x-hidden">
      <div className="flex min-w-0 items-center gap-2 text-2xl font-semibold text-zinc-900 dark:text-zinc-100 sm:text-3xl">
        <UserRound className="h-7 w-7 shrink-0 text-zinc-700 dark:text-zinc-300" />
        <span>Perfil de usuário</span>
      </div>

      <div className="grid grid-cols-1 items-start gap-4 xl:grid-cols-[220px_minmax(0,1fr)_280px]">
        <div>
          <PerfilHeroCard initials={initials} userName={userName} userEmail={userEmail} />
          <div className="pt-11">
            <PerfilConquistasCard doneWishCount={doneWishCount} />
          </div>
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

        <div className="min-w-0">
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
        </div>
      </div>
    </div>
  )
}
