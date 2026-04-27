import { createElement } from 'react'
import type { Goal } from '../../api/goals'
import { formatGoalDate, formatGoalDateTime } from '../../lib/goalFormat'
import { getMetasCategoryIcon } from './metasCategoryIcons'

type MetasGoalCardProps = {
  goal: Goal
  onConclude: (goalId: string) => void
  onEdit: (goal: Goal) => void
}

export default function MetasGoalCard({ goal, onConclude, onEdit }: MetasGoalCardProps) {
  return (
    <article className="rounded-xl border border-zinc-200/80 bg-white/80 p-2.5 dark:border-white/10 dark:bg-white/5">
      <div className="flex items-center gap-3">
        <div className="grid h-8 w-8 place-items-center rounded-full bg-teal-500/20">
          {createElement(getMetasCategoryIcon(goal.category), {
            className: 'h-4 w-4 text-teal-300',
            'aria-hidden': true,
          })}
        </div>
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-center justify-between gap-2">
            <p className="truncate font-medium text-zinc-900 dark:text-zinc-100">{goal.title}</p>
            <p className="text-sm text-zinc-700 dark:text-zinc-300">{goal.progress}%</p>
          </div>
          <p className="mb-1 text-[11px] uppercase tracking-wide text-zinc-500 dark:text-zinc-500">
            {goal.category} · alvo {goal.targetCount}
          </p>
          <div className="h-1.5 w-full rounded-full bg-zinc-300/60 dark:bg-zinc-700/60">
            <div
              className="h-1.5 rounded-full bg-teal-400"
              style={{ width: `${goal.progress}%` }}
              aria-hidden
            />
          </div>
        </div>
        <p className="max-w-[7.5rem] shrink-0 text-right text-xs text-zinc-600 dark:text-zinc-400">
          {goal.status === 'completed' ? (
            <>
              Concluída
              <br />
              {formatGoalDateTime(goal.completedAt ?? goal.updatedAt)}
            </>
          ) : (
            formatGoalDate(goal.dueDate)
          )}
        </p>
        <div className="flex items-center gap-2">
          {goal.status === 'active' || goal.status === 'late' ? (
            <button
              type="button"
              onClick={() => onConclude(goal.id)}
              className="rounded-xl border border-zinc-300/90 bg-zinc-100/90 px-3 py-1.5 text-sm font-medium text-zinc-800 dark:border-white/10 dark:bg-white/10 dark:text-zinc-100"
            >
              Concluir
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => onEdit(goal)}
            className="rounded-xl border border-zinc-300/90 bg-zinc-100/90 px-3 py-1.5 text-sm font-medium text-zinc-800 dark:border-white/10 dark:bg-white/10 dark:text-zinc-100"
          >
            Editar
          </button>
        </div>
      </div>
    </article>
  )
}
