import { NotepadText } from 'lucide-react'
import type { Goal } from '../../api/goals'
import { categoryDisplayLabel } from '../../lib/categoryOptions'
import SettingsSectionCard from '../settings/SettingsSectionCard'

type PerfilTopMetasCardProps = {
  topMonthlyGoals: Goal[]
}

export default function PerfilTopMetasCard({ topMonthlyGoals }: PerfilTopMetasCardProps) {
  return (
    <SettingsSectionCard title="Top metas do mês" icon={NotepadText}>
      <div className="space-y-2.5">
        {topMonthlyGoals.length === 0 ? (
          <p className="text-xs text-zinc-500 dark:text-zinc-400">Você ainda não tem metas ativas neste mês.</p>
        ) : (
          topMonthlyGoals.map((goal) => (
            <div
              key={goal.id}
              className="rounded-xl border border-zinc-200/80 bg-white/70 p-2.5 dark:border-white/10 dark:bg-white/5"
            >
              <div className="mb-1 flex items-center justify-between gap-2">
                <p className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-100">{goal.title}</p>
                <p className="shrink-0 text-xs text-zinc-600 dark:text-zinc-400">{goal.progress}%</p>
              </div>
              <div className="h-2 rounded-full bg-zinc-200/80 dark:bg-white/10">
                <div
                  className="h-2 rounded-full bg-emerald-500 transition-all"
                  style={{ width: `${Math.max(0, Math.min(100, goal.progress))}%` }}
                />
              </div>
              <p className="mt-1 text-[11px] text-zinc-500 dark:text-zinc-400">
                {categoryDisplayLabel(goal.category)} · {goal.progress >= 70 ? 'Quase lá!' : 'Em andamento'}
              </p>
            </div>
          ))
        )}
      </div>
    </SettingsSectionCard>
  )
}
