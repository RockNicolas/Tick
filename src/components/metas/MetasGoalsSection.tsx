import type { Goal, GoalStatus } from '../../api/goals'
import { METAS_TABS } from '../../constants/metasTabs'
import MetasGoalCard from './MetasGoalCard'

type MetasGoalsSectionProps = {
  selectedTab: GoalStatus
  onTabChange: (tab: GoalStatus) => void
  isLoading: boolean
  goals: Goal[]
  onConcludeGoal: (goalId: string) => void
  onOpenEditGoal: (goal: Goal) => void
}

export default function MetasGoalsSection({
  selectedTab,
  onTabChange,
  isLoading,
  goals,
  onConcludeGoal,
  onOpenEditGoal,
}: MetasGoalsSectionProps) {
  return (
    <section className="rounded-2xl border border-zinc-200/70 bg-white/60 p-4 dark:border-white/10 dark:bg-black/30">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Metas</h2>
        <div className="rounded-xl border border-zinc-200/80 bg-white/70 p-1 text-xs dark:border-white/10 dark:bg-white/5">
          {METAS_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={
                selectedTab === tab.id
                  ? 'rounded-lg bg-zinc-200/90 px-2.5 py-1 text-zinc-900 dark:bg-white/15 dark:text-zinc-100'
                  : 'px-2 py-1 text-zinc-600 dark:text-zinc-400'
              }
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2.5">
        {isLoading ? <p className="text-sm text-zinc-600 dark:text-zinc-400">Carregando metas...</p> : null}
        {!isLoading && goals.length === 0 ? (
          <p className="text-sm text-zinc-600 dark:text-zinc-400">Nenhuma meta cadastrada nessa aba.</p>
        ) : null}
        {!isLoading
          ? goals.map((goal) => (
              <MetasGoalCard key={goal.id} goal={goal} onConclude={onConcludeGoal} onEdit={onOpenEditGoal} />
            ))
          : null}
      </div>
    </section>
  )
}
