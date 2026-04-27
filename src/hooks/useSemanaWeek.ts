import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  dateKeyFromDate,
  fetchDayDemandsForWeek,
  type DemandsByDate,
  startOfWeekSunday,
} from '../api/dayDemands'
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

  return { weekDays, viewStart, viewEnd, byDate, loading, error, reload: load }
}
