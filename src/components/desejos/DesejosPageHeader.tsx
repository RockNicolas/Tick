import { Gift } from 'lucide-react'

export default function DesejosPageHeader() {
  return (
    <div className="flex min-w-0 items-center gap-2 text-2xl font-semibold text-zinc-900 dark:text-zinc-100 sm:text-3xl">
      <Gift className="h-7 w-7 shrink-0 text-red-400 sm:h-8 sm:w-8" />
      <span>Lista de desejos</span>
    </div>
  )
}
