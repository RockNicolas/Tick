import { CheckSquare, Plus, ShoppingBag, Square } from 'lucide-react'
import SettingsSectionCard from '../settings/SettingsSectionCard'

export type WishItem = {
  id: string
  title: string
  price: string
  done: boolean
}

type PerfilListaDesejosCardProps = {
  wishItems: WishItem[]
  newWishTitle: string
  newWishPrice: string
  onNewWishTitleChange: (value: string) => void
  onNewWishPriceChange: (value: string) => void
  onAddWishItem: () => void
  onToggleWishItem: (id: string) => void
}

export default function PerfilListaDesejosCard({
  wishItems,
  newWishTitle,
  newWishPrice,
  onNewWishTitleChange,
  onNewWishPriceChange,
  onAddWishItem,
  onToggleWishItem,
}: PerfilListaDesejosCardProps) {
  return (
    <SettingsSectionCard title="Lista de desejos & compras" icon={ShoppingBag}>
      <div className="space-y-2.5">
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_auto_auto]">
          <input
            value={newWishTitle}
            onChange={(event) => onNewWishTitleChange(event.target.value)}
            placeholder="Item que quero comprar"
            className="rounded-lg border border-zinc-300/80 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition focus:border-red-400/70 dark:border-white/10 dark:bg-black/40 dark:text-zinc-100 dark:focus:border-red-400/60"
          />
          <input
            value={newWishPrice}
            onChange={(event) => onNewWishPriceChange(event.target.value)}
            placeholder="R$ 0"
            className="rounded-lg border border-zinc-300/80 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition focus:border-red-400/70 dark:border-white/10 dark:bg-black/40 dark:text-zinc-100 dark:focus:border-red-400/60 sm:w-28"
          />
          <button
            type="button"
            onClick={onAddWishItem}
            className="inline-flex items-center justify-center gap-1 rounded-lg border border-zinc-300/80 bg-white/80 px-3 py-2 text-sm text-zinc-800 transition hover:bg-zinc-100 dark:border-white/10 dark:bg-white/10 dark:text-zinc-100 dark:hover:bg-white/15"
          >
            <Plus className="h-4 w-4" aria-hidden />
            Adicionar
          </button>
        </div>

        {wishItems.length === 0 ? (
          <p className="text-xs text-zinc-500 dark:text-zinc-400">Sem itens na sua lista de desejos.</p>
        ) : (
          <div className="space-y-2">
            {wishItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between gap-2 rounded-xl border border-zinc-200/80 bg-white/70 px-2.5 py-2 dark:border-white/10 dark:bg-white/5"
              >
                <button
                  type="button"
                  onClick={() => onToggleWishItem(item.id)}
                  className="inline-flex h-5 w-5 items-center justify-center text-zinc-500 transition hover:text-emerald-500"
                  aria-label={item.done ? 'Marcar como pendente' : 'Marcar como comprado'}
                >
                  {item.done ? (
                    <CheckSquare className="h-4 w-4 text-emerald-500" aria-hidden />
                  ) : (
                    <Square className="h-4 w-4" aria-hidden />
                  )}
                </button>
                <p
                  className={`min-w-0 flex-1 truncate text-sm ${
                    item.done
                      ? 'text-zinc-500 line-through dark:text-zinc-500'
                      : 'text-zinc-900 dark:text-zinc-100'
                  }`}
                >
                  {item.title}
                </p>
                <p className="shrink-0 text-sm text-zinc-600 dark:text-zinc-400">{item.price || '-'}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </SettingsSectionCard>
  )
}
