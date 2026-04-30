import { Home } from 'lucide-react'
import { Link } from 'react-router-dom'
import HomeHeroCard from '../components/home/HomeHeroCard'
import HomeQuickActionsCard from '../components/home/HomeQuickActionsCard'
import HomeTodayCard from '../components/home/HomeTodayCard'
import HomeUpcomingCard from '../components/home/HomeUpcomingCard'
import { useHomeDashboard } from '../hooks/useHomeDashboard'
import { readTickStoredUser } from '../lib/tickUser'

export default function InicioPage() {
  const user = readTickStoredUser()
  const {
    isLoading,
    weekEnabled,
    goalsEnabled,
    todayDemands,
    doneTodayCount,
    pendingTodayCount,
    upcomingItems,
  } = useHomeDashboard()
  const nextItem = upcomingItems[0] ?? null

  return (
    <div className="min-w-0 space-y-4 sm:space-y-5">
      <div className="flex min-w-0 flex-wrap items-center gap-2 text-2xl font-semibold text-zinc-900 dark:text-zinc-100 sm:text-3xl">
        <Home className="h-7 w-7 shrink-0 text-red-400 sm:h-8 sm:w-8" />
        <span className="min-w-0">Início</span>
      </div>

      <HomeHeroCard
        userName={user?.name?.trim() || user?.email || 'Usuário Tick'}
        doneTodayCount={doneTodayCount}
        pendingTodayCount={pendingTodayCount}
      />

      <section className="rounded-2xl border border-zinc-200/80 bg-white/75 p-4 shadow-sm dark:border-white/10 dark:bg-zinc-950/40">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Foco de hoje</p>
            <h2 className="mt-1 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              {pendingTodayCount > 0
                ? `Você tem ${pendingTodayCount} pendência${pendingTodayCount > 1 ? 's' : ''} hoje`
                : 'Dia sob controle'}
            </h2>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              {nextItem
                ? `Próxima ação: ${nextItem.title}${nextItem.startTime ? ` às ${nextItem.startTime}` : ''}`
                : 'Sem próxima demanda definida. Planeje seu dia em poucos cliques.'}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              to="/mensal"
              className="rounded-xl border border-zinc-300/80 bg-white/80 px-3 py-2 text-sm font-medium text-zinc-800 transition hover:bg-zinc-100 dark:border-white/10 dark:bg-white/[0.04] dark:text-zinc-100 dark:hover:bg-white/[0.08]"
            >
              Abrir mensal
            </Link>
            {goalsEnabled ? (
              <Link
                to="/metas"
                className="rounded-xl border border-red-400/40 bg-red-500/10 px-3 py-2 text-sm font-medium text-red-700 transition hover:bg-red-500/15 dark:border-red-400/30 dark:text-red-300 dark:hover:bg-red-500/20"
              >
                Revisar metas
              </Link>
            ) : null}
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
        <HomeTodayCard isLoading={isLoading} todayDemands={todayDemands} />
        <HomeUpcomingCard isLoading={isLoading || !weekEnabled} upcomingItems={weekEnabled ? upcomingItems : []} />
      </div>

      <HomeQuickActionsCard weekEnabled={weekEnabled} goalsEnabled={goalsEnabled} wishlistEnabled={true} />
    </div>
  )
}
