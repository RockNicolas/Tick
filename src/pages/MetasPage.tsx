import { Target } from 'lucide-react'

export default function MetasPage() {
  return (
    <div className="min-w-0 space-y-3 sm:space-y-4">
      <div className="flex min-w-0 flex-wrap items-center gap-2 text-2xl font-semibold text-zinc-100 sm:text-3xl">
        <Target className="h-7 w-7 shrink-0 text-emerald-400 sm:h-8 sm:w-8" />
        <span className="min-w-0">Metas</span>
      </div>
      <p className="max-w-prose text-sm leading-relaxed text-zinc-400 sm:text-base">
        Defina e acompanhe metas — conteúdo em construção.
      </p>
    </div>
  )
}
