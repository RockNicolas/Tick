import { Trophy } from 'lucide-react'
import SettingsSectionCard from '../settings/SettingsSectionCard'

export type MonthlyCategoryStat = {
  category: string
  label: string
  count: number
  percent: number
}

type PerfilResumoProgressoCardProps = {
  monthlyCompletionRate: number
  highProgressGoalsCount: number
  activeGoalsCount: number
  monthlyDoneCount: number
  monthlyTotalCount: number
  monthlyCategoryStats: MonthlyCategoryStat[]
}

export default function PerfilResumoProgressoCard({
  monthlyCompletionRate,
  highProgressGoalsCount,
  activeGoalsCount,
  monthlyDoneCount,
  monthlyTotalCount,
  monthlyCategoryStats,
}: PerfilResumoProgressoCardProps) {
  return (
    <SettingsSectionCard title="Resumo do progresso" icon={Trophy}>
      <div className="space-y-3">
        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-xl border border-zinc-200/80 bg-white/70 p-2 dark:border-white/10 dark:bg-white/5">
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400">Média global</p>
            <p className="text-base font-semibold text-zinc-900 dark:text-zinc-100">{monthlyCompletionRate}%</p>
          </div>
          <div className="rounded-xl border border-zinc-200/80 bg-white/70 p-2 dark:border-white/10 dark:bg-white/5">
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400">Bom avanço</p>
            <p className="text-base font-semibold text-zinc-900 dark:text-zinc-100">{highProgressGoalsCount}</p>
          </div>
          <div className="rounded-xl border border-zinc-200/80 bg-white/70 p-2 dark:border-white/10 dark:bg-white/5">
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400">Exigem foco</p>
            <p className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
              {Math.max(0, activeGoalsCount - highProgressGoalsCount)}
            </p>
          </div>
        </div>

        <div>
          <div className="mb-1 flex items-center justify-between text-xs text-zinc-600 dark:text-zinc-400">
            <span>Evolução mensal</span>
            <span>
              {monthlyDoneCount}/{monthlyTotalCount}
            </span>
          </div>
          <div className="h-2 rounded-full bg-zinc-200/80 dark:bg-white/10">
            <div
              className="h-2 rounded-full bg-emerald-500 transition-all"
              style={{ width: `${Math.max(0, Math.min(100, monthlyCompletionRate))}%` }}
            />
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            Evolução por categoria
          </p>
          <div className="grid grid-cols-4 gap-2">
            {monthlyCategoryStats.map((item) => (
              <div key={item.category} className="flex flex-col items-center gap-1">
                <div className="flex h-24 w-full items-end rounded-lg border border-zinc-200/70 bg-white/50 px-2 py-1 dark:border-white/10 dark:bg-white/[0.03]">
                  <div
                    className={`w-full rounded-sm transition-all ${
                      item.category === 'fitness'
                        ? 'bg-emerald-500/90'
                        : item.category === 'financeiro'
                          ? 'bg-amber-500/90'
                          : item.category === 'ler'
                            ? 'bg-violet-500/90'
                            : 'bg-sky-500/90'
                    }`}
                    style={{ height: `${Math.max(8, Math.min(100, item.percent))}%` }}
                  />
                </div>
                <p className="text-center text-[10px] text-zinc-500 dark:text-zinc-400">{item.label}</p>
                <p className="text-[10px] font-medium text-zinc-700 dark:text-zinc-300">{item.percent}%</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </SettingsSectionCard>
  )
}
