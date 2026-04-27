import { startTransition, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
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
import { useTickSettingsVersion } from './useTickSettings'

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

    const payload = pickMonthEntries(demandsByDate, calendarYear, calendarMonth)

    const handle = window.setTimeout(() => {
      saveDayDemandsForMonth(calendarYear, calendarMonth, payload).catch((error) => {
        console.error('[Mensal] Falha ao salvar demandas no servidor:', error)
      })
    }, 600)

    return () => window.clearTimeout(handle)
  }, [demandsByDate, calendarYear, calendarMonth])

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
