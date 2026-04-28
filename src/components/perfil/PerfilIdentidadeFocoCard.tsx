import { Focus } from 'lucide-react'

type PerfilIdentidadeFocoCardProps = {
  initials: string
  userName: string
  userEmail: string
}

export default function PerfilIdentidadeFocoCard({
  initials,
  userName,
  userEmail,
}: PerfilIdentidadeFocoCardProps) {
  return (
    <section className="rounded-2xl border border-zinc-200/90 bg-white/70 p-5 shadow-sm dark:border-white/10 dark:bg-black/35">
      <div className="flex items-center gap-2 border-b border-zinc-200/80 pb-3 dark:border-white/[0.06]">
        <Focus className="h-4 w-4 shrink-0 text-red-400/90" aria-hidden />
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-800 dark:text-zinc-200">
          Identidade e foco
        </h2>
      </div>
      <div className="mt-4 flex items-center gap-4">
        <div className="inline-flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-zinc-300/80 bg-zinc-100 text-xl font-semibold text-zinc-800 dark:border-white/15 dark:bg-white/10 dark:text-zinc-100">
          {initials}
        </div>
        <div className="min-w-0">
          <p className="truncate text-[15px] font-semibold leading-tight text-zinc-900 dark:text-zinc-100">
            {userName}
          </p>
          <p className="truncate text-xs text-zinc-600 dark:text-zinc-400">{userEmail}</p>
          <p className="mt-1.5 text-[11px] text-zinc-500 dark:text-zinc-500">Membro desde abril de 2026</p>
        </div>
      </div>
    </section>
  )
}
