import { CalendarDays } from 'lucide-react'

export default function SemanaPage() {
  return (
    <div className="min-w-0 space-y-3 sm:space-y-4">
      <div className="flex min-w-0 flex-wrap items-center gap-2 text-2xl font-semibold text-zinc-900 dark:text-zinc-100 sm:text-3xl">
        <CalendarDays className="h-7 w-7 shrink-0 text-red-400 sm:h-8 sm:w-8" />
        <span className="min-w-0">Semana</span>
      </div>
      <p className="max-w-prose text-sm leading-relaxed text-zinc-600 dark:text-zinc-400 sm:text-base">
        Visão semanal da sua agenda — conteúdo em construção.
      </p>
    </div>
  )
}
