import type { MedalProgress } from './types'

type ConquistasNextSectionProps = {
  lockedMedals: MedalProgress[]
}

export default function ConquistasNextSection({ lockedMedals }: ConquistasNextSectionProps) {
  return (
    <section className="rounded-3xl border border-zinc-200/70 bg-white/65 p-5 shadow-[0_14px_35px_-28px_rgba(0,0,0,0.5)] dark:border-white/10 dark:bg-zinc-950/45">
      <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Próximas medalhas</h2>
      <div className="mt-4 space-y-3">
        {lockedMedals.map(({ id, icon: Icon, title, description, current, target, percent }) => (
          <div
            key={id}
            className="rounded-2xl border border-zinc-300/70 bg-white/75 p-3 dark:border-white/10 dark:bg-white/[0.03]"
          >
            <div className="mb-2 flex items-center justify-between gap-2">
              <div className="flex min-w-0 items-center gap-2">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-zinc-300/70 bg-zinc-100 text-zinc-600 dark:border-white/10 dark:bg-white/5 dark:text-zinc-300">
                  <Icon className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-100">{title}</p>
                  <p className="truncate text-xs text-zinc-600 dark:text-zinc-400">{description}</p>
                </div>
              </div>
              <span className="text-xs tabular-nums text-zinc-600 dark:text-zinc-300">{percent}%</span>
            </div>
            <div className="h-2 rounded-full bg-zinc-300/70 dark:bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-red-400 to-fuchsia-400 transition-all"
                style={{ width: `${percent}%` }}
              />
            </div>
            <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
              {current}/{target}
            </p>
          </div>
        ))}
        {lockedMedals.length === 0 ? (
          <div className="rounded-2xl border border-emerald-300/50 bg-emerald-500/10 p-3 text-sm text-emerald-700 dark:border-emerald-400/30 dark:text-emerald-300">
            Você desbloqueou todas as medalhas atuais. Excelente evolução.
          </div>
        ) : null}
      </div>
    </section>
  )
}
