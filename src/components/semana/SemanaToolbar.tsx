import { CalendarDays } from 'lucide-react'
import type { PeriodId } from '../../lib/semanaCalendar'

export type { PeriodId } from '../../lib/semanaCalendar'

const PERIOD_LABELS: Array<{ id: PeriodId; label: string }> = [
  { id: 'manha', label: 'Manhã' },
  { id: 'tarde', label: 'Tarde' },
  { id: 'noite', label: 'Noite' },
  { id: 'inteiro', label: 'Inteiro' },
]

type SemanaToolbarProps = {
  period: PeriodId
  onPeriodChange: (period: PeriodId) => void
}

export default function SemanaToolbar({ period, onPeriodChange }: SemanaToolbarProps) {
  return (
    <div className="flex shrink-0 min-w-0 flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
      <div className="min-w-0 space-y-1">
        <div className="flex min-w-0 flex-wrap items-center gap-2 text-2xl font-semibold text-zinc-900 dark:text-zinc-100 sm:text-3xl">
          <CalendarDays className="h-7 w-7 shrink-0 text-red-400 sm:h-8 sm:w-8" />
          <span className="min-w-0">Semana</span>
        </div>
      </div>

      <div className="flex shrink-0 flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-500">
            Período
          </span>
          <div className="inline-flex flex-wrap gap-1 rounded-lg border border-zinc-300/80 p-0.5 dark:border-white/15">
            {PERIOD_LABELS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => onPeriodChange(p.id)}
                className={
                  period === p.id
                    ? 'rounded-md bg-zinc-200/90 px-2 py-1 text-xs font-medium text-zinc-900 dark:bg-white/15 dark:text-zinc-100'
                    : 'rounded-md px-2 py-1 text-xs font-medium text-zinc-600 dark:text-zinc-400'
                }
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
