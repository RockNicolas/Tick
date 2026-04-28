import { CheckSquare, Plus, Square } from 'lucide-react'
import type { WishItem } from './types'

type PerfilWishlistMarcosCardProps = {
  wishItems: WishItem[]
  newWishTitle: string
  newWishPrice: string
  onNewWishTitleChange: (value: string) => void
  onNewWishPriceChange: (value: string) => void
  onAddWishItem: () => void
  onToggleWishItem: (id: string) => void
}

export default function PerfilWishlistMarcosCard({
  wishItems,
  newWishTitle,
  newWishPrice,
  onNewWishTitleChange,
  onNewWishPriceChange,
  onAddWishItem,
  onToggleWishItem,
}: PerfilWishlistMarcosCardProps) {
  return (
    <section className="rounded-2xl border border-zinc-200/90 bg-white/70 p-4 shadow-sm dark:border-white/10 dark:bg-black/35">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">Lista de desejos</h2>
        <button
          type="button"
          onClick={onAddWishItem}
          className="inline-flex items-center gap-1 rounded-lg border border-zinc-300/80 bg-white/80 px-3 py-1.5 text-sm text-zinc-800 transition hover:bg-zinc-100 dark:border-white/10 dark:bg-white/10 dark:text-zinc-100 dark:hover:bg-white/15"
        >
          <Plus className="h-4 w-4" />
          Adicionar
        </button>
      </div>

      <div className="mt-2 grid grid-cols-[1fr_88px] gap-2">
        <input
          value={newWishTitle}
          onChange={(event) => onNewWishTitleChange(event.target.value)}
          placeholder="Item"
          className="rounded-lg border border-zinc-300/80 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition focus:border-red-400/70 dark:border-white/10 dark:bg-black/40 dark:text-zinc-100 dark:focus:border-red-400/60"
        />
        <input
          value={newWishPrice}
          onChange={(event) => onNewWishPriceChange(event.target.value)}
          placeholder="R$"
          className="rounded-lg border border-zinc-300/80 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition focus:border-red-400/70 dark:border-white/10 dark:bg-black/40 dark:text-zinc-100 dark:focus:border-red-400/60"
        />
      </div>

      <div className="mt-3 space-y-2">
        {wishItems.length === 0 ? (
          <p className="text-xs text-zinc-500 dark:text-zinc-400">Sem itens na sua lista.</p>
        ) : (
          wishItems.map((item) => (
            <div key={item.id} className="flex items-center justify-between gap-2 text-sm">
              <button
                type="button"
                onClick={() => onToggleWishItem(item.id)}
                className="inline-flex h-5 w-5 items-center justify-center text-zinc-500 transition hover:text-emerald-500"
              >
                {item.done ? <CheckSquare className="h-4 w-4 text-emerald-500" /> : <Square className="h-4 w-4" />}
              </button>
              <p
                className={`min-w-0 flex-1 truncate ${
                  item.done ? 'text-zinc-500 line-through dark:text-zinc-500' : 'text-zinc-900 dark:text-zinc-100'
                }`}
              >
                {item.title}
              </p>
              <p className="shrink-0 font-medium text-zinc-700 dark:text-zinc-300">{item.price || '-'}</p>
            </div>
          ))
        )}
      </div>
    </section>
  )
}
