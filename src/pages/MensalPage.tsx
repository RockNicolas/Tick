import { Calendar, Clock3 } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

export default function MensalPage() {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000)
    return () => window.clearInterval(id)
  }, [])

  const firstDayOfMonth = useMemo(
    () => new Date(now.getFullYear(), now.getMonth(), 1),
    [now],
  )

  const totalDays = useMemo(
    () => new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate(),
    [now],
  )

  const firstWeekday = firstDayOfMonth.getDay()

  const monthLabel = new Intl.DateTimeFormat('pt-BR', {
    month: 'long',
    year: 'numeric',
  }).format(now)

  const timeLabel = new Intl.DateTimeFormat('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(now)

  const fullDateLabel = new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(now)

  const cells = Array.from({ length: firstWeekday + totalDays }, (_, index) => {
    const dayNumber = index - firstWeekday + 1
    return dayNumber > 0 ? dayNumber : null
  })

  const monthCells = [
    ...cells,
    ...Array.from({ length: 42 - cells.length }, () => null),
  ]

  const weekDays = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SAB']

  return (
    <div className="flex h-full min-w-0 flex-col gap-4 sm:gap-5">
      <div className="flex min-w-0 flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 flex-wrap items-center gap-2 text-2xl font-semibold text-zinc-100 sm:text-3xl">
          <Calendar className="h-7 w-7 shrink-0 text-red-400 sm:h-8 sm:w-8" />
          <span className="min-w-0 capitalize">
            Mensal · {monthLabel}
          </span>
        </div>

        <div className="inline-flex items-center gap-2 rounded-full border border-red-500/30 bg-black/70 px-3 py-1.5 text-xs text-red-200 sm:text-sm">
          <span className="h-2 w-2 rounded-full bg-red-400 shadow-[0_0_12px_rgba(248,113,113,0.9)]" />
          <Clock3 className="h-4 w-4" />
          <span>{timeLabel}</span>
        </div>
      </div>

      <div className="rounded-xl border border-red-500/20 bg-black/70 px-3.5 py-3 shadow-[0_0_30px_rgba(0,0,0,0.45)] sm:px-4.5 sm:py-3.5">
        <p className="text-sm text-zinc-300">
          {fullDateLabel.charAt(0).toUpperCase() +
            fullDateLabel.slice(1)}
        </p>
        <p className="mt-1 text-[11px] uppercase tracking-[0.2em] text-red-300/90">
          Em tempo real
        </p>
      </div>

      <div className="flex min-h-0 flex-1 flex-col rounded-md border border-white/10 bg-black/60 p-2">
        <div className="grid grid-cols-7">
          {weekDays.map((day) => (
            <div
              key={day}
              className="px-1.5 py-1.5 text-center text-[13px] tracking-wide text-zinc-500 sm:py-2"
            >
              {day}
            </div>
          ))}
        </div>

        <div className="grid h-full flex-1 grid-cols-7 grid-rows-6 gap-1">
          {monthCells.map((day, index) => {
            const isToday = day === now.getDate()

            return (
              <div
                key={`${day ?? 'blank'}-${index}`}
                className="relative border border-white/10 bg-black/30 p-2"
              >
                {day ? (
                  <span
                    className={`absolute top-1 left-1 ${
                      isToday
                        ? 'inline-flex min-h-8 min-w-8 items-center justify-center rounded-full bg-red-500/90 text-base font-semibold text-zinc-50 shadow-[0_0_12px_rgba(239,68,68,0.95)] sm:min-h-9 sm:min-w-9'
                        : 'text-zinc-300 text-base font-medium'
                    }`}
                  >
                    {day}
                  </span>
                ) : (
                  <span className="absolute top-1 left-1 text-zinc-700 text-xs">
                    ·
                  </span>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}