import { Flame, ShieldAlert, Sparkles } from 'lucide-react'

type HomeFocusShowcaseCardProps = {
  monthlyCompletionRate: number
  monthlyFocus: string
  weakestCategory: string
  unlockedCount: number
}

export default function HomeFocusShowcaseCard({
  monthlyCompletionRate,
  monthlyFocus,
  weakestCategory,
  unlockedCount,
}: HomeFocusShowcaseCardProps) {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-zinc-200/70 bg-white/70 p-5 shadow-[0_18px_45px_-30px_rgba(0,0,0,0.55)] dark:border-white/10 dark:bg-zinc-950/45">
      <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-red-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 left-6 h-56 w-56 rounded-full bg-violet-500/10 blur-3xl" />

      <div className="relative z-10 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Painel de foco</p>
          <h3 className="mt-1 text-lg font-semibold text-zinc-900 dark:text-zinc-100">Visão elegante do seu ritmo</h3>
        </div>
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/20 bg-white/30 dark:bg-white/[0.05]">
          <Sparkles className="h-5 w-5 text-amber-400" />
        </span>
      </div>

      <div className="relative z-10 mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
        <div className="rounded-2xl border border-zinc-300/70 bg-white/65 p-3 dark:border-white/10 dark:bg-white/[0.03]">
          <p className="text-xs text-zinc-500 dark:text-zinc-400">Score mensal</p>
          <p className="mt-1 text-2xl font-semibold text-zinc-900 dark:text-zinc-100">{monthlyCompletionRate}%</p>
        </div>
        <div className="rounded-2xl border border-zinc-300/70 bg-white/65 p-3 dark:border-white/10 dark:bg-white/[0.03]">
          <p className="inline-flex items-center gap-1 text-xs text-zinc-500 dark:text-zinc-400">
            <Flame className="h-3.5 w-3.5 text-red-400" />
            Foco atual
          </p>
          <p className="mt-1 truncate text-sm font-semibold text-zinc-900 dark:text-zinc-100">{monthlyFocus}</p>
        </div>
        <div className="rounded-2xl border border-zinc-300/70 bg-white/65 p-3 dark:border-white/10 dark:bg-white/[0.03]">
          <p className="inline-flex items-center gap-1 text-xs text-zinc-500 dark:text-zinc-400">
            <ShieldAlert className="h-3.5 w-3.5 text-violet-400" />
            Categoria crítica
          </p>
          <p className="mt-1 truncate text-sm font-semibold text-zinc-900 dark:text-zinc-100">{weakestCategory}</p>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{unlockedCount} medalhas desbloqueadas</p>
        </div>
      </div>
    </section>
  )
}
