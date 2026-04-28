import type { MonthlyCategoryStat } from './types'

type PerfilPerformanceHubCardProps = {
  monthlyCompletionRate: number
  monthlyCategoryStats: MonthlyCategoryStat[]
  chartPercents: number[]
  weakestCategory: string
  monthlyFocus: string
}

export default function PerfilPerformanceHubCard({
  monthlyCompletionRate,
  monthlyCategoryStats,
  chartPercents,
  weakestCategory,
  monthlyFocus,
}: PerfilPerformanceHubCardProps) {
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
        <div className="rounded-xl border border-zinc-200/80 bg-white/60 p-3 dark:border-white/10 dark:bg-white/[0.03]">
          <svg viewBox="0 0 280 120" className="h-28 w-full">
            <polyline
              fill="none"
              stroke="#22d3ee"
              strokeWidth="3"
              points={`0,${110 - chartPercents[0]} 90,${110 - chartPercents[1]} 180,${110 - chartPercents[2]} 280,${110 - chartPercents[3]}`}
            />
            <polyline fill="none" stroke="#a78bfa" strokeWidth="2" points="0,85 90,70 180,80 280,60" />
            <polyline fill="none" stroke="#f59e0b" strokeWidth="2" points="0,95 90,88 180,76 280,84" />
          </svg>
          <div className="mt-1 grid grid-cols-4 text-center text-xs text-zinc-500 dark:text-zinc-400">
            {monthlyCategoryStats.map((item) => (
              <p key={`lbl-${item.category}`}>{item.label}</p>
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
