import { Home } from 'lucide-react'

export default function InicioPage() {
  return (
    <div className="min-w-0 space-y-3 sm:space-y-4">
      <div className="flex min-w-0 flex-wrap items-center gap-2 text-2xl font-semibold text-zinc-900 dark:text-zinc-100 sm:text-3xl">
        <Home className="h-7 w-7 shrink-0 text-red-400 sm:h-8 sm:w-8" />
        <span className="min-w-0">Agenda</span>
      </div>
      <p className="max-w-prose text-sm leading-relaxed text-zinc-600 dark:text-zinc-400 sm:text-base">
        Bem-vindo — aqui você pode começar a montar sua agenda virtual sobre este fundo fosco com
        painéis de vidro.
      </p>
      <button
        type="button"
        className="min-h-11 w-full rounded-xl border border-zinc-300/90 bg-white/80 px-4 py-2.5 text-sm font-medium text-zinc-900 shadow-sm backdrop-blur-md transition hover:border-zinc-400 hover:bg-white sm:w-auto sm:text-base dark:border-white/15 dark:bg-white/10 dark:text-zinc-100 dark:hover:border-white/25 dark:hover:bg-white/15"
      >
        Ação principal
      </button>
    </div>
  )
}
