import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  DAY_DEMANDS_UPDATED_EVENT,
  dateKeyFromDate,
  fetchDayDemandsForWeek,
  pickMonthEntries,
  saveDayDemandsForMonth,
  type DemandsByDate,
  startOfWeekSunday,
} from '../api/dayDemands'
import type { MonthlyDemand } from '../types/monthlyDemand'
import type { PeriodId } from '../lib/semanaCalendar'
import { periodToViewRange, weekDayLetters } from '../lib/semanaCalendar'

export function useSemanaWeek(period: PeriodId) {
  const [byDate, setByDate] = useState<DemandsByDate>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const weekStart = useMemo(() => {
    const ref = new Date()
    ref.setHours(12, 0, 0, 0)
    return startOfWeekSunday(ref)
  }, [])

  const weekDays = useMemo(() => {
    const letters = weekDayLetters()
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(weekStart)
      d.setDate(weekStart.getDate() + i)
      return {
        date: d,
        dateKey: dateKeyFromDate(d),
        header: letters[i] ?? String(i),
      }
    })
  }, [weekStart])

  const { startMin: viewStart, endMin: viewEnd } = useMemo(
    () => periodToViewRange(period),
    [period],
  )

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const data = await fetchDayDemandsForWeek(weekStart)
      setByDate(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Falha ao carregar agenda')
      setByDate({})
    } finally {
      setLoading(false)
    }
  }, [weekStart])

  useEffect(() => {
    void load()
  }, [load])

  useEffect(() => {
    const onDemandsUpdated = () => {
      void load()
    }
    window.addEventListener(DAY_DEMANDS_UPDATED_EVENT, onDemandsUpdated)
    return () => window.removeEventListener(DAY_DEMANDS_UPDATED_EVENT, onDemandsUpdated)
  }, [load])

  const toggleDemandDone = useCallback(
    async (dateKey: string, demandIndex: number) => {
      const list = [...(byDate[dateKey] ?? [])]
      if (demandIndex < 0 || demandIndex >= list.length) return
      const current = list[demandIndex] as MonthlyDemand
      list[demandIndex] = { ...current, done: !current.done }
      const nextSnapshot: DemandsByDate = { ...byDate, [dateKey]: list }
      setByDate(nextSnapshot)

      const [y, m] = dateKey.split('-').map(Number)
      if (!Number.isFinite(y) || !Number.isFinite(m)) return
      try {
        const payload = pickMonthEntries(nextSnapshot, y, m)
        await saveDayDemandsForMonth(y, m, payload)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Falha ao atualizar demanda')
        await load()
      }
    },
    [byDate, load],
  )

  return { weekDays, viewStart, viewEnd, byDate, loading, error, reload: load, toggleDemandDone }
}
