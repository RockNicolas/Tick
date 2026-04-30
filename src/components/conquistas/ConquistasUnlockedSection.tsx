import type { MedalProgress } from './types'

type ConquistasUnlockedSectionProps = {
  isLoading: boolean
  unlockedMedals: MedalProgress[]
}

export default function ConquistasUnlockedSection({
  isLoading,
  unlockedMedals,
}: ConquistasUnlockedSectionProps) {
  return (
    <section className="rounded-3xl border border-zinc-200/70 bg-white/65 p-5 shadow-[0_14px_35px_-28px_rgba(0,0,0,0.5)] dark:border-white/10 dark:bg-zinc-950/45">
      <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Medalhas desbloqueadas</h2>
      {isLoading ? (
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">Carregando conquistas...</p>
      ) : unlockedMedals.length === 0 ? (
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">Você ainda não desbloqueou medalhas.</p>
      ) : (
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {unlockedMedals.map(({ id, icon: Icon, colorClass, title, description }) => (
            <article
              key={id}
              className="group rounded-2xl border border-zinc-300/70 bg-white/80 p-3 transition hover:-translate-y-0.5 hover:shadow-[0_10px_20px_-14px_rgba(0,0,0,0.5)] dark:border-white/10 dark:bg-white/[0.03]"
            >
              <span
                title={title}
                className={`inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/10 ${colorClass}`}
              >
                <Icon className="h-5 w-5" />
              </span>
              <p className="mt-2 truncate text-sm font-semibold text-zinc-900 dark:text-zinc-100">{title}</p>
              <p className="mt-0.5 line-clamp-2 text-xs text-zinc-600 dark:text-zinc-400">{description}</p>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}
