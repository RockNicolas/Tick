import {
  BookOpen,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  LayoutList,
  ListTodo,
  Plus,
  Target,
  Wallet,
} from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  dateKeyFromDate,
  fetchDayDemandsForWeek,
  type DemandsByDate,
  startOfWeekSunday,
} from '../api/dayDemands'
import type { MonthlyDemand } from '../components/MensalDayDemandsPanel'
import {
  clipMinutesToView,
  demandHasTimeRange,
  parseHHmmToMinutes,
} from '../lib/timeRange'

type PeriodId = 'inteiro' | 'manha' | 'tarde' | 'noite'
type ViewMode = 'grade' | 'grade-list'

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

function categoryStyle(cat: string): { wrap: string; icon: typeof Target } {
  const c = (cat || 'geral').toLowerCase()
  if (c === 'fitness') {
    return {
      wrap: 'border-emerald-400/35 bg-emerald-500/20 text-emerald-100',
      icon: Target,
    }
  }
  if (c === 'financas') {
    return {
      wrap: 'border-amber-400/35 bg-amber-500/20 text-amber-100',
      icon: Wallet,
    }
  }
  if (c === 'leitura') {
    return {
      wrap: 'border-violet-400/35 bg-violet-500/20 text-violet-100',
      icon: BookOpen,
    }
  }
  return {
    wrap: 'border-sky-400/30 bg-sky-500/15 text-sky-100',
    icon: LayoutList,
  }
}

function weekDayLetters(): string[] {
  return ['D', 'S', 'T', 'Q', 'Q', 'S', 'S']
}

export default function SemanaPage() {
  const [weekOffset, setWeekOffset] = useState(0)
  const [period, setPeriod] = useState<PeriodId>('inteiro')
  const [viewMode, setViewMode] = useState<ViewMode>('grade')
  const [byDate, setByDate] = useState<DemandsByDate>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const weekStart = useMemo(() => {
    const ref = new Date()
    ref.setHours(12, 0, 0, 0)
    ref.setDate(ref.getDate() + weekOffset * 7)
    return startOfWeekSunday(ref)
  }, [weekOffset])

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

  const weekLabel = useMemo(() => {
    const a = weekDays[0]?.date
    const b = weekDays[6]?.date
    if (!a || !b) return ''
    const fmt = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short' })
    return `${fmt.format(a)} – ${fmt.format(b)}`
  }, [weekDays])

  const untimedByDay = useMemo(() => {
    const map: Record<string, MonthlyDemand[]> = {}
    for (const { dateKey } of weekDays) {
      const list = byDate[dateKey] ?? []
      map[dateKey] = list.filter((d) => !demandHasTimeRange(d))
    }
    return map
  }, [byDate, weekDays])

  return (
    <div className="flex h-full min-h-0 min-w-0 flex-col gap-3 sm:gap-4">
      <div className="flex shrink-0 min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex min-w-0 flex-wrap items-center gap-2 text-2xl font-semibold text-zinc-900 dark:text-zinc-100 sm:text-3xl">
            <CalendarDays className="h-7 w-7 shrink-0 text-red-400 sm:h-8 sm:w-8" />
            <span className="min-w-0">Semana</span>
          </div>
          <p className="mt-1 max-w-prose text-sm leading-relaxed text-zinc-600 dark:text-zinc-400 sm:text-base">
            Visão semanal da sua agenda
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setWeekOffset((w) => w - 1)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-300/80 text-zinc-700 transition hover:bg-zinc-100 dark:border-white/15 dark:text-zinc-200 dark:hover:bg-white/10"
              aria-label="Semana anterior"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => setWeekOffset(0)}
              className="rounded-lg border border-zinc-300/80 px-3 py-1.5 text-xs font-medium text-zinc-700 transition hover:bg-zinc-100 dark:border-white/15 dark:text-zinc-200 dark:hover:bg-white/10"
            >
              Hoje
            </button>
            <button
              type="button"
              onClick={() => setWeekOffset((w) => w + 1)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-300/80 text-zinc-700 transition hover:bg-zinc-100 dark:border-white/15 dark:text-zinc-200 dark:hover:bg-white/10"
              aria-label="Próxima semana"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
            <span className="text-sm text-zinc-500 dark:text-zinc-400">{weekLabel}</span>
          </div>
        </div>

        <div className="flex shrink-0 flex-col gap-2 sm:items-end">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-500">
              Exibir
            </span>
            <div className="inline-flex rounded-lg border border-zinc-300/80 p-0.5 dark:border-white/15">
              <button
                type="button"
                onClick={() => setViewMode('grade')}
                className={
                  viewMode === 'grade'
                    ? 'rounded-md bg-zinc-200/90 px-2.5 py-1 text-xs font-medium text-zinc-900 dark:bg-white/15 dark:text-zinc-100'
                    : 'rounded-md px-2.5 py-1 text-xs font-medium text-zinc-600 dark:text-zinc-400'
                }
              >
                Grade
              </button>
              <button
                type="button"
                onClick={() => setViewMode('grade-list')}
                className={
                  viewMode === 'grade-list'
                    ? 'rounded-md bg-zinc-200/90 px-2.5 py-1 text-xs font-medium text-zinc-900 dark:bg-white/15 dark:text-zinc-100'
                    : 'rounded-md px-2.5 py-1 text-xs font-medium text-zinc-600 dark:text-zinc-400'
                }
              >
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

            <div className="flex min-h-0 min-w-[640px] flex-1 overflow-x-auto overflow-y-hidden">
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
                      className="relative flex min-h-0 min-w-0 flex-1 flex-col border-l border-zinc-200/70 first:border-l-0 dark:border-white/10"
                      aria-label={`Demandas do dia ${dateKey}`}
                    >
                      {hourLabels.map((h) => (
                        <div
                          key={`${dateKey}-${h}`}
                          className="min-h-0 flex-1 border-b border-zinc-200/50 dark:border-white/[0.06]"
                        />
                      ))}

                      <div className="pointer-events-none absolute inset-0">
                        {timed.map(({ d, index }) => {
                          const startMin = parseHHmmToMinutes(d.startTime)!
                          const endMin = parseHHmmToMinutes(d.endTime)!
                          const clip = clipMinutesToView(startMin, endMin, viewStart, viewEnd)
                          if (!clip) return null
                          const topPct = ((clip.start - viewStart) / viewTotalMin) * 100
                          const hPct = ((clip.end - clip.start) / viewTotalMin) * 100
                          const { wrap, icon: Icon } = categoryStyle(d.category)
                          const customColor = typeof d.color === 'string' ? d.color.trim() : ''
                          const hasCustomColor = /^#[0-9a-f]{6}$/i.test(customColor)
                          return (
                            <div
                              key={`${dateKey}-${index}-${d.title}`}
                              className="pointer-events-auto absolute left-0.5 right-0.5 overflow-hidden rounded-lg border px-1 py-0.5 text-[11px] leading-tight shadow-sm backdrop-blur-sm sm:left-1 sm:right-1 sm:px-1.5 sm:py-1 sm:text-xs"
                              style={{
                                top: `${topPct}%`,
                                height: `${Math.max(hPct, 6)}%`,
                                zIndex: 2 + index,
                              }}
                              title={`${d.startTime}–${d.endTime}`}
                            >
                              <div
                                className={`flex h-full min-h-0 flex-col gap-0.5 rounded-md border ${hasCustomColor ? 'text-white' : wrap} ${d.done ? 'opacity-50' : ''}`}
                                style={
                                  hasCustomColor
                                    ? {
                                        borderColor: customColor,
                                        backgroundColor: `${customColor}40`,
                                      }
                                    : undefined
                                }
                              >
                                <div className="flex min-w-0 items-start gap-1">
                                  <Icon className="mt-0.5 h-3 w-3 shrink-0 opacity-90" aria-hidden />
                                  <span className="min-w-0 truncate font-medium">{d.title}</span>
                                </div>
                                <span className="flex items-center gap-1 text-[10px] opacity-90">
                                  <ListTodo className="h-3 w-3 shrink-0" aria-hidden />
                                  Simple
                                </span>
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

            {viewMode === 'grade-list' ? (
              <div className="max-h-[min(36vh,260px)] shrink-0 overflow-y-auto border-t border-zinc-200/80 bg-zinc-50/80 p-3 dark:border-white/10 dark:bg-black/50">
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-500">
                  Sem horário (cadastre início e fim no Mensal para aparecer na grade)
                </p>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {weekDays.map(({ dateKey, header }) => {
                    const list = untimedByDay[dateKey] ?? []
                    if (list.length === 0) return null
                    return (
                      <div key={dateKey} className="rounded-xl border border-zinc-200/80 bg-white/90 p-2 dark:border-white/10 dark:bg-zinc-950/80">
                        <p className="mb-1 text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                          {header} · {dateKey.slice(8)}/
                          {dateKey.slice(5, 7)}
                        </p>
                        <ul className="space-y-1 text-sm text-zinc-700 dark:text-zinc-300">
                          {list.map((item, i) => (
                            <li key={`${dateKey}-u-${i}`} className="truncate">
                              {item.done ? <span className="line-through opacity-60">{item.title}</span> : item.title}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )
                  })}
                </div>
              </div>
            ) : null}
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
