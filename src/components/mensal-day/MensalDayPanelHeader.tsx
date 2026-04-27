import { X } from 'lucide-react'

type MensalDayPanelHeaderProps = {
  dateLabel: string
  onClose: () => void
}

export default function MensalDayPanelHeader({ dateLabel, onClose }: MensalDayPanelHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <p className="text-xs uppercase tracking-[0.2em] text-zinc-900 dark:text-red-300/90">Demandas do dia</p>
        <h2 className="mt-1 break-words text-lg font-semibold capitalize text-zinc-900 dark:text-zinc-100">
          {dateLabel}
        </h2>
      </div>
      <button
        type="button"
        className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-zinc-300/80 text-zinc-600 transition hover:bg-black/5 dark:border-white/10 dark:text-zinc-300 dark:hover:bg-white/10"
        onClick={onClose}
        aria-label="Fechar lateral"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}
