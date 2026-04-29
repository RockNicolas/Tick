import { CheckSquare, ExternalLink, ImageIcon, Link2, Plus, Square, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import type { WishItem } from './types'

type PerfilWishlistMarcosCardProps = {
  wishItems: WishItem[]
  newWishTitle: string
  newWishLink: string
  onNewWishTitleChange: (value: string) => void
  onNewWishLinkChange: (value: string) => void
  onAddWishItem: () => void
  onToggleWishItem: (id: string) => void
}

export default function PerfilWishlistMarcosCard({
  wishItems,
  newWishTitle,
  newWishLink,
  onNewWishTitleChange,
  onNewWishLinkChange,
  onAddWishItem,
  onToggleWishItem,
}: PerfilWishlistMarcosCardProps) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [previewByLink, setPreviewByLink] = useState<Record<string, string>>({})

  const submitNewWish = () => {
    if (!newWishTitle.trim() || !newWishLink.trim()) return
    onAddWishItem()
    setIsAddModalOpen(false)
  }

  useEffect(() => {
    const linksToFetch = wishItems
      .map((item) => item.link.trim())
      .filter((link) => link.length > 0 && !previewByLink[link])

    if (linksToFetch.length === 0) return

    let cancelled = false

    ;(async () => {
      for (const link of linksToFetch) {
        try {
          const res = await fetch(
            `https://api.microlink.io/?url=${encodeURIComponent(link)}&screenshot=true&meta=false`,
          )
          if (!res.ok) continue
          const data = (await res.json()) as {
            data?: {
              image?: { url?: string }
              screenshot?: { url?: string }
              logo?: { url?: string }
            }
          }
          const previewUrl = data.data?.image?.url || data.data?.screenshot?.url || data.data?.logo?.url || ''
          if (cancelled || !previewUrl) continue
          setPreviewByLink((prev) => ({ ...prev, [link]: previewUrl }))
        } catch {
          // no-op: keeps clean fallback if preview is unavailable
        }
      }
    })()

    return () => {
      cancelled = true
    }
  }, [wishItems, previewByLink])

  return (
    <section className="rounded-2xl border border-zinc-200/90 bg-gradient-to-b from-white to-zinc-50/90 p-4 shadow-sm dark:border-white/10 dark:from-zinc-900/55 dark:to-zinc-950/40">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">Lista de desejos</h2>
        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center gap-1 rounded-lg border border-zinc-300/80 bg-white/80 px-3 py-1.5 text-sm text-zinc-800 transition hover:bg-zinc-100 dark:border-white/10 dark:bg-white/10 dark:text-zinc-100 dark:hover:bg-white/15"
        >
          <Plus className="h-4 w-4" />
          Adicionar
        </button>
      </div>

      <div className="mt-3 space-y-2">
        {wishItems.length === 0 ? (
          <p className="rounded-xl border border-dashed border-zinc-300/70 px-3 py-4 text-center text-xs text-zinc-500 dark:border-white/10 dark:text-zinc-400">
            Sem itens na sua lista.
          </p>
        ) : (
          wishItems.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-2 rounded-xl border border-zinc-200/80 bg-white/80 px-2.5 py-2 text-sm shadow-sm dark:border-white/10 dark:bg-black/25"
            >
              <button
                type="button"
                onClick={() => onToggleWishItem(item.id)}
                className="inline-flex h-5 w-5 items-center justify-center text-zinc-500 transition hover:text-emerald-500"
              >
                {item.done ? <CheckSquare className="h-4 w-4 text-emerald-500" /> : <Square className="h-4 w-4" />}
              </button>
              <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-zinc-200/80 bg-zinc-100 dark:border-white/10 dark:bg-zinc-900/70">
                {previewByLink[item.link] ? (
                  <img
                    src={previewByLink[item.link]}
                    alt={`Imagem do produto ${item.title}`}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="grid h-full w-full place-items-center">
                    <ImageIcon className="h-4 w-4 text-zinc-400 dark:text-zinc-500" />
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p
                  className={`truncate font-medium ${
                    item.done ? 'text-zinc-500 line-through dark:text-zinc-500' : 'text-zinc-900 dark:text-zinc-100'
                  }`}
                >
                  {item.title}
                </p>
                <a
                  href={item.link}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-0.5 inline-flex max-w-full items-center gap-1 truncate text-xs text-blue-600 transition hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  <span className="truncate">{item.link}</span>
                  <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                </a>
              </div>
            </div>
          ))
        )}
      </div>
      {isAddModalOpen ? (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4"
          onClick={() => setIsAddModalOpen(false)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="w-full max-w-md rounded-2xl border border-zinc-200/90 bg-white p-4 shadow-2xl dark:border-white/10 dark:bg-zinc-900"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Novo item da lista</h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-300/80 text-zinc-700 transition hover:bg-zinc-100 dark:border-white/15 dark:text-zinc-200 dark:hover:bg-white/10"
                aria-label="Fechar modal"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-3 grid grid-cols-1 gap-2">
              <input
                value={newWishTitle}
                onChange={(event) => onNewWishTitleChange(event.target.value)}
                placeholder="Nome do produto"
                className="rounded-lg border border-zinc-300/80 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition focus:border-red-400/70 dark:border-white/10 dark:bg-black/40 dark:text-zinc-100 dark:focus:border-red-400/60"
              />
              <label className="flex items-center gap-2 rounded-lg border border-zinc-300/80 bg-white px-3 py-2 text-sm text-zinc-600 dark:border-white/10 dark:bg-black/40 dark:text-zinc-300">
                <Link2 className="h-4 w-4 shrink-0 text-zinc-500 dark:text-zinc-400" />
                <input
                  value={newWishLink}
                  onChange={(event) => onNewWishLinkChange(event.target.value)}
                  placeholder="https://link-do-produto.com"
                  className="w-full bg-transparent text-zinc-900 outline-none placeholder:text-zinc-400 dark:text-zinc-100"
                />
              </label>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="rounded-lg border border-zinc-300/80 px-3 py-1.5 text-sm text-zinc-700 transition hover:bg-zinc-100 dark:border-white/15 dark:text-zinc-200 dark:hover:bg-white/10"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={submitNewWish}
                className="inline-flex items-center gap-1 rounded-lg border border-zinc-300/80 bg-zinc-900 px-3 py-1.5 text-sm text-white transition hover:bg-zinc-800 dark:border-white/10 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100"
              >
                <Plus className="h-4 w-4" />
                Adicionar
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  )
}
