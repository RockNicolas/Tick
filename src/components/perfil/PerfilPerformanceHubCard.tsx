import { BookOpen, Dumbbell, HandCoins, Tag, type LucideIcon } from 'lucide-react'
import type { MonthlyCategoryStat } from './types'

type PerfilPerformanceHubCardProps = {
  monthlyCompletionRate: number
  monthlyCategoryStats: MonthlyCategoryStat[]
  chartPercents: number[]
  weakestCategory: string
  monthlyFocus: string
}

const categoryIcons: Record<string, LucideIcon> = {
  fitness: Dumbbell,
  financeiro: HandCoins,
  ler: BookOpen,
  outros: Tag,
}

const categoryIconColors: Record<string, string> = {
  fitness: '#86efac',
  financeiro: '#9ca3af',
  ler: '#a78bfa',
  outros: '#f59e0b',
}

export default function PerfilPerformanceHubCard({
  monthlyCompletionRate,
  monthlyCategoryStats,
  chartPercents,
  weakestCategory,
  monthlyFocus,
}: PerfilPerformanceHubCardProps) {
  const safePercents = [0, 1, 2, 3].map((index) => Math.max(0, Math.min(100, chartPercents[index] ?? 0)))
  const isAllZero = safePercents.every((value) => value === 0)
  const chartX = [0, 90, 180, 280]
  const flatLineY = 100
  const fitnessPoints = chartX
    .map((x, index) => `${x},${isAllZero ? flatLineY : 105 - Math.round(safePercents[index] * 0.7)}`)
    .join(' ')
  const leituraPoints = chartX
    .map((x, index) => {
      if (isAllZero) return `${x},${flatLineY}`
      const yByIndex = [88, 80, 76, 74]
      const weightByIndex = [0.3, 0.12, 0.14, 0.22]
      return `${x},${yByIndex[index] - Math.round(safePercents[index] * weightByIndex[index])}`
    })
    .join(' ')
  const outrosPoints = chartX
    .map((x, index) => {
      if (isAllZero) return `${x},${flatLineY}`
      const yByIndex = [92, 96, 82, 87]
      const weightByIndex = [0.2, 0.24, 0.2, 0.13]
      return `${x},${yByIndex[index] - Math.round(safePercents[index] * weightByIndex[index])}`
    })
    .join(' ')

  return (
    <section className="rounded-2xl border border-zinc-200/90 bg-white/70 p-4 shadow-sm dark:border-white/10 dark:bg-black/35">
      <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">Hub de Desempenho</h2>

      <div className="mt-3 grid grid-cols-1 gap-4 lg:grid-cols-[220px_1fr]">
        <div className="flex items-center justify-center">
          <div
            className="relative grid h-40 w-40 place-items-center rounded-full"
            style={{
              background: `conic-gradient(#22d3ee 0deg, #a78bfa ${monthlyCompletionRate * 3.6}deg, rgba(148,163,184,0.25) 0deg)`,
            }}
          >
            <div className="grid h-30 w-30 place-items-center rounded-full bg-zinc-900 text-center leading-none">
              <span className="text-xs uppercase text-zinc-400">Score total</span>
              <span className="-mt-15 inline-flex items-center justify-center text-5xl font-semibold leading-none text-zinc-100">
                {monthlyCompletionRate}%
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {monthlyCategoryStats.map((item) => (
            <div key={item.category}>
              <div className="mb-1 flex items-center justify-between text-sm">
                <p className="font-medium text-zinc-900 dark:text-zinc-100">{item.label}</p>
                <p className="text-zinc-600 dark:text-zinc-400">{item.percent}%</p>
              </div>
              <div className="h-2 rounded-full bg-zinc-200/70 dark:bg-white/10">
                <div
                  className="h-2 rounded-full transition-all"
                  style={{ width: `${Math.max(0, Math.min(100, item.percent))}%`, backgroundColor: item.color }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-[1.4fr_1fr]">
        <div className="rounded-2xl border border-zinc-200/90 bg-gradient-to-b from-[#f8fbfb] to-[#f3f7f7] p-3 shadow-sm dark:border-white/10 dark:from-zinc-900/70 dark:to-zinc-900/40">
          <svg viewBox="0 0 280 120" className="h-28 w-full">
            <line x1="0" y1="24" x2="280" y2="24" stroke="#cfd8dc" strokeDasharray="4 5" strokeWidth="1" opacity="0.7" />
            <line x1="0" y1="58" x2="280" y2="58" stroke="#cfd8dc" strokeDasharray="4 5" strokeWidth="1" opacity="0.7" />
            <line x1="0" y1="94" x2="280" y2="94" stroke="#cfd8dc" strokeDasharray="4 5" strokeWidth="1" opacity="0.7" />
            <polyline
              fill="none"
              stroke="#86efac"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={fitnessPoints}
            />
            <polyline
              fill="none"
              stroke="#a78bfa"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={leituraPoints}
            />
            <polyline
              fill="none"
              stroke="#f59e0b"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={outrosPoints}
            />
            <text x="0" y="15" className="fill-zinc-500 text-[10px] font-semibold">
              {safePercents[0]}%
            </text>
            <text x="90" y="20" textAnchor="middle" className="fill-zinc-500 text-[10px] font-semibold">
              {safePercents[1]}%
            </text>
            <text x="180" y="16" textAnchor="middle" className="fill-zinc-500 text-[10px] font-semibold">
              {safePercents[2]}%
            </text>
            <text x="280" y="15" textAnchor="end" className="fill-zinc-500 text-[10px] font-semibold">
              {safePercents[3]}%
            </text>
          </svg>
          <div className="mt-1 grid grid-cols-4 text-center text-sm text-zinc-500 dark:text-zinc-400">
            {monthlyCategoryStats.map((item) => (
              <p key={`lbl-${item.category}`} className="inline-flex items-center justify-center gap-1.5">
                {(() => {
                  const Icon = categoryIcons[item.category] ?? Tag
                  const iconColor = categoryIconColors[item.category] ?? '#9ca3af'
                  return <Icon className="h-4.5 w-4.5" style={{ color: iconColor }} />
                })()}
                <span>{item.label}</span>
              </p>
            ))}
          </div>
        </div>
        <div className="rounded-xl border border-zinc-200/80 bg-white/60 p-3 dark:border-white/10 dark:bg-white/[0.03]">
          <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Sugestão de ação</p>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Considere focar em <span className="font-medium text-zinc-900 dark:text-zinc-100">{weakestCategory}</span> para equilibrar seu score mensal.
          </p>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Foco do mês: <span className="font-medium text-zinc-900 dark:text-zinc-100">{monthlyFocus}</span>
          </p>
        </div>
      </div>
    </section>
  )
}
