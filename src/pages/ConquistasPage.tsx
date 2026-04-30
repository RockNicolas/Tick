import { BookOpen, CircleDollarSign, Dumbbell, Gem, Tag, Trophy } from 'lucide-react'
import type { ComponentType } from 'react'
import type { LucideProps } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { fetchUserAchievements, unlockAchievement } from '../api/achievements'
import { fetchGoals } from '../api/goals'
import { fetchWishlist } from '../api/wishlist'
import ConquistasNextSection from '../components/conquistas/ConquistasNextSection'
import ConquistasUnlockedSection from '../components/conquistas/ConquistasUnlockedSection'
import type { MedalProgress } from '../components/conquistas/types'

type MedalDefinition = {
  id: string
  title: string
  description: string
  icon: ComponentType<LucideProps>
  colorClass: string
  target: number
}

const MEDAL_DEFINITIONS: MedalDefinition[] = [
  {
    id: 'goal',
    title: 'Meta de Ouro',
    description: 'Concluir ao menos 1 meta.',
    icon: Trophy,
    colorClass: 'bg-amber-500/20 text-amber-300',
    target: 1,
  },
  {
    id: 'fit',
    title: 'Energia Fitness',
    description: 'Atingir 70% em metas de Fitness.',
    icon: Dumbbell,
    colorClass: 'bg-cyan-500/20 text-cyan-300',
    target: 70,
  },
  {
    id: 'money',
    title: 'Bolso em Ordem',
    description: 'Atingir 70% em metas Financeiras.',
    icon: CircleDollarSign,
    colorClass: 'bg-emerald-500/20 text-emerald-300',
    target: 70,
  },
  {
    id: 'read',
    title: 'Mente em Leitura',
    description: 'Atingir 70% em metas de Leitura.',
    icon: BookOpen,
    colorClass: 'bg-violet-500/20 text-violet-300',
    target: 70,
  },
  {
    id: 'tag',
    title: 'Primeiro Desejo',
    description: 'Concluir 1 item da wishlist.',
    icon: Tag,
    colorClass: 'bg-sky-500/20 text-sky-300',
    target: 1,
  },
  {
    id: 'gem',
    title: 'Colecionador',
    description: 'Concluir 10 itens da wishlist.',
    icon: Gem,
    colorClass: 'bg-pink-500/20 text-pink-300',
    target: 10,
  },
]

function normalizeGoalCategory(raw: string) {
  const value = raw.trim().toLowerCase()
  if (value === 'fitness') return 'fitness'
  if (value === 'financas' || value === 'finanças' || value === 'financeiro') return 'financeiro'
  if (value === 'leitura' || value === 'ler') return 'ler'
  return 'outros'
}

export default function ConquistasPage() {
  const [completedGoalsCount, setCompletedGoalsCount] = useState(0)
  const [doneWishCount, setDoneWishCount] = useState(0)
  const [fitnessPercent, setFitnessPercent] = useState(0)
  const [financePercent, setFinancePercent] = useState(0)
  const [readingPercent, setReadingPercent] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [savedUnlockedMedalIds, setSavedUnlockedMedalIds] = useState<string[]>([])

  useEffect(() => {
    let cancelled = false

    ;(async () => {
      setIsLoading(true)
      try {
        const [activeGoals, completedGoals, wishlist] = await Promise.all([
          fetchGoals('active'),
          fetchGoals('completed'),
          fetchWishlist(),
        ])
        if (cancelled) return

        setCompletedGoalsCount(completedGoals.length)
        setDoneWishCount(wishlist.filter((item) => item.done).length)

        const byCategory = new Map<string, { total: number; count: number }>()
        for (const goal of activeGoals) {
          const category = normalizeGoalCategory(goal.category || 'outros')
          const prev = byCategory.get(category) ?? { total: 0, count: 0 }
          byCategory.set(category, {
            total: prev.total + Math.max(0, Math.min(100, goal.progress)),
            count: prev.count + 1,
          })
        }

        const avg = (category: string) => {
          const value = byCategory.get(category)
          if (!value || value.count === 0) return 0
          return Math.round(value.total / value.count)
        }

        setFitnessPercent(avg('fitness'))
        setFinancePercent(avg('financeiro'))
        setReadingPercent(avg('ler'))
      } catch {
        if (cancelled) return
        setCompletedGoalsCount(0)
        setDoneWishCount(0)
        setFitnessPercent(0)
        setFinancePercent(0)
        setReadingPercent(0)
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    })()

    return () => {
      cancelled = true
    }
  }, [])

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
  }, [])

  const liveUnlockedMedalIds = useMemo(() => {
    const ids: string[] = []
    if (completedGoalsCount >= 1) ids.push('goal')
    if (fitnessPercent >= 70) ids.push('fit')
    if (financePercent >= 70) ids.push('money')
    if (readingPercent >= 70) ids.push('read')
    if (doneWishCount >= 1) ids.push('tag')
    if (doneWishCount >= 10) ids.push('gem')
    return ids
  }, [completedGoalsCount, fitnessPercent, financePercent, readingPercent, doneWishCount])

  useEffect(() => {
    if (liveUnlockedMedalIds.length === 0) return
    const missing = liveUnlockedMedalIds.filter((id) => !savedUnlockedMedalIds.includes(id))
    if (missing.length === 0) return
    ;(async () => {
      try {
        await Promise.all(missing.map((id) => unlockAchievement(id)))
        setSavedUnlockedMedalIds((prev) => [...new Set([...prev, ...missing])])
      } catch {
        // nao bloqueia tela de conquistas
      }
    })()
  }, [liveUnlockedMedalIds, savedUnlockedMedalIds])

  const unlockedSet = useMemo(
    () => new Set([...savedUnlockedMedalIds, ...liveUnlockedMedalIds]),
    [savedUnlockedMedalIds, liveUnlockedMedalIds],
  )

  const medals = useMemo<MedalProgress[]>(() => {
    const currentById: Record<string, number> = {
      goal: completedGoalsCount,
      fit: fitnessPercent,
      money: financePercent,
      read: readingPercent,
      tag: doneWishCount,
      gem: doneWishCount,
    }
    return MEDAL_DEFINITIONS.map((medal) => {
      const current = currentById[medal.id] ?? 0
      const percent = Math.max(0, Math.min(100, Math.round((current / medal.target) * 100)))
      return {
        ...medal,
        current,
        percent,
        unlocked: unlockedSet.has(medal.id),
      }
    })
  }, [completedGoalsCount, fitnessPercent, financePercent, readingPercent, doneWishCount, unlockedSet])

  const unlockedMedals = medals.filter((item) => item.unlocked)
  const lockedMedals = medals.filter((item) => !item.unlocked)

  return (
    <div className="min-w-0 space-y-6 sm:space-y-7">
      <div className="flex min-w-0 flex-wrap items-center gap-2 text-2xl font-semibold text-zinc-900 dark:text-zinc-100 sm:text-3xl">
        <Trophy className="h-7 w-7 shrink-0 text-amber-500 dark:text-amber-300" />
        <span className="min-w-0">Conquistas</span>
      </div>

      <ConquistasUnlockedSection isLoading={isLoading} unlockedMedals={unlockedMedals} />
      <ConquistasNextSection lockedMedals={lockedMedals} />
    </div>
  )
}
