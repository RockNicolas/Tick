import { startTransition, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  DAY_DEMANDS_UPDATED_EVENT,
  fetchDayDemandsForMonth,
  pickMonthEntries,
  saveDayDemandsForMonth,
  stripMonthKeys,
  type DemandsByDate,
} from '../api/dayDemands'
import type { MonthlyDemand } from '../types/monthlyDemand'
import { colorFromPriority } from '../lib/monthDemandColors'
import { buildMonthCells, MENSAL_WEEK_HEADERS } from '../lib/mensalMonthGrid'
import { readAutoOpenTodayPanel, readShowClockSeconds } from '../lib/tickSettings'
import { triggerNotificationEvent } from '../lib/tickNotifications'
import { useTickSettingsVersion } from './useTickSettings'

const DEMAND_REMINDER_LEAD_MINUTES = 30

export function useMensalPage() {
  const [now, setNow] = useState(() => new Date())
  const [selectedDay, setSelectedDay] = useState<number | null>(null)
  const [demandsByDate, setDemandsByDate] = useState<DemandsByDate>({})
  const [newDemandTitle, setNewDemandTitle] = useState('')
  const [newDemandCategory, setNewDemandCategory] = useState('geral')
  const [newDemandNote, setNewDemandNote] = useState('')
  const [newDemandPriority, setNewDemandPriority] = useState<'baixa' | 'media' | 'importante'>('media')
  const [newDemandStartTime, setNewDemandStartTime] = useState('')
  const [newDemandEndTime, setNewDemandEndTime] = useState('')

  const tickSettingsVersion = useTickSettingsVersion()

  const calendarYear = now.getFullYear()
  const calendarMonth = now.getMonth() + 1

  const monthHydratedRef = useRef<string | null>(null)
  const skipNextSaveRef = useRef(false)
  const saveTimerRef = useRef<number | null>(null)
  const saveInFlightRef = useRef(false)
  const queuedSaveRef = useRef<{ year: number; month: number; payload: DemandsByDate } | null>(null)

  const flushQueuedSave = useCallback(() => {
    const processQueuedSave = () => {
      if (saveInFlightRef.current) return
      const next = queuedSaveRef.current
      if (!next) return
      queuedSaveRef.current = null
      saveInFlightRef.current = true
      saveDayDemandsForMonth(next.year, next.month, next.payload)
        .catch((error) => {
          console.error('[Mensal] Falha ao salvar demandas no servidor:', error)
        })
        .finally(() => {
          saveInFlightRef.current = false
          if (queuedSaveRef.current) processQueuedSave()
        })
    }
    processQueuedSave()
  }, [])

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000)
    return () => window.clearInterval(id)
  }, [])

  useEffect(() => {
    const key = `${calendarYear}-${calendarMonth}`
    let cancelled = false
    monthHydratedRef.current = null
    if (saveTimerRef.current !== null) {
      window.clearTimeout(saveTimerRef.current)
      saveTimerRef.current = null
    }
    queuedSaveRef.current = null

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

    const payload = pickMonthEntries(demandsByDate, calendarYear, calendarMonth)

    if (saveTimerRef.current !== null) {
      window.clearTimeout(saveTimerRef.current)
    }
    saveTimerRef.current = window.setTimeout(() => {
      queuedSaveRef.current = { year: calendarYear, month: calendarMonth, payload }
      flushQueuedSave()
      saveTimerRef.current = null
    }, 600)

    return () => {
      if (saveTimerRef.current !== null) {
        window.clearTimeout(saveTimerRef.current)
        saveTimerRef.current = null
      }
    }
  }, [demandsByDate, calendarYear, calendarMonth, flushQueuedSave])

  useEffect(() => {
    const onDemandsUpdated = (event: Event) => {
      const custom = event as CustomEvent<{ year?: number; month?: number }>
      const y = Number(custom.detail?.year)
      const m = Number(custom.detail?.month)
      if (!Number.isFinite(y) || !Number.isFinite(m)) return
      if (y !== calendarYear || m !== calendarMonth) return

      void (async () => {
        try {
          const remote = await fetchDayDemandsForMonth(calendarYear, calendarMonth)
          skipNextSaveRef.current = true
          setDemandsByDate((previous) => ({
            ...stripMonthKeys(previous, calendarYear, calendarMonth),
            ...remote,
          }))
        } catch (error) {
          console.error('[Mensal] Falha ao sincronizar demandas:', error)
        }
      })()
    }

    window.addEventListener(DAY_DEMANDS_UPDATED_EVENT, onDemandsUpdated as EventListener)
    return () => window.removeEventListener(DAY_DEMANDS_UPDATED_EVENT, onDemandsUpdated as EventListener)
  }, [calendarYear, calendarMonth])

  const monthLabel = new Intl.DateTimeFormat('pt-BR', {
    month: 'long',
    year: 'numeric',
  }).format(now)

  const timeLabel = useMemo(() => {
    void tickSettingsVersion
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

  const monthCells = useMemo(() => buildMonthCells(now), [now])

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

  const openDayDemands = useCallback((day: number) => {
    setSelectedDay(day)
    setNewDemandTitle('')
    setNewDemandCategory('geral')
    setNewDemandNote('')
    setNewDemandPriority('media')
    setNewDemandStartTime('')
    setNewDemandEndTime('')
  }, [])

  const addDemand = useCallback(() => {
    const title = newDemandTitle.trim()
    if (!title || selectedDateKey === null) return

    const note = newDemandNote.trim()
    const category = newDemandCategory.trim() || 'geral'
    const priority = newDemandPriority
    const color = colorFromPriority(priority)
    const st = newDemandStartTime.trim()
    const et = newDemandEndTime.trim()
    const startTime = st && et ? st : null
    const endTime = st && et ? et : null

    setDemandsByDate((previous) => ({
      ...previous,
      [selectedDateKey]: [
        ...(previous[selectedDateKey] ?? []),
        { title, category, note, priority, color, done: false, startTime, endTime },
      ],
    }))
    setNewDemandTitle('')
    setNewDemandCategory('geral')
    setNewDemandNote('')
    setNewDemandPriority('media')
    setNewDemandStartTime('')
    setNewDemandEndTime('')
  }, [
    newDemandTitle,
    selectedDateKey,
    newDemandNote,
    newDemandCategory,
    newDemandPriority,
    newDemandStartTime,
    newDemandEndTime,
  ])

  useEffect(() => {
    const today = new Date()
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    for (const [dateKey, demands] of Object.entries(demandsByDate)) {
      const demandDate = new Date(`${dateKey}T00:00:00`)
      if (Number.isNaN(demandDate.getTime())) continue
      if (demandDate >= todayStart) continue
      const hasOverdue = demands.some((demand) => !demand.done)
      if (!hasOverdue) continue
      triggerNotificationEvent('overdue_critical', {
        title: 'Atividade em atraso',
        body: `Existe atividade pendente desde ${dateKey}.`,
        dedupeKey: `overdue_critical:demand:${dateKey}`,
        minIntervalMs: 30 * 60 * 1000,
      })
    }
  }, [demandsByDate])

  const updateDemand = useCallback(
    (demandIndex: number, next: MonthlyDemand) => {
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
          priority: next.priority ?? 'media',
          color: colorFromPriority(next.priority ?? 'media'),
          done: Boolean(next.done),
          startTime: st && et ? st : null,
          endTime: st && et ? et : null,
        }
        return { ...previous, [selectedDateKey]: list }
      })
    },
    [selectedDateKey],
  )

  const toggleDemandDone = useCallback(
    (demandIndex: number) => {
      if (selectedDateKey === null) return
      setDemandsByDate((previous) => {
        const list = [...(previous[selectedDateKey] ?? [])]
        if (demandIndex < 0 || demandIndex >= list.length) return previous
        const current = list[demandIndex]
        list[demandIndex] = { ...current, done: !current.done }
        return { ...previous, [selectedDateKey]: list }
      })
    },
    [selectedDateKey],
  )

  const removeDemand = useCallback(
    (demandIndex: number) => {
      if (selectedDateKey === null) return
      setDemandsByDate((previous) => {
        const nextList = (previous[selectedDateKey] ?? []).filter(
          (_, index) => index !== demandIndex,
        )

        if (nextList.length === 0) {
          const next = { ...previous }
          delete next[selectedDateKey]
          return next
        }

        return {
          ...previous,
          [selectedDateKey]: nextList,
        }
      })
    },
    [selectedDateKey],
  )

  useEffect(() => {
    if (!readAutoOpenTodayPanel()) return
    if (todayDemandsCount > 0) {
      startTransition(() => {
        setSelectedDay(todayDay)
      })
    }
  }, [todayDay, todayDemandsCount, tickSettingsVersion])

  useEffect(() => {
    const runReminderCheck = () => {
      const now = new Date()
      for (const [dateKey, demands] of Object.entries(demandsByDate)) {
        for (const demand of demands) {
          if (demand.done) continue
          const startTime = (demand.startTime ?? '').trim()
          if (!startTime) continue
          if (!/^\d{2}:\d{2}$/.test(startTime)) continue
          const scheduledAt = new Date(`${dateKey}T${startTime}:00`)
          if (Number.isNaN(scheduledAt.getTime())) continue
          const diffMs = scheduledAt.getTime() - now.getTime()
          const reminderLeadMs = DEMAND_REMINDER_LEAD_MINUTES * 60 * 1000
          const oneMinuteMs = 60 * 1000
          if (diffMs <= 0 || diffMs > reminderLeadMs) continue
          const minutesLeft = Math.max(1, Math.ceil(diffMs / oneMinuteMs))
          const endTime = (demand.endTime ?? '').trim()
          const timeRangeLabel = endTime ? `${startTime} às ${endTime}` : startTime
          const categoryLabel = (demand.category || 'geral').toUpperCase()
          triggerNotificationEvent('task_due_soon', {
            title: `Nao esqueca da sua demanda: ${demand.title}`,
            body: `Categoria: ${categoryLabel}. Horario: ${timeRangeLabel}. Faltam ${minutesLeft} minutos.`,
            dedupeKey: `task_due_soon:${DEMAND_REMINDER_LEAD_MINUTES}min:${dateKey}:${startTime}:${demand.title.toLowerCase()}`,
            minIntervalMs: 12 * 60 * 60 * 1000,
          })
        }
      }
    }

    runReminderCheck()
    const id = window.setInterval(runReminderCheck, 60 * 1000)
    return () => window.clearInterval(id)
  }, [demandsByDate])

  return {
    monthLabel,
    timeLabel,
    fullDateLabel,
    weekDays: MENSAL_WEEK_HEADERS,
    monthCells,
    now,
    todayDay,
    selectedDay,
    demandsByDate,
    openDayDemands,
    drawerOpen: selectedDay !== null,
    selectedDateLabel,
    selectedDemands,
    closeDrawer,
    newDemand: {
      title: newDemandTitle,
      category: newDemandCategory,
      note: newDemandNote,
      priority: newDemandPriority,
      startTime: newDemandStartTime,
      endTime: newDemandEndTime,
      setTitle: setNewDemandTitle,
      setCategory: setNewDemandCategory,
      setNote: setNewDemandNote,
      setPriority: setNewDemandPriority,
      setStartTime: setNewDemandStartTime,
      setEndTime: setNewDemandEndTime,
    },
    addDemand,
    updateDemand,
    toggleDemandDone,
    removeDemand,
  }
}
