import { CircleEllipsis, Plus } from 'lucide-react'
import type { Goal } from '../../api/goals'
import { formatGoalDate } from '../../lib/goalFormat'

type MetasMilestonesColumnProps = {
  milestones: Goal[]
  onAddClick: () => void
}

export default function MetasMilestonesColumn({ milestones, onAddClick }: MetasMilestonesColumnProps) {
  return (
    <section className="flex flex-col gap-3">
      <div className="rounded-2xl border border-zinc-200/70 bg-white/60 p-4 dark:border-white/10 dark:bg-black/30">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Milestones Importantes</h2>
          <CircleEllipsis className="h-4 w-4 text-zinc-500 dark:text-zinc-400" aria-hidden />
        </div>
        <div className="space-y-2">
          {milestones.length === 0 ? (
            <p className="text-sm text-zinc-600 dark:text-zinc-400">Sem milestones no momento.</p>
          ) : (
            milestones.map((goal) => (
              <article
                key={goal.id}
                className="rounded-xl border border-zinc-200/80 bg-white/75 px-3 py-2 dark:border-white/10 dark:bg-white/5"
              >
                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{goal.title}</p>
                <p className="text-xs text-zinc-600 dark:text-zinc-400">Prazo: {formatGoalDate(goal.dueDate)}</p>
              </article>
            ))
          )}
        </div>
      </div>

      <button
        type="button"
        onClick={onAddClick}
        className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl border border-teal-300/40 bg-teal-200/30 px-4 py-2.5 text-base font-medium text-zinc-900 transition hover:bg-teal-200/40 dark:bg-teal-400/20 dark:text-zinc-100 dark:hover:bg-teal-400/30"
      >
        <Plus className="h-5 w-5" aria-hidden />
        Adicionar Meta
      </button>
    </section>
  )
}
