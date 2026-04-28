import { Trophy } from 'lucide-react'

type PerfilResumoRapidoCardProps = {
  activeGoalsCount: number
  monthlyCompletionRate: number
  monthlyFocus: string
}

export default function PerfilResumoRapidoCard({
  activeGoalsCount,
  monthlyCompletionRate,
  monthlyFocus,
}: PerfilResumoRapidoCardProps) {
  return (
    <section className="rounded-2xl border border-zinc-200/90 bg-white/70 p-4 shadow-sm dark:border-white/10 dark:bg-black/35">
      <div className="flex items-center gap-2 border-b border-zinc-200/80 pb-2.5 dark:border-white/[0.06]">
        <Trophy className="h-4 w-4 shrink-0 text-red-400/90" aria-hidden />
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-800 dark:text-zinc-200">
          Resumo rápido
        </h2>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2">
        <div className="rounded-xl border border-zinc-200/80 bg-white/70 px-2.5 py-2 dark:border-white/10 dark:bg-white/5">
          <p className="text-[10px] text-zinc-500 dark:text-zinc-400">Metas ativas</p>
          <p className="text-lg font-semibold leading-tight text-zinc-900 dark:text-zinc-100">
            {activeGoalsCount}
          </p>
        </div>
        <div className="rounded-xl border border-zinc-200/80 bg-white/70 px-2.5 py-2 dark:border-white/10 dark:bg-white/5">
          <p className="text-[10px] text-zinc-500 dark:text-zinc-400">Taxa mensal</p>
          <p className="text-lg font-semibold leading-tight text-zinc-900 dark:text-zinc-100">
            {monthlyCompletionRate}%
          </p>
        </div>
        <div className="rounded-xl border border-zinc-200/80 bg-white/70 px-2.5 py-2 dark:border-white/10 dark:bg-white/5">
          <p className="text-[10px] text-zinc-500 dark:text-zinc-400">Foco</p>
          <p className="truncate text-lg font-semibold leading-tight text-zinc-900 dark:text-zinc-100">
            {monthlyFocus}
          </p>
        </div>
      </div>
    </section>
  )
}
