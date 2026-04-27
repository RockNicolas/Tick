import type { MonthlyDemand } from '../../types/monthlyDemand'
import { demandHasTimeRange } from '../../lib/timeRange'

type MensalDayDemandListProps = {
  demands: MonthlyDemand[]
  onToggleDone: (index: number) => void
  onOpenEdit: (index: number) => void
}

export default function MensalDayDemandList({ demands, onToggleDone, onOpenEdit }: MensalDayDemandListProps) {
  if (demands.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-zinc-300/70 p-4 text-sm text-zinc-600 dark:border-white/10 dark:text-zinc-400">
        Nenhuma demanda cadastrada para este dia.
      </p>
    )
  }

  return (
    <ul className="space-y-2">
      {demands.map((demand, index) => (
        <li key={`demand-${index}`}>
          <div className="flex items-start gap-2 rounded-xl border border-zinc-200/90 bg-white/80 p-2 transition hover:border-red-300/60 hover:bg-red-50/40 dark:border-white/10 dark:bg-black/30 dark:hover:border-red-400/30 dark:hover:bg-black/45">
            <button
              type="button"
              aria-label={
                demand.done ? 'Marcar demanda como pendente' : 'Marcar demanda como concluída'
              }
              onClick={() => onToggleDone(index)}
              className={`mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded border transition ${
                demand.done
                  ? 'border-emerald-600/50 bg-emerald-100/90 text-zinc-900 dark:border-emerald-400/70 dark:bg-emerald-500/20 dark:text-emerald-200'
                  : 'border-zinc-300/80 bg-zinc-100/80 text-transparent hover:border-emerald-500/50 dark:border-white/25 dark:bg-black/20 dark:hover:border-emerald-400/50'
              }`}
            >
              ✓
            </button>

            <button type="button" onClick={() => onOpenEdit(index)} className="min-w-0 flex-1 text-left">
              <p
                className={`text-sm font-semibold ${
                  demand.done ? 'text-zinc-500 line-through dark:text-zinc-400' : 'text-zinc-900 dark:text-zinc-100'
                }`}
              >
                {demand.title}
              </p>
              <p className="mt-0.5 text-[11px] uppercase tracking-wide text-zinc-500 dark:text-zinc-500">
                {demand.category || 'geral'}
                {demand.priority ? ` · ${demand.priority}` : ''}
                {demandHasTimeRange(demand) ? ` · ${demand.startTime}–${demand.endTime}` : ''}
              </p>
              {demand.note ? (
                <p
                  className={`mt-1 max-h-[4.5rem] overflow-hidden whitespace-pre-wrap break-words text-xs leading-relaxed ${
                    demand.done ? 'text-zinc-500 dark:text-zinc-500' : 'text-zinc-600 dark:text-zinc-400'
                  }`}
                >
                  {demand.note}
                </p>
              ) : null}
            </button>
          </div>
        </li>
      ))}
    </ul>
  )
}
