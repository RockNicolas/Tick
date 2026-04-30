import { ArrowRight, Calendar, CalendarDays, Gift, Target, Trophy } from 'lucide-react'
import { Link } from 'react-router-dom'

type HomeQuickActionsCardProps = {
  weekEnabled: boolean
  goalsEnabled: boolean
  wishlistEnabled: boolean
}

export default function HomeQuickActionsCard({
  weekEnabled,
  goalsEnabled,
  wishlistEnabled,
}: HomeQuickActionsCardProps) {
  const actions = [
    { to: '/mensal', label: 'Abrir Mensal', icon: Calendar, visible: true },
    { to: '/semana', label: 'Abrir Semana', icon: CalendarDays, visible: weekEnabled },
    { to: '/metas', label: 'Abrir Metas', icon: Target, visible: goalsEnabled },
    { to: '/desejos', label: 'Abrir Desejos', icon: Gift, visible: wishlistEnabled },
    { to: '/conquistas', label: 'Abrir Conquistas', icon: Trophy, visible: true },
  ]

  return (
    <section className="relative overflow-hidden rounded-3xl border border-zinc-200/80 bg-white/75 p-4 shadow-[0_16px_40px_-30px_rgba(0,0,0,0.6)] dark:border-white/10 dark:bg-zinc-950/45">
      <div className="pointer-events-none absolute -left-12 -top-16 h-44 w-44 rounded-full bg-red-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 right-4 h-44 w-44 rounded-full bg-cyan-500/10 blur-3xl" />
      <h3 className="relative z-10 text-lg font-semibold text-zinc-900 dark:text-zinc-100">Ações rápidas</h3>
      <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
        {actions
          .filter((item) => item.visible)
          .map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className="group relative inline-flex items-center justify-between gap-2 rounded-xl border border-zinc-300/70 bg-white/70 px-3 py-2 text-sm font-medium text-zinc-800 transition hover:-translate-y-0.5 hover:bg-white dark:border-white/10 dark:bg-white/[0.03] dark:text-zinc-100 dark:hover:bg-white/[0.08]"
            >
              <span className="inline-flex items-center gap-2">
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-zinc-300/70 bg-white/80 dark:border-white/10 dark:bg-white/[0.06]">
                  <Icon className="h-4 w-4" />
                </span>
                {label}
              </span>
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
            </Link>
          ))}
      </div>
    </section>
  )
}
