import { CheckCircle2, Clock3 } from 'lucide-react'
import type { MonthlyDemand } from '../../types/monthlyDemand'

type HomeTodayCardProps = {
  isLoading: boolean
  todayDemands: MonthlyDemand[]
}

export default function HomeTodayCard({ isLoading, todayDemands }: HomeTodayCardProps) {
  return (
    <section className="rounded-2xl border border-zinc-200/90 bg-white/70 p-4 shadow-sm dark:border-white/10 dark:bg-black/35">
      <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Hoje</h3>
      {isLoading ? (
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">Carregando demandas...</p>
      ) : todayDemands.length === 0 ? (
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">Sem demandas para hoje.</p>
      ) : (
        <div className="mt-3 space-y-2">
          {todayDemands.slice(0, 4).map((item, index) => (
            <div
              key={`${item.title}-${index}`}
              className="flex items-center justify-between gap-2 rounded-lg border border-zinc-300/70 bg-white/70 px-2.5 py-2 dark:border-white/10 dark:bg-white/[0.03]"
            >
              <div className="min-w-0">
                <p className={`truncate text-sm font-medium ${item.done ? 'line-through opacity-70' : ''}`}>
                  {item.title}
                </p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">{item.category || 'geral'}</p>
              </div>
              <span className="inline-flex items-center gap-1 text-xs text-zinc-500 dark:text-zinc-400">
                {item.done ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <Clock3 className="h-4 w-4" />}
                {item.startTime ?? '--:--'}
              </span>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
