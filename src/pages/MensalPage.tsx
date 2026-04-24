import { Calendar } from 'lucide-react'

export default function MensalPage() {
  return (
    <div className="min-w-0 space-y-3 sm:space-y-4">
      <div className="flex min-w-0 flex-wrap items-center gap-2 text-2xl font-semibold text-zinc-100 sm:text-3xl">
        <Calendar className="h-7 w-7 shrink-0 text-sky-400 sm:h-8 sm:w-8" />
        <span className="min-w-0">Mensal</span>
      </div>
      <p className="max-w-prose text-sm leading-relaxed text-zinc-400 sm:text-base">
        Visão mensal da sua agenda — conteúdo em construção.
      </p>
    </div>
  )
}
