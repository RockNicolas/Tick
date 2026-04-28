import { BookOpen, LayoutList, Target, Wallet } from 'lucide-react'
import { useMemo } from 'react'
import type { DemandsByDate } from '../../api/dayDemands'
import {
  clipMinutesToView,
  demandHasTimeRange,
  expandInclusiveHourEnd,
  parseHHmmToMinutes,
} from '../../lib/timeRange'

type WeekDay = { dateKey: string; header: string }

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

type SemanaTimelineProps = {
  loading: boolean
  byDate: DemandsByDate
  weekDays: WeekDay[]
  viewStart: number
  viewEnd: number
}

export default function SemanaTimeline({
  loading,
  byDate,
  weekDays,
  viewStart,
  viewEnd,
}: SemanaTimelineProps) {
  const viewTotalMin = Math.max(1, viewEnd - viewStart)

  const hourLabels = useMemo(() => {
    const startH = Math.floor(viewStart / 60)
    const endH = Math.ceil(viewEnd / 60)
    const out: number[] = []
    for (let h = startH; h < endH; h += 1) out.push(h)
    return out
  }, [viewStart, viewEnd])

  if (loading) {
    return <p className="p-4 text-sm text-zinc-600 dark:text-zinc-400">Carregando…</p>
  }

  return (
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

      <div className="flex min-h-0 min-w-0 flex-1 overflow-x-auto overflow-y-hidden">
        <div className="flex min-h-0 min-w-[640px] flex-1 flex-row self-stretch">
          <div
            className="sticky left-0 z-10 grid w-14 shrink-0 self-stretch border-r border-zinc-200/80 bg-white/95 dark:border-white/10 dark:bg-zinc-950/95"
            style={{ gridTemplateRows: `repeat(${hourLabels.length}, minmax(0, 1fr))` }}
          >
            {hourLabels.map((h) => (
              <div
                key={h}
                className="flex min-h-0 items-start justify-end border-b border-zinc-200/60 py-0.5 pr-2 text-right text-[11px] leading-tight tabular-nums text-zinc-500 dark:border-white/10 dark:text-zinc-500"
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
                  style={{ gridTemplateRows: `repeat(${hourLabels.length}, minmax(0, 1fr))` }}
                  aria-label={`Demandas do dia ${dateKey}`}
                >
                  {hourLabels.map((h, i) => (
                    <div
                      key={`${dateKey}-${h}`}
                      className="pointer-events-none relative z-0 min-h-0 after:pointer-events-none after:absolute after:inset-x-0 after:bottom-0 after:h-px after:bg-zinc-200/50 dark:after:bg-white/[0.06]"
                      style={{ gridColumn: 1, gridRow: i + 1 }}
                    />
                  ))}

                  <div
                    className="pointer-events-none absolute inset-0 z-10 grid min-h-0 grid-cols-1 overflow-hidden"
                    style={{ gridTemplateRows: `repeat(${viewTotalMin}, minmax(0, 1fr))` }}
                  >
                    {timed.map(({ d, index }) => {
                      const startMin = parseHHmmToMinutes(d.startTime)!
                      const endMin = expandInclusiveHourEnd(parseHHmmToMinutes(d.endTime)!)
                      const clip = clipMinutesToView(startMin, endMin, viewStart, viewEnd)
                      if (!clip) return null
                      const startOffset = Math.max(0, Math.floor(clip.start - viewStart))
                      const endOffset = Math.min(viewTotalMin, Math.ceil(clip.end - viewStart))
                      const rowStart = startOffset + 1
                      const rowEnd = Math.max(rowStart + 1, endOffset + 1)
                      const { body, stripe, icon: Icon } = categoryStyle(d.category)
                      const customColor = typeof d.color === 'string' ? d.color.trim() : ''
                      const hasCustomColor = /^#[0-9a-f]{6}$/i.test(customColor)
                      return (
                        <div
                          key={`${dateKey}-${index}-${d.title}`}
                          className="pointer-events-auto box-border mx-0.5 overflow-hidden rounded-lg px-1 text-[11px] leading-tight shadow-sm backdrop-blur-sm sm:mx-1 sm:px-1.5 sm:text-xs"
                          style={{
                            gridColumn: 1,
                            gridRow: `${rowStart} / ${rowEnd}`,
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
      </div>
    </div>
  )
}
