import {
  BookOpen,
  CalendarDays,
  LayoutGrid,
  LayoutList,
  PanelsTopLeft,
  Plus,
  Target,
  Wallet,
} from 'lucide-react'
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  dateKeyFromDate,
  fetchDayDemandsForWeek,
  type DemandsByDate,
  startOfWeekSunday,
} from '../api/dayDemands'
import {
  clipMinutesToView,
  demandHasTimeRange,
  parseHHmmToMinutes,
} from '../lib/timeRange'

type PeriodId = 'inteiro' | 'manha' | 'tarde' | 'noite'
type WeekViewMode = 'grade' | 'grade-lista'

const PERIOD_LABELS: Array<{ id: PeriodId; label: string }> = [
  { id: 'manha', label: 'Manhã' },
  { id: 'tarde', label: 'Tarde' },
  { id: 'noite', label: 'Noite' },
  { id: 'inteiro', label: 'Inteiro' },
]

function periodToViewRange(id: PeriodId): { startMin: number; endMin: number } {
  switch (id) {
    case 'manha':
      return { startMin: 7 * 60, endMin: 12 * 60 }
    case 'tarde':
      return { startMin: 12 * 60, endMin: 18 * 60 }
    case 'noite':
      return { startMin: 18 * 60, endMin: 22 * 60 + 60 }
    default:
      // 07:00 até fim do bloco 22h (23:00 exclusivo) — rótulos 07 … 22 sem precisar rolar a grade
      return { startMin: 7 * 60, endMin: 23 * 60 }
  }
}

function categoryStyle(cat: string): {
  body: string
  stripe: string
  icon: typeof Target
} {
  const c = (cat || 'geral').toLowerCase()
  if (c === 'fitness') {
    return {
      body: 'border-emerald-400/35 bg-emerald-500/18 text-emerald-100',
      stripe: 'bg-emerald-400/95',
      icon: Target,
    }
  }
  if (c === 'financas') {
    return {
      body: 'border-amber-400/35 bg-amber-500/18 text-amber-100',
      stripe: 'bg-amber-400/95',
      icon: Wallet,
    }
  }
  if (c === 'leitura') {
    return {
      body: 'border-violet-400/35 bg-violet-500/18 text-violet-100',
      stripe: 'bg-violet-400/95',
      icon: BookOpen,
    }
  }
  return {
    body: 'border-sky-400/30 bg-sky-500/16 text-sky-100',
    stripe: 'bg-sky-400/95',
    icon: LayoutList,
  }
}

function weekDayLetters(): string[] {
  return ['D', 'S', 'T', 'Q', 'Q', 'S', 'S']
}

/** Posição vertical em px dentro da coluna (0 = topo da faixa de horários = `viewStart`). */
function demandBlockLayoutPx(
  clip: { start: number; end: number },
  viewStart: number,
  viewTotalMin: number,
  timelineHeightPx: number,
): { topPx: number; heightPx: number } | null {
  if (timelineHeightPx <= 0 || !Number.isFinite(timelineHeightPx)) return null
  const pxPerMin = timelineHeightPx / viewTotalMin
  const topPx = (clip.start - viewStart) * pxPerMin
  const rawH = (clip.end - clip.start) * pxPerMin
  const minOneMinutePx = (60 / viewTotalMin) * timelineHeightPx
  const maxH = Math.max(0, timelineHeightPx - topPx)
  const heightPx = Math.min(Math.max(rawH, minOneMinutePx, 6), maxH)
  if (heightPx < 1) return null
  return { topPx, heightPx }
}

export default function SemanaPage() {
  const [period, setPeriod] = useState<PeriodId>('inteiro')
  const [viewMode, setViewMode] = useState<WeekViewMode>('grade')
  const [byDate, setByDate] = useState<DemandsByDate>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [timelineHeightPx, setTimelineHeightPx] = useState(0)
  const timelineBodyRef = useRef<HTMLDivElement>(null)

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

  const range = useMemo(() => periodToViewRange(period), [period])
  const { startMin: viewStart, endMin: viewEnd } = range
  const viewTotalMin = Math.max(1, viewEnd - viewStart)

  const hourLabels = useMemo(() => {
    const startH = Math.floor(viewStart / 60)
    const endH = Math.ceil(viewEnd / 60)
    const out: number[] = []
    for (let h = startH; h < endH; h += 1) out.push(h)
    return out
  }, [viewStart, viewEnd])

  const weekTimedFlat = useMemo(() => {
    const out: Array<{
      dateKey: string
      title: string
      startTime: string
      endTime: string
      done: boolean
    }> = []
    for (const { dateKey } of weekDays) {
      for (const d of byDate[dateKey] ?? []) {
        if (!demandHasTimeRange(d)) continue
        out.push({
          dateKey,
          title: d.title,
          startTime: d.startTime!,
          endTime: d.endTime!,
          done: Boolean(d.done),
        })
      }
    }
    out.sort((a, b) => {
      const dk = a.dateKey.localeCompare(b.dateKey)
      if (dk !== 0) return dk
      return a.startTime.localeCompare(b.startTime)
    })
    return out
  }, [weekDays, byDate])

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

  useLayoutEffect(() => {
    if (loading) return
    const el = timelineBodyRef.current
    if (!el) return
    const measure = () => {
      const h = el.getBoundingClientRect().height
      if (h > 0) setTimelineHeightPx(h)
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [loading, period, viewMode, hourLabels.length, byDate])

  return (
    <div className="flex h-full min-h-0 min-w-0 flex-col gap-3 sm:gap-4">
      <div className="flex shrink-0 min-w-0 flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 space-y-1">
          <div className="flex min-w-0 flex-wrap items-center gap-2 text-2xl font-semibold text-zinc-900 dark:text-zinc-100 sm:text-3xl">
            <CalendarDays className="h-7 w-7 shrink-0 text-red-400 sm:h-8 sm:w-8" />
            <span className="min-w-0">Semana</span>
          </div>
          <p className="max-w-prose text-sm leading-snug text-zinc-600 dark:text-zinc-400">
            Visão semanal da sua agenda.
          </p>
        </div>

        <div className="flex shrink-0 flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-500">
              Exibir
            </span>
            <div className="inline-flex flex-wrap gap-1 rounded-lg border border-zinc-300/80 p-0.5 dark:border-white/15">
              <button
                type="button"
                onClick={() => setViewMode('grade')}
                className={
                  viewMode === 'grade'
                    ? 'inline-flex items-center gap-1 rounded-md bg-zinc-200/90 px-2 py-1 text-xs font-medium text-zinc-900 dark:bg-white/15 dark:text-zinc-100'
                    : 'inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-zinc-600 dark:text-zinc-400'
                }
              >
                <LayoutGrid className="h-3.5 w-3.5 opacity-90" aria-hidden />
                Grade
              </button>
              <button
                type="button"
                onClick={() => setViewMode('grade-lista')}
                className={
                  viewMode === 'grade-lista'
                    ? 'inline-flex items-center gap-1 rounded-md bg-zinc-200/90 px-2 py-1 text-xs font-medium text-zinc-900 dark:bg-white/15 dark:text-zinc-100'
                    : 'inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-zinc-600 dark:text-zinc-400'
                }
              >
                <PanelsTopLeft className="h-3.5 w-3.5 opacity-90" aria-hidden />
                Grade/Lista
              </button>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-500">
              Período
            </span>
            <div className="inline-flex flex-wrap gap-1 rounded-lg border border-zinc-300/80 p-0.5 dark:border-white/15">
              {PERIOD_LABELS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPeriod(p.id)}
                  className={
                    period === p.id
                      ? 'rounded-md bg-zinc-200/90 px-2 py-1 text-xs font-medium text-zinc-900 dark:bg-white/15 dark:text-zinc-100'
                      : 'rounded-md px-2 py-1 text-xs font-medium text-zinc-600 dark:text-zinc-400'
                  }
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {error ? (
        <p className="shrink-0 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
          {error}
        </p>
      ) : null}

      <div className="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-2xl border border-zinc-200/80 bg-white/70 shadow-sm dark:border-white/10 dark:bg-black/40">
        {loading ? (
          <p className="p-4 text-sm text-zinc-600 dark:text-zinc-400">Carregando…</p>
        ) : (
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
            <div className="sticky top-0 z-20 flex min-w-[640px] shrink-0 border-b border-zinc-200/80 bg-white/95 pl-14 dark:border-white/10 dark:bg-zinc-950/95">
              {weekDays.map(({ dateKey, header }) => (
                <div
                  key={`h-${dateKey}`}
                  className="flex min-w-0 flex-1 items-center justify-center py-2 text-sm font-semibold text-zinc-700 dark:text-zinc-200"
                >
                  {header}
                </div>
              ))}
            </div>

            <div
              className={
                viewMode === 'grade-lista'
                  ? 'flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden'
                  : 'flex min-h-0 min-w-0 flex-1 overflow-x-auto overflow-y-hidden'
              }
            >
              <div
                ref={timelineBodyRef}
                className="flex min-h-0 min-w-[640px] flex-1 flex-row self-stretch"
              >
              <div className="sticky left-0 z-10 flex w-14 shrink-0 flex-col self-stretch border-r border-zinc-200/80 bg-white/95 dark:border-white/10 dark:bg-zinc-950/95">
                {hourLabels.map((h) => (
                  <div
                    key={h}
                    className="flex min-h-0 flex-1 flex-col justify-start border-b border-zinc-200/60 py-0.5 pr-2 text-right text-[11px] leading-tight tabular-nums text-zinc-500 dark:border-white/10 dark:text-zinc-500"
                  >
                    {String(h).padStart(2, '0')}:00
                  </div>
                ))}
              </div>

              <div className="flex min-h-0 min-w-0 flex-1 self-stretch">
                {weekDays.map(({ dateKey }) => {
                  const demands = byDate[dateKey] ?? []
                  const timed = demands
                    .map((d, index) => ({ d, index }))
                    .filter(({ d }) => demandHasTimeRange(d))

                  return (
                    <div
                      key={dateKey}
                      className="relative grid min-h-0 min-w-0 flex-1 grid-cols-1 border-l border-zinc-200/70 first:border-l-0 dark:border-white/10"
                      style={{
                        gridTemplateRows: `repeat(${hourLabels.length}, minmax(0, 1fr))`,
                      }}
                      aria-label={`Demandas do dia ${dateKey}`}
                    >
                      {hourLabels.map((h, i) => (
                        <div
                          key={`${dateKey}-${h}`}
                          className="pointer-events-none relative z-0 min-h-0 border-b border-zinc-200/50 dark:border-white/[0.06]"
                          style={{ gridColumn: 1, gridRow: i + 1 }}
                        />
                      ))}

                      <div className="pointer-events-none absolute inset-0 z-10 min-h-0 overflow-hidden">
                        {timed.map(({ d, index }) => {
                          const startMin = parseHHmmToMinutes(d.startTime)!
                          const endMin = parseHHmmToMinutes(d.endTime)!
                          const clip = clipMinutesToView(startMin, endMin, viewStart, viewEnd)
                          if (!clip) return null
                          const layout = demandBlockLayoutPx(
                            clip,
                            viewStart,
                            viewTotalMin,
                            timelineHeightPx,
                          )
                          if (!layout) return null
                          const { topPx, heightPx } = layout
                          const { body, stripe, icon: Icon } = categoryStyle(d.category)
                          const customColor = typeof d.color === 'string' ? d.color.trim() : ''
                          const hasCustomColor = /^#[0-9a-f]{6}$/i.test(customColor)
                          return (
                            <div
                              key={`${dateKey}-${index}-${d.title}`}
                              className="pointer-events-auto box-border absolute left-0.5 right-0.5 overflow-hidden rounded-lg border px-1 py-0.5 text-[11px] leading-tight shadow-sm backdrop-blur-sm sm:left-1 sm:right-1 sm:px-1.5 sm:py-1 sm:text-xs"
                              style={{
                                top: `${topPx}px`,
                                height: `${heightPx}px`,
                                zIndex: 2 + index,
                              }}
                              title={`${d.startTime}–${d.endTime}`}
                            >
                              <div
                                className={`flex h-full min-h-0 overflow-hidden rounded-md border ${hasCustomColor ? 'text-white' : body} ${d.done ? 'opacity-50' : ''}`}
                                style={
                                  hasCustomColor
                                    ? {
                                        borderColor: customColor,
                                        backgroundColor: `${customColor}2e`,
                                      }
                                    : undefined
                                }
                              >
                                <span
                                  className={`h-full w-1.5 shrink-0 ${stripe}`}
                                  style={hasCustomColor ? { backgroundColor: customColor } : undefined}
                                  aria-hidden
                                />
                                <div className="flex min-w-0 flex-1 items-start gap-1 px-1 py-0.5 sm:px-1.5">
                                  <Icon className="mt-0.5 h-3 w-3 shrink-0 opacity-90" aria-hidden />
                                  <span className="min-w-0 flex-1 truncate font-medium leading-snug">
                                    {d.title}
                                  </span>
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
              </div>
              </div>

              {viewMode === 'grade-lista' ? (
                <div className="shrink-0 border-t border-zinc-200/80 bg-white/90 dark:border-white/10 dark:bg-zinc-950/90">
                  <p className="border-b border-zinc-200/70 px-3 py-2 text-xs font-medium uppercase tracking-wide text-zinc-500 dark:border-white/10 dark:text-zinc-500">
                    Lista da semana (com horário)
                  </p>
                  <ul className="max-h-[min(40vh,14rem)] min-h-0 overflow-y-auto px-2 py-2">
                    {weekTimedFlat.length === 0 ? (
                      <li className="px-2 py-3 text-sm text-zinc-500 dark:text-zinc-400">
                        Nenhum item com horário nesta semana.
                      </li>
                    ) : (
                      weekTimedFlat.map((row) => (
                        <li
                          key={`${row.dateKey}-${row.startTime}-${row.title}`}
                          className="flex min-w-0 items-center justify-between gap-2 border-b border-zinc-200/50 py-2 text-sm last:border-b-0 dark:border-white/[0.06]"
                        >
                          <span className="min-w-0 truncate font-medium text-zinc-800 dark:text-zinc-100">
                            {row.title}
                          </span>
                          <span className="shrink-0 tabular-nums text-xs text-zinc-500 dark:text-zinc-400">
                            {row.dateKey.slice(5)} · {row.startTime}–{row.endTime}
                          </span>
                        </li>
                      ))
                    )}
                  </ul>
                </div>
              ) : null}
            </div>

          </div>
        )}

        <Link
          to="/mensal"
          className="absolute bottom-4 right-4 inline-flex items-center gap-2 rounded-2xl border border-teal-400/40 bg-teal-500/90 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-teal-900/20 transition hover:bg-teal-400"
        >
          <Plus className="h-5 w-5" aria-hidden />
          Cadastrar no mensal
        </Link>
      </div>
    </div>
  )
}
