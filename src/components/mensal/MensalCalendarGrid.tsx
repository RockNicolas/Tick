import type { DemandsByDate } from '../../api/dayDemands'

type MensalCalendarGridProps = {
  weekDays: string[]
  monthCells: Array<number | null>
  now: Date
  todayDay: number
  selectedDay: number | null
  demandsByDate: DemandsByDate
  onOpenDayDemands: (day: number) => void
}

export default function MensalCalendarGrid({
  weekDays,
  monthCells,
  now,
  todayDay,
  selectedDay,
  demandsByDate,
  onOpenDayDemands,
}: MensalCalendarGridProps) {
  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-md border border-zinc-200/90 bg-zinc-100/60 p-1.5 sm:p-2 dark:border-white/10 dark:bg-black/60">
      <div className="grid grid-cols-7">
        {weekDays.map((day) => (
          <div
            key={day}
            className="px-1.5 py-1.5 text-center text-[13px] tracking-wide text-zinc-600 sm:py-2 dark:text-zinc-500"
          >
            {day}
          </div>
        ))}
      </div>

      <div className="grid h-full flex-1 grid-cols-7 grid-rows-6 gap-0.5 sm:gap-1">
        {monthCells.map((day, index) => {
          const isToday = day === todayDay
          const isSelected = day !== null && selectedDay === day
          const dayDateKey =
            day === null
              ? ''
              : `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
          const dayDemandsCount = dayDateKey ? demandsByDate[dayDateKey]?.length ?? 0 : 0
          const dayHasDemands = dayDemandsCount > 0

          return (
            <div
              key={`${day ?? 'blank'}-${index}`}
              className={`relative border p-1 transition-colors ${
                isSelected
                  ? isToday
                    ? 'border-red-400/50 bg-red-100/80 ring-1 ring-red-300/50 dark:border-red-400/35 dark:bg-red-500/[0.08] dark:ring-red-400/25'
                    : 'border-zinc-300/90 bg-white/90 ring-1 ring-zinc-200/80 dark:border-white/20 dark:bg-white/[0.06] dark:ring-white/10'
                  : isToday && day
                    ? 'border-red-300/60 bg-red-50/70 dark:border-red-500/20 dark:bg-red-500/[0.06]'
                    : 'border-zinc-200/80 bg-white/50 dark:border-white/10 dark:bg-black/30'
              }`}
            >
              {day ? (
                <button
                  type="button"
                  onClick={() => onOpenDayDemands(day)}
                  className="group absolute inset-0 flex flex-col p-1.5 text-left transition hover:bg-black/[0.04] dark:hover:bg-white/[0.04]"
                  aria-label={`Abrir demandas do dia ${day}`}
                >
                  <span
                    className={`self-start tabular-nums text-[0.95rem] font-semibold leading-none ${
                      isToday
                        ? 'rounded-md bg-red-200/80 px-2 py-1 text-red-900 ring-1 ring-inset ring-red-400/40 dark:bg-red-500/15 dark:text-red-100 dark:ring-red-400/35'
                        : 'py-1 text-zinc-700 dark:text-zinc-300'
                    }`}
                  >
                    {day}
                  </span>

                  {dayHasDemands ? (
                    <span className="mt-auto inline-flex h-5 min-w-5 self-end items-center justify-center rounded-full border border-zinc-300/80 bg-zinc-200/80 px-1.5 text-[10px] font-semibold text-zinc-800 dark:border-white/15 dark:bg-white/10 dark:text-zinc-200">
                      {dayDemandsCount}
                    </span>
                  ) : null}
                </button>
              ) : (
                <span className="absolute top-1 left-1 text-xs text-zinc-400 dark:text-zinc-700">·</span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
