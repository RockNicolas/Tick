import { CalendarClock } from 'lucide-react'
import type { HomeUpcomingItem } from '../../hooks/useHomeDashboard'

type HomeUpcomingCardProps = {
  isLoading: boolean
  upcomingItems: HomeUpcomingItem[]
}

function toBrDate(dateKey: string) {
  const parsed = new Date(`${dateKey}T00:00:00`)
  if (Number.isNaN(parsed.getTime())) return dateKey
  return parsed.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
}

export default function HomeUpcomingCard({ isLoading, upcomingItems }: HomeUpcomingCardProps) {
  const importantItems = upcomingItems.filter((item) => item.priority === 'importante')

  return (
    <section className="rounded-2xl border border-zinc-200/90 bg-white/70 p-4 shadow-sm dark:border-white/10 dark:bg-black/35">
      <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Demandas importantes</h3>
      {isLoading ? (
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">Carregando demandas importantes...</p>
      ) : importantItems.length === 0 ? (
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">Nenhuma demanda importante no momento.</p>
      ) : (
        <div className="mt-3 space-y-2">
          {importantItems.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between gap-2 rounded-lg border border-red-300/50 bg-red-500/5 px-2.5 py-2 dark:border-red-400/30 dark:bg-red-500/10"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-100">{item.title}</p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">{item.category}</p>
              </div>
              <span className="inline-flex items-center gap-1 text-xs text-zinc-500 dark:text-zinc-400">
                <CalendarClock className="h-4 w-4" />
                {toBrDate(item.dateKey)} {item.startTime ?? '--:--'}
              </span>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
