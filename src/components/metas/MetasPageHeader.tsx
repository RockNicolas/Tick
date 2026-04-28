import { Target } from 'lucide-react'

export default function MetasPageHeader() {
  return (
    <div className="space-y-4 sm:space-y-5">
      <div className="flex min-w-0 flex-wrap items-center gap-2 text-2xl font-semibold text-zinc-900 dark:text-zinc-100 sm:text-3xl">
        <Target className="h-7 w-7 shrink-0 text-emerald-400 sm:h-8 sm:w-8" />
        <span className="min-w-0">Metas</span>
      </div>
    </div>
  )
}
