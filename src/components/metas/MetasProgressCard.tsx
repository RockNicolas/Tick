import type { GoalStatus } from '../../api/goals'
import { METAS_TABS } from '../../constants/metasTabs'

type MetasProgressCardProps = {
  monthProgress: number
  completedRate: number
  selectedTab: GoalStatus
  goalCount: number
}

export default function MetasProgressCard({
  monthProgress,
  completedRate,
  selectedTab,
  goalCount,
}: MetasProgressCardProps) {
  return (
    <section className="rounded-2xl border border-zinc-200/70 bg-white/60 p-4 dark:border-white/10 dark:bg-black/30">
      <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Progresso do Mês</h2>
      <div className="mt-4 flex items-center gap-4">
        <div
          className="relative h-20 w-20 rounded-full"
          style={{
            background: `conic-gradient(rgb(45 212 191) ${monthProgress * 3.6}deg, rgba(148,163,184,0.25) 0deg)`,
          }}
        >
          <div className="absolute inset-[7px] grid place-items-center rounded-full bg-zinc-900/80 text-sm font-semibold text-white">
            {monthProgress}%
          </div>
        </div>
        <div className="space-y-1 text-sm">
          <p className="font-semibold text-zinc-900 dark:text-zinc-100">{monthProgress}%</p>
          <p className="text-zinc-600 dark:text-zinc-400">Progresso Mês</p>
          <p className="font-semibold text-zinc-900 dark:text-zinc-100">{completedRate}%</p>
          <p className="text-zinc-600 dark:text-zinc-400">Concluídas</p>
        </div>
      </div>
      <div className="mt-4 rounded-xl border border-zinc-200/80 bg-white/70 px-3 py-2.5 dark:border-white/10 dark:bg-white/5">
        <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
          {METAS_TABS.find((t) => t.id === selectedTab)?.label}
        </p>
        <p className="text-xs text-zinc-600 dark:text-zinc-400">{goalCount} metas</p>
      </div>
    </section>
  )
}
