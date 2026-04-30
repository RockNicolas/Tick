import { CalendarCheck2, Sparkles } from 'lucide-react'

type HomeHeroCardProps = {
  userName: string
  doneTodayCount: number
  pendingTodayCount: number
}

export default function HomeHeroCard({ userName, doneTodayCount, pendingTodayCount }: HomeHeroCardProps) {
  const today = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
  })

  return (
    <section className="rounded-3xl border border-zinc-200/80 bg-gradient-to-br from-white/85 via-white/75 to-zinc-100/70 p-5 shadow-[0_14px_40px_-28px_rgba(0,0,0,0.5)] dark:border-white/10 dark:from-zinc-950/85 dark:via-zinc-900/70 dark:to-black/50">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Resumo do dia</p>
          <h2 className="mt-1 text-xl font-semibold text-zinc-900 dark:text-zinc-100">
            Bem-vindo, {userName.split(' ')[0] || 'Usuário'}
          </h2>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{today}</p>
        </div>
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/20 bg-white/40 dark:bg-white/[0.05]">
          <Sparkles className="h-5 w-5 text-amber-400" />
        </span>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
        <div className="rounded-xl border border-zinc-300/70 bg-white/70 p-3 dark:border-white/10 dark:bg-white/[0.03]">
          <p className="text-xs text-zinc-500 dark:text-zinc-400">Concluídas hoje</p>
          <p className="mt-1 text-2xl font-semibold text-zinc-900 dark:text-zinc-100">{doneTodayCount}</p>
        </div>
        <div className="rounded-xl border border-zinc-300/70 bg-white/70 p-3 dark:border-white/10 dark:bg-white/[0.03]">
          <p className="text-xs text-zinc-500 dark:text-zinc-400">Pendentes</p>
          <p className="mt-1 text-2xl font-semibold text-zinc-900 dark:text-zinc-100">{pendingTodayCount}</p>
        </div>
        <div className="col-span-2 rounded-xl border border-zinc-300/70 bg-white/70 p-3 dark:border-white/10 dark:bg-white/[0.03] sm:col-span-1">
          <p className="text-xs text-zinc-500 dark:text-zinc-400">Status</p>
          <p className="mt-1 inline-flex items-center gap-1 text-sm font-medium text-zinc-900 dark:text-zinc-100">
            <CalendarCheck2 className="h-4 w-4 text-emerald-500" />
            Dia em andamento
          </p>
        </div>
      </div>
    </section>
  )
}
