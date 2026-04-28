import {
  Focus,
  NotepadText,
  Trophy,
  UserRound,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { fetchDayDemandsForMonth } from '../api/dayDemands'
import { fetchGoals, type Goal } from '../api/goals'
import SettingsSectionCard from '../components/settings/SettingsSectionCard'
import { categoryDisplayLabel } from '../lib/categoryOptions'
import { getUserInitials, readTickStoredUser } from '../lib/tickUser'

type MonthlyCategoryStat = {
  category: string
  label: string
  count: number
  percent: number
}

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
  const [activeGoalsProgressAvg, setActiveGoalsProgressAvg] = useState(0)
  const [highProgressGoalsCount, setHighProgressGoalsCount] = useState(0)
  const [topMonthlyGoals, setTopMonthlyGoals] = useState<Goal[]>([])
  const [monthlyDoneCount, setMonthlyDoneCount] = useState(0)
  const [monthlyTotalCount, setMonthlyTotalCount] = useState(0)
  const [monthlyCompletionRate, setMonthlyCompletionRate] = useState(0)
  const [monthlyFocus, setMonthlyFocus] = useState('sem foco definido')
  const [monthlyCategoryStats, setMonthlyCategoryStats] = useState<MonthlyCategoryStat[]>([])

  useEffect(() => {
    let cancelled = false

    ;(async () => {
      try {
        const activeGoals = await fetchGoals('active')

        if (cancelled) return

        setActiveGoalsCount(activeGoals.length)
        const avgProgress =
          activeGoals.length > 0
            ? Math.round(activeGoals.reduce((sum, goal) => sum + goal.progress, 0) / activeGoals.length)
            : 0
        setActiveGoalsProgressAvg(avgProgress)
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
        setActiveGoalsProgressAvg(0)
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

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.2fr_1fr]">
        <SettingsSectionCard title="Identidade e foco" icon={Focus}>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="inline-flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border border-zinc-300/80 bg-zinc-100 text-xl font-semibold text-zinc-800 dark:border-white/15 dark:bg-white/10 dark:text-zinc-100">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="truncate text-base font-semibold text-zinc-900 dark:text-zinc-100">{userName}</p>
              <p className="truncate text-sm text-zinc-600 dark:text-zinc-400">{userEmail}</p>
              <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-500">Membro desde abril de 2026</p>
            </div>
          </div>
        </SettingsSectionCard>
        <SettingsSectionCard title="Resumo rápido" icon={Trophy}>
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-xl border border-zinc-200/80 bg-white/70 p-2 dark:border-white/10 dark:bg-white/5">
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">Metas ativas</p>
              <p className="text-base font-semibold text-zinc-900 dark:text-zinc-100">{activeGoalsCount}</p>
            </div>
            <div className="rounded-xl border border-zinc-200/80 bg-white/70 p-2 dark:border-white/10 dark:bg-white/5">
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">Taxa mensal</p>
              <p className="text-base font-semibold text-zinc-900 dark:text-zinc-100">{monthlyCompletionRate}%</p>
            </div>
            <div className="rounded-xl border border-zinc-200/80 bg-white/70 p-2 dark:border-white/10 dark:bg-white/5">
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">Foco</p>
              <p className="truncate text-base font-semibold text-zinc-900 dark:text-zinc-100">{monthlyFocus}</p>
            </div>
          </div>
        </SettingsSectionCard>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <SettingsSectionCard title="Resumo do progresso" icon={Trophy}>
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-2">
              <div className="rounded-xl border border-zinc-200/80 bg-white/70 p-2 dark:border-white/10 dark:bg-white/5">
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400">Média global</p>
                <p className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                  {monthlyCompletionRate}%
                </p>
              </div>
              <div className="rounded-xl border border-zinc-200/80 bg-white/70 p-2 dark:border-white/10 dark:bg-white/5">
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400">Bom avanço</p>
                <p className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                  {highProgressGoalsCount}
                </p>
              </div>
              <div className="rounded-xl border border-zinc-200/80 bg-white/70 p-2 dark:border-white/10 dark:bg-white/5">
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400">Exigem foco</p>
                <p className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                  {Math.max(0, activeGoalsCount - highProgressGoalsCount)}
                </p>
              </div>
            </div>

            <div>
              <div className="mb-1 flex items-center justify-between text-xs text-zinc-600 dark:text-zinc-400">
                <span>Evolução mensal</span>
                <span>
                  {monthlyDoneCount}/{monthlyTotalCount}
                </span>
              </div>
              <div className="h-2 rounded-full bg-zinc-200/80 dark:bg-white/10">
                <div
                  className="h-2 rounded-full bg-emerald-500 transition-all"
                  style={{ width: `${Math.max(0, Math.min(100, monthlyCompletionRate))}%` }}
                />
              </div>
            </div>

            <div className="rounded-xl border border-zinc-200/80 bg-white/60 p-2 dark:border-white/10 dark:bg-white/5">
              <p className="text-xs text-zinc-600 dark:text-zinc-400">
                Categorias do mês: {monthlyCategoryStats.map((item) => item.label).join(' · ')}
              </p>
            </div>
          </div>
        </SettingsSectionCard>

        <SettingsSectionCard title="Top metas do mês" icon={NotepadText}>
          <div className="space-y-2.5">
            {topMonthlyGoals.length === 0 ? (
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Você ainda não tem metas ativas neste mês.</p>
            ) : (
              topMonthlyGoals.map((goal) => (
                <div
                  key={goal.id}
                  className="rounded-xl border border-zinc-200/80 bg-white/70 p-2.5 dark:border-white/10 dark:bg-white/5"
                >
                  <div className="mb-1 flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-100">{goal.title}</p>
                    <p className="shrink-0 text-xs text-zinc-600 dark:text-zinc-400">{goal.progress}%</p>
                  </div>
                  <div className="h-2 rounded-full bg-zinc-200/80 dark:bg-white/10">
                    <div
                      className="h-2 rounded-full bg-emerald-500 transition-all"
                      style={{ width: `${Math.max(0, Math.min(100, goal.progress))}%` }}
                    />
                  </div>
                  <p className="mt-1 text-[11px] text-zinc-500 dark:text-zinc-400">
                    {categoryDisplayLabel(goal.category)} · {goal.progress >= 70 ? 'Quase lá!' : 'Em andamento'}
                  </p>
                </div>
              ))
            )}
          </div>
        </SettingsSectionCard>
      </div>
    </div>
  )
}
