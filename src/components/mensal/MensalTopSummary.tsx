import { Calendar, Clock3 } from 'lucide-react'

type MensalTopSummaryProps = {
  monthLabel: string
  timeLabel: string
  fullDateLabel: string
}

export default function MensalTopSummary({
  monthLabel,
  timeLabel,
  fullDateLabel,
}: MensalTopSummaryProps) {
  return (
    <>
      <div className="flex min-w-0 flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 flex-wrap items-center gap-2 text-2xl font-semibold text-zinc-900 dark:text-zinc-100 sm:text-3xl">
          <Calendar className="h-7 w-7 shrink-0 text-red-400 sm:h-8 sm:w-8" />
          <span className="min-w-0 capitalize">Mensal · {monthLabel}</span>
        </div>

        <div className="inline-flex items-center gap-2 rounded-full border border-red-400/40 bg-red-50/90 px-3 py-1.5 text-xs text-red-800 sm:text-sm dark:border-red-500/30 dark:bg-black/70 dark:text-red-200">
          <span className="h-2 w-2 rounded-full bg-red-400 shadow-[0_0_12px_rgba(248,113,113,0.9)]" />
          <Clock3 className="h-4 w-4" />
          <span>{timeLabel}</span>
        </div>
      </div>

      <div className="rounded-xl border border-red-300/50 bg-white/80 px-3.5 py-3 shadow-sm sm:px-4.5 sm:py-3.5 dark:border-red-500/20 dark:bg-black/70 dark:shadow-[0_0_30px_rgba(0,0,0,0.45)]">
        <p className="text-sm text-zinc-700 dark:text-zinc-300">
          {fullDateLabel.charAt(0).toUpperCase() + fullDateLabel.slice(1)}
        </p>
        <p className="mt-1 text-[11px] uppercase tracking-[0.2em] text-red-300/90">
          Em tempo real
        </p>
      </div>
    </>
  )
}
