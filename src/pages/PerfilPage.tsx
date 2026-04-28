import {
  UserRound,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { fetchDayDemandsForMonth } from '../api/dayDemands'
import { fetchGoals, type Goal } from '../api/goals'
import PerfilIdentidadeFocoCard from '../components/perfil/PerfilIdentidadeFocoCard'
import PerfilListaDesejosCard, { type WishItem } from '../components/perfil/PerfilListaDesejosCard'
import PerfilResumoProgressoCard, { type MonthlyCategoryStat } from '../components/perfil/PerfilResumoProgressoCard'
import PerfilResumoRapidoCard from '../components/perfil/PerfilResumoRapidoCard'
import PerfilTopMetasCard from '../components/perfil/PerfilTopMetasCard'
import { categoryDisplayLabel } from '../lib/categoryOptions'
import { getUserInitials, readTickStoredUser } from '../lib/tickUser'

const FIXED_GOAL_CATEGORIES = [
  { key: 'fitness', label: 'Fitness' },
  { key: 'financeiro', label: 'Financeiro' },
  { key: 'ler', label: 'Ler' },
  { key: 'outros', label: 'Outros' },
] as const

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
  const [activeGoalsCount, setActiveGoalsCount] = useState(0)
  const [highProgressGoalsCount, setHighProgressGoalsCount] = useState(0)
  const [topMonthlyGoals, setTopMonthlyGoals] = useState<Goal[]>([])
  const [monthlyDoneCount, setMonthlyDoneCount] = useState(0)
  const [monthlyTotalCount, setMonthlyTotalCount] = useState(0)
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

        setActiveGoalsCount(activeGoals.length)
        setHighProgressGoalsCount(activeGoals.filter((goal) => goal.progress >= 70).length)
        setTopMonthlyGoals(
          [...activeGoals]
            .sort((a, b) => b.progress - a.progress || a.title.localeCompare(b.title))
            .slice(0, 3),
        )
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
          FIXED_GOAL_CATEGORIES.map(({ key, label }) => {
            const aggregate = byCategory.get(key)
            const goals = aggregate?.goals ?? 0
            const avgPercent = goals > 0 ? Math.round((aggregate?.totalProgress ?? 0) / goals) : 0
            return { category: key, label, count: goals, percent: avgPercent }
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
        setMonthlyDoneCount(monthDone)
        setMonthlyTotalCount(monthTotal)
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
        setActiveGoalsCount(0)
        setHighProgressGoalsCount(0)
        setTopMonthlyGoals([])
        setMonthlyDoneCount(0)
        setMonthlyTotalCount(0)
        setMonthlyCompletionRate(0)
        setMonthlyFocus('sem foco definido')
        setMonthlyCategoryStats(
          FIXED_GOAL_CATEGORIES.map(({ key, label }) => ({ category: key, label, count: 0, percent: 0 })),
        )
      }
    })()

    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="min-w-0 space-y-5 sm:space-y-6">
      <div className="flex min-w-0 flex-wrap items-center gap-2 text-2xl font-semibold text-zinc-900 dark:text-zinc-100 sm:text-3xl">
        <UserRound className="h-7 w-7 shrink-0 text-zinc-700 sm:h-8 sm:w-8 dark:text-zinc-300" />
        <span className="min-w-0">Perfil de usuário</span>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="space-y-4">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-start">
            <div className="w-full xl:w-[min(100%,460px)]">
              <PerfilIdentidadeFocoCard initials={initials} userName={userName} userEmail={userEmail} />
            </div>
            <div className="w-full xl:w-[min(100%,460px)]">
              <PerfilResumoRapidoCard
                activeGoalsCount={activeGoalsCount}
                monthlyCompletionRate={monthlyCompletionRate}
                monthlyFocus={monthlyFocus}
              />
            </div>
          </div>

          <PerfilResumoProgressoCard
            monthlyCompletionRate={monthlyCompletionRate}
            highProgressGoalsCount={highProgressGoalsCount}
            activeGoalsCount={activeGoalsCount}
            monthlyDoneCount={monthlyDoneCount}
            monthlyTotalCount={monthlyTotalCount}
            monthlyCategoryStats={monthlyCategoryStats}
          />
        </div>

        <div className="space-y-4">
          <PerfilTopMetasCard topMonthlyGoals={topMonthlyGoals} />
          <PerfilListaDesejosCard
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
