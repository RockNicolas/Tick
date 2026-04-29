import { ArrowRight, CheckCircle2, Gift } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { WishItem } from './types'

type PerfilWishlistResumoCardProps = {
  wishItems: WishItem[]
}

export default function PerfilWishlistResumoCard({ wishItems }: PerfilWishlistResumoCardProps) {
  const doneCount = wishItems.filter((item) => item.done).length
  const previewItems = wishItems.slice(0, 3)

  return (
    <section className="rounded-2xl border border-zinc-200/90 bg-white/70 p-4 shadow-sm dark:border-white/10 dark:bg-black/35">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Wishlist</p>
          <h2 className="mt-1 text-xl font-semibold text-zinc-900 dark:text-zinc-100">Seus desejos</h2>
        </div>
        <Gift className="h-5 w-5 text-zinc-500 dark:text-zinc-400" />
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <div className="rounded-xl border border-zinc-200/80 bg-white/80 p-2 dark:border-white/10 dark:bg-white/[0.03]">
          <p className="text-xs text-zinc-500 dark:text-zinc-400">Total</p>
          <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">{wishItems.length}</p>
        </div>
        <div className="rounded-xl border border-zinc-200/80 bg-white/80 p-2 dark:border-white/10 dark:bg-white/[0.03]">
          <p className="text-xs text-zinc-500 dark:text-zinc-400">Concluídos</p>
          <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">{doneCount}</p>
        </div>
      </div>

      <div className="mt-3 space-y-1.5">
        {previewItems.length === 0 ? (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Nenhum item adicionado.</p>
        ) : (
          previewItems.map((item) => (
            <p key={item.id} className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
              <CheckCircle2 className={`h-4 w-4 ${item.done ? 'text-emerald-500' : 'text-zinc-400 dark:text-zinc-500'}`} />
              <span className={`truncate ${item.done ? 'line-through opacity-70' : ''}`}>{item.title}</span>
            </p>
          ))
        )}
      </div>

      <Link
        to="/desejos"
        className="mt-4 inline-flex items-center gap-1.5 rounded-lg border border-zinc-300/80 bg-white/80 px-3 py-1.5 text-sm font-medium text-zinc-800 transition hover:bg-zinc-100 dark:border-white/10 dark:bg-white/10 dark:text-zinc-100 dark:hover:bg-white/15"
      >
        Abrir desejos
        <ArrowRight className="h-4 w-4" />
      </Link>
    </section>
  )
}
