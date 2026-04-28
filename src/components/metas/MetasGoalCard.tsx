import { createElement } from 'react'
import type { Goal } from '../../api/goals'
import { categoryDisplayLabel } from '../../lib/categoryOptions'
import { formatGoalDate, formatGoalDateTime } from '../../lib/goalFormat'
import { getMetasCategoryIcon } from './metasCategoryIcons'

type MetasGoalCardProps = {
  goal: Goal
  onConclude: (goalId: string) => void
  onEdit: (goal: Goal) => void
}

export default function MetasGoalCard({ goal, onConclude, onEdit }: MetasGoalCardProps) {
  const dueDateText = formatGoalDate(goal.dueDate)
  const dueDateMs = goal.dueDate ? new Date(goal.dueDate).getTime() : Number.NaN
  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)
  const hasDueDate = Number.isFinite(dueDateMs)
  const daysUntilDue = hasDueDate
    ? Math.floor((dueDateMs - todayStart.getTime()) / (1000 * 60 * 60 * 24))
    : null
  const dueSoonOrLate =
    goal.status !== 'completed' && daysUntilDue !== null && daysUntilDue <= 3

  return (
    <article className="rounded-xl border border-zinc-200/80 bg-white/80 p-2.5 dark:border-white/10 dark:bg-white/5">
      <div className="flex items-start gap-3">
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
            {categoryDisplayLabel(goal.category)} · alvo {goal.targetCount}
          </p>
          <div className="h-1.5 w-full rounded-full bg-zinc-300/60 dark:bg-zinc-700/60">
            <div
              className="h-1.5 rounded-full bg-teal-400"
              style={{ width: `${goal.progress}%` }}
              aria-hidden
            />
          </div>
        </div>
        <div className="shrink-0">
          <p
            className={`mb-1 text-left text-xs sm:text-right ${
              dueSoonOrLate ? 'text-red-600 dark:text-red-400' : 'text-zinc-600 dark:text-zinc-400'
            }`}
          >
            {goal.status === 'completed' ? (
              <>
                Concluída
                <br />
                {formatGoalDateTime(goal.completedAt ?? goal.updatedAt)}
              </>
            ) : (
              dueDateText
            )}
          </p>
          <div className="flex flex-col gap-1.5">
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
      </div>
    </article>
  )
}
