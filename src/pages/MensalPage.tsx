import { Calendar, Clock3 } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  fetchDayDemandsForMonth,
  pickMonthEntries,
  saveDayDemandsForMonth,
  stripMonthKeys,
  type DemandsByDate,
} from '../api/dayDemands'
import MensalDayDemandsPanel, {
  type MonthlyDemand,
} from '../components/MensalDayDemandsPanel'
import { useTickSettingsVersion } from '../hooks/useTickSettings'
import {
  readAutoOpenTodayPanel,
  readShowClockSeconds,
} from '../lib/tickSettings'

export default function MensalPage() {
  const [now, setNow] = useState(() => new Date())
  const [selectedDay, setSelectedDay] = useState<number | null>(null)
  const [demandsByDate, setDemandsByDate] = useState<DemandsByDate>({})
  const [newDemandTitle, setNewDemandTitle] = useState('')
  const [newDemandCategory, setNewDemandCategory] = useState('geral')
  const [newDemandNote, setNewDemandNote] = useState('')
  const [newDemandStartTime, setNewDemandStartTime] = useState('')
  const [newDemandEndTime, setNewDemandEndTime] = useState('')

  const tickSettingsVersion = useTickSettingsVersion()

  const calendarYear = now.getFullYear()
  const calendarMonth = now.getMonth() + 1

  const monthHydratedRef = useRef<string | null>(null)
  const skipNextSaveRef = useRef(false)

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000)
    return () => window.clearInterval(id)
  }, [])

  useEffect(() => {
    const key = `${calendarYear}-${calendarMonth}`
    let cancelled = false
    monthHydratedRef.current = null

    ;(async () => {
      try {
        const remote = await fetchDayDemandsForMonth(calendarYear, calendarMonth)
        if (cancelled) return
        skipNextSaveRef.current = true
        setDemandsByDate((previous) => ({
          ...stripMonthKeys(previous, calendarYear, calendarMonth),
          ...remote,
        }))
        monthHydratedRef.current = key
      } catch (error) {
        console.error('[Mensal] Falha ao carregar demandas do servidor:', error)
        monthHydratedRef.current = key
      }
    })()

    return () => {
      cancelled = true
    }
  }, [calendarYear, calendarMonth])

  useEffect(() => {
    if (monthHydratedRef.current !== `${calendarYear}-${calendarMonth}`) return

    if (skipNextSaveRef.current) {
      skipNextSaveRef.current = false
      return
    }

    const payload = pickMonthEntries(
      demandsByDate,
      calendarYear,
      calendarMonth,
    )

    const handle = window.setTimeout(() => {
      saveDayDemandsForMonth(calendarYear, calendarMonth, payload).catch(
        (error) => {
          console.error('[Mensal] Falha ao salvar demandas no servidor:', error)
        },
      )
    }, 600)

    return () => window.clearTimeout(handle)
  }, [demandsByDate, calendarYear, calendarMonth])

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

  const timeLabel = useMemo(() => {
    const showSeconds = readShowClockSeconds()
    return new Intl.DateTimeFormat('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      ...(showSeconds ? { second: '2-digit' as const } : {}),
    }).format(now)
  }, [now, tickSettingsVersion])

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

  const todayDay = now.getDate()
  const todayDateKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(todayDay).padStart(2, '0')}`
  const todayDemandsCount = demandsByDate[todayDateKey]?.length ?? 0

  const selectedDateKey =
    selectedDay === null
      ? null
      : `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`

  const selectedDateLabel =
    selectedDay === null
      ? ''
      : new Intl.DateTimeFormat('pt-BR', {
          weekday: 'long',
          day: '2-digit',
          month: 'long',
          year: 'numeric',
        }).format(new Date(now.getFullYear(), now.getMonth(), selectedDay))

  const selectedDemands =
    selectedDateKey === null ? [] : demandsByDate[selectedDateKey] ?? []

  const closeDrawer = useCallback(() => {
    setSelectedDay(null)
  }, [])

  useEffect(() => {
    if (selectedDay === null) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeDrawer()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [selectedDay, closeDrawer])

  const openDayDemands = (day: number) => {
    setSelectedDay(day)
    setNewDemandTitle('')
    setNewDemandCategory('geral')
    setNewDemandNote('')
    setNewDemandStartTime('')
    setNewDemandEndTime('')
  }

  const addDemand = () => {
    const title = newDemandTitle.trim()
    if (!title || selectedDateKey === null) return

    const note = newDemandNote.trim()
    const category = newDemandCategory.trim() || 'geral'
    const st = newDemandStartTime.trim()
    const et = newDemandEndTime.trim()
    const startTime = st && et ? st : null
    const endTime = st && et ? et : null

    setDemandsByDate((previous) => ({
      ...previous,
      [selectedDateKey]: [
        ...(previous[selectedDateKey] ?? []),
        { title, category, note, done: false, startTime, endTime },
      ],
    }))
    setNewDemandTitle('')
    setNewDemandCategory('geral')
    setNewDemandNote('')
    setNewDemandStartTime('')
    setNewDemandEndTime('')
  }

  const updateDemand = (demandIndex: number, next: MonthlyDemand) => {
    if (selectedDateKey === null) return
    const title = next.title.trim()
    if (!title) return

    setDemandsByDate((previous) => {
      const list = [...(previous[selectedDateKey] ?? [])]
      if (demandIndex < 0 || demandIndex >= list.length) return previous
      const st = (next.startTime ?? '').trim()
      const et = (next.endTime ?? '').trim()
      list[demandIndex] = {
        title,
        category: next.category.trim() || 'geral',
        note: next.note.trim(),
        done: Boolean(next.done),
        startTime: st && et ? st : null,
        endTime: st && et ? et : null,
      }
      return { ...previous, [selectedDateKey]: list }
    })
  }

  const toggleDemandDone = (demandIndex: number) => {
    if (selectedDateKey === null) return
    setDemandsByDate((previous) => {
      const list = [...(previous[selectedDateKey] ?? [])]
      if (demandIndex < 0 || demandIndex >= list.length) return previous
      const current = list[demandIndex]
      list[demandIndex] = { ...current, done: !current.done }
      return { ...previous, [selectedDateKey]: list }
    })
  }

  const removeDemand = (demandIndex: number) => {
    if (selectedDateKey === null) return
    setDemandsByDate((previous) => {
      const nextList = (previous[selectedDateKey] ?? []).filter(
        (_, index) => index !== demandIndex,
      )

      if (nextList.length === 0) {
        const { [selectedDateKey]: _, ...rest } = previous
        return rest
      }

      return {
        ...previous,
        [selectedDateKey]: nextList,
      }
    })
  }

  useEffect(() => {
    if (!readAutoOpenTodayPanel()) return
    if (todayDemandsCount > 0) {
      setSelectedDay(todayDay)
    }
  }, [todayDay, todayDemandsCount, tickSettingsVersion])

  return (
    <div className="flex h-full min-h-0 min-w-0 gap-2 lg:gap-4">
      <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-4 sm:gap-5">
        <div className="flex min-w-0 flex-wrap items-center justify-between gap-3">
          <div className="flex min-w-0 flex-wrap items-center gap-2 text-2xl font-semibold text-zinc-900 dark:text-zinc-100 sm:text-3xl">
            <Calendar className="h-7 w-7 shrink-0 text-red-400 sm:h-8 sm:w-8" />
            <span className="min-w-0 capitalize">
              Mensal · {monthLabel}
            </span>
          </div>

          <div className="inline-flex items-center gap-2 rounded-full border border-red-400/40 bg-red-50/90 px-3 py-1.5 text-xs text-red-800 sm:text-sm dark:border-red-500/30 dark:bg-black/70 dark:text-red-200">
            <span className="h-2 w-2 rounded-full bg-red-400 shadow-[0_0_12px_rgba(248,113,113,0.9)]" />
            <Clock3 className="h-4 w-4" />
            <span>{timeLabel}</span>
          </div>
        </div>

        <div className="rounded-xl border border-red-300/50 bg-white/80 px-3.5 py-3 shadow-sm sm:px-4.5 sm:py-3.5 dark:border-red-500/20 dark:bg-black/70 dark:shadow-[0_0_30px_rgba(0,0,0,0.45)]">
          <p className="text-sm text-zinc-700 dark:text-zinc-300">
            {fullDateLabel.charAt(0).toUpperCase() +
              fullDateLabel.slice(1)}
          </p>
          <p className="mt-1 text-[11px] uppercase tracking-[0.2em] text-red-300/90">
            Em tempo real
          </p>
        </div>

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
              const dayHasDemands =
                day !== null &&
                (demandsByDate[
                  `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
                ]?.length ?? 0) > 0

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
                      onClick={() => openDayDemands(day)}
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
                          {demandsByDate[
                            `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
                          ]?.length ?? 0}
                        </span>
                      ) : null}
                    </button>
                  ) : (
                    <span className="absolute top-1 left-1 text-xs text-zinc-400 dark:text-zinc-700">
                      ·
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {selectedDay !== null ? (
        <>
          <button
            type="button"
            aria-label="Fechar painel de demandas"
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm dark:bg-black/70 lg:hidden"
            onClick={closeDrawer}
          />
          <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md p-2 sm:p-3 lg:static lg:inset-auto lg:z-auto lg:h-full lg:w-[350px] lg:max-w-none lg:shrink-0 lg:p-0">
            <MensalDayDemandsPanel
              dateLabel={selectedDateLabel}
              demands={selectedDemands}
              newDemandTitle={newDemandTitle}
              newDemandCategory={newDemandCategory}
              newDemandNote={newDemandNote}
              newDemandStartTime={newDemandStartTime}
              newDemandEndTime={newDemandEndTime}
              onNewDemandTitleChange={setNewDemandTitle}
              onNewDemandCategoryChange={setNewDemandCategory}
              onNewDemandNoteChange={setNewDemandNote}
              onNewDemandStartTimeChange={setNewDemandStartTime}
              onNewDemandEndTimeChange={setNewDemandEndTime}
              onAddDemand={addDemand}
              onUpdateDemand={updateDemand}
              onToggleDemandDone={toggleDemandDone}
              onRemoveDemand={removeDemand}
              onClose={closeDrawer}
              className="h-full border-zinc-200/90 bg-white/95 dark:border-white/15 dark:bg-zinc-950 lg:border-zinc-200/80 lg:bg-white/95 lg:dark:border-white/10 lg:dark:bg-zinc-950/95"
            />
          </div>
        </>
      ) : null}
    </div>
  )
}