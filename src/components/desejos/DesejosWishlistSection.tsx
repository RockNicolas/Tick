import {
  CheckCircle2,
  ExternalLink,
  ImageIcon,
  Pencil,
  Plus,
  Search,
  ShoppingCart,
  Trash2,
  X,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import type { WishItem } from '../perfil/types'

type DesejosWishlistSectionProps = {
  wishItems: WishItem[]
  newWishTitle: string
  newWishLink: string
  newWishCategory: string
  newWishPriority: 'baixa' | 'media' | 'alta'
  onNewWishTitleChange: (value: string) => void
  onNewWishLinkChange: (value: string) => void
  onNewWishCategoryChange: (value: string) => void
  onNewWishPriorityChange: (value: 'baixa' | 'media' | 'alta') => void
  onAddWishItem: () => void
  onToggleWishItem: (id: string) => void
  onEditWishItem: (
    id: string,
    input: { title: string; link: string; category: string; priority: 'baixa' | 'media' | 'alta' },
  ) => void
  onDeleteWishItem: (id: string) => void
}

export default function DesejosWishlistSection({
  wishItems,
  newWishTitle,
  newWishLink,
  newWishCategory,
  newWishPriority,
  onNewWishTitleChange,
  onNewWishLinkChange,
  onNewWishCategoryChange,
  onNewWishPriorityChange,
  onAddWishItem,
  onToggleWishItem,
  onEditWishItem,
  onDeleteWishItem,
}: DesejosWishlistSectionProps) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'alta' | 'media' | 'baixa'>('all')
  const [previewByLink, setPreviewByLink] = useState<Record<string, string>>({})
  const [logoByLink, setLogoByLink] = useState<Record<string, string>>({})
  const [brokenLogoByLink, setBrokenLogoByLink] = useState<Record<string, boolean>>({})
  const [priceByLink, setPriceByLink] = useState<Record<string, string>>({})
  const [editingItem, setEditingItem] = useState<WishItem | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editLink, setEditLink] = useState('')
  const [editCategory, setEditCategory] = useState('geral')
  const [editPriority, setEditPriority] = useState<'baixa' | 'media' | 'alta'>('media')

  const priorityOrder: Record<'baixa' | 'media' | 'alta', number> = {
    alta: 0,
    media: 1,
    baixa: 2,
  }

  const resolveBrandLogo = (link: string) => {
    if (brokenLogoByLink[link]) return ''
    try {
      const host = new URL(link).hostname.replace(/^www\./i, '').toLowerCase()
      if (host.includes('amazon.')) return 'https://www.amazon.com.br/favicon.ico'
      if (host.includes('mercadolivre.')) return 'https://www.mercadolivre.com.br/favicon.ico'
      if (host.includes('aliexpress.')) return 'https://www.aliexpress.com/favicon.ico'
      if (host.includes('magazineluiza.')) return 'https://www.magazineluiza.com.br/favicon.ico'
      return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(host)}&sz=64`
    } catch {
      // ignore malformed url
    }
    return logoByLink[link] || ''
  }

  const resolveBrandInitial = (link: string) => {
    try {
      const host = new URL(link).hostname.replace(/^www\./i, '')
      return host.charAt(0).toUpperCase() || 'S'
    } catch {
      return 'S'
    }
  }

  useEffect(() => {
    const linksToFetch = wishItems
      .map((item) => item.link.trim())
      .filter((link) => link.length > 0 && (!previewByLink[link] || !logoByLink[link] || !priceByLink[link]))
    if (linksToFetch.length === 0) return

    let cancelled = false
    ;(async () => {
      for (const link of linksToFetch) {
        try {
          const res = await fetch(`/api/link-preview?url=${encodeURIComponent(link)}`)
          if (!res.ok) continue
          const data = (await res.json()) as { logoUrl?: string; priceText?: string | null; imageUrl?: string }
          if (cancelled) continue
          if (data.imageUrl) {
            setPreviewByLink((prev) => ({ ...prev, [link]: data.imageUrl as string }))
          }
          if (data.logoUrl) {
            setLogoByLink((prev) => ({ ...prev, [link]: data.logoUrl as string }))
          }
          if (data.priceText) {
            setPriceByLink((prev) => ({ ...prev, [link]: data.priceText as string }))
          }
        } catch {
          // keep graceful fallback
        }
      }
    })()
    return () => {
      cancelled = true
    }
  }, [wishItems, previewByLink, logoByLink, priceByLink])

  const filteredAndSorted = useMemo(() => {
    const filtered = wishItems.filter((item) => {
      const q = searchTerm.trim().toLowerCase()
      const matchesSearch = !q || item.title.toLowerCase().includes(q) || item.link.toLowerCase().includes(q)
      const matchesPriority = priorityFilter === 'all' || item.priority === priorityFilter
      return matchesSearch && matchesPriority
    })

    const sorted = [...filtered]
    sorted.sort((a, b) => {
      const byPriority = priorityOrder[a.priority] - priorityOrder[b.priority]
      if (byPriority !== 0) return byPriority
      const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0
      const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0
      return tb - ta
    })
    return sorted
  }, [wishItems, searchTerm, priorityFilter])

  const submitNewWish = () => {
    if (!newWishTitle.trim() || !newWishLink.trim()) return
    onAddWishItem()
    setIsAddModalOpen(false)
  }

  const openEditModal = (item: WishItem) => {
    setEditingItem(item)
    setEditTitle(item.title)
    setEditLink(item.link)
    setEditCategory(item.category)
    setEditPriority(item.priority)
  }

  const submitEdit = () => {
    if (!editingItem) return
    onEditWishItem(editingItem.id, {
      title: editTitle,
      link: editLink,
      category: editCategory,
      priority: editPriority,
    })
    setEditingItem(null)
  }

  return (
    <section className="rounded-2xl border border-zinc-200/80 bg-white/70 p-4 shadow-sm dark:border-white/10 dark:bg-zinc-950/30">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100"></h3>
        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/40 bg-emerald-500/80 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-500"
        >
          <Plus className="h-4 w-4" />
          Adicionar
        </button>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <label className="flex min-w-[220px] flex-1 items-center gap-2 rounded-lg border border-zinc-300/70 bg-white/70 px-3 py-2 text-sm text-zinc-500 dark:border-white/10 dark:bg-black/20 dark:text-zinc-400">
          <Search className="h-4 w-4" />
          <input
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Pesquisar desejos"
            className="w-full bg-transparent text-zinc-900 outline-none placeholder:text-zinc-400 dark:text-zinc-100"
          />
        </label>
        <div className="inline-flex items-center gap-1 rounded-lg border border-zinc-300/70 bg-white/70 p-1 text-xs dark:border-white/10 dark:bg-black/20">
          {(['all', 'alta', 'media', 'baixa'] as const).map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setPriorityFilter(value)}
              className={`rounded-md px-2.5 py-1.5 font-medium transition ${
                priorityFilter === value
                  ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                  : 'text-zinc-600 hover:bg-zinc-200/70 dark:text-zinc-300 dark:hover:bg-white/10'
              }`}
            >
              {value === 'all' ? 'Todas prioridades' : value[0].toUpperCase() + value.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 xl:grid-cols-2">
        {filteredAndSorted.length === 0 ? (
          <p className="rounded-xl border border-dashed border-zinc-300/70 px-3 py-5 text-center text-sm text-zinc-500 dark:border-white/10 dark:text-zinc-400">
            Nenhum desejo encontrado.
          </p>
        ) : (
          filteredAndSorted.map((item) => (
            <article
              key={item.id}
              className="rounded-2xl border border-zinc-200/80 bg-white/80 p-3 shadow-sm dark:border-white/10 dark:bg-black/25"
            >
              <div className="flex items-start gap-3">
                <div className="h-24 w-24 shrink-0 overflow-hidden rounded-xl border border-zinc-200/80 bg-zinc-100 dark:border-white/10 dark:bg-zinc-900/70">
                  {previewByLink[item.link] ? (
                    <img
                      src={previewByLink[item.link]}
                      alt={`Imagem do produto ${item.title}`}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="grid h-full w-full place-items-center">
                      <ImageIcon className="h-6 w-6 text-zinc-400 dark:text-zinc-500" />
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <h4
                      className={`line-clamp-2 text-lg font-semibold ${
                        item.done ? 'text-zinc-500 line-through dark:text-zinc-500' : 'text-zinc-900 dark:text-zinc-100'
                      }`}
                    >
                      {item.title}
                    </h4>
                    <button
                      type="button"
                      onClick={() => onToggleWishItem(item.id)}
                      className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-zinc-300/80 text-zinc-500 transition hover:border-emerald-500/50 hover:text-emerald-500 dark:border-white/15 dark:text-zinc-300"
                      aria-label={item.done ? 'Marcar como pendente' : 'Marcar como concluido'}
                    >
                      <CheckCircle2 className={`h-4 w-4 ${item.done ? 'text-emerald-500' : ''}`} />
                    </button>
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs">
                    <span
                      className={`rounded-full px-2 py-0.5 font-medium ${
                        item.priority === 'alta'
                          ? 'bg-red-500/20 text-red-300'
                          : item.priority === 'baixa'
                            ? 'bg-sky-500/20 text-sky-300'
                            : 'bg-amber-500/20 text-amber-200'
                      }`}
                    >
                      Prioridade: {item.priority}
                    </span>
                    <span className="rounded-full bg-zinc-500/20 px-2 py-0.5 font-medium text-zinc-300">
                      Categoria: {item.category}
                    </span>
                  </div>
                  <p className="mt-1 text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
                    {priceByLink[item.link] ?? '--'}
                  </p>
                  <a
                    href={item.link}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-1 inline-flex max-w-full items-center gap-1 truncate text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    <span className="truncate">{item.link}</span>
                    <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                  </a>
                  <div className="mt-1 inline-flex items-center justify-center rounded-md border border-white/80 bg-white px-1.5 py-1 shadow-sm dark:border-white/30 dark:bg-zinc-100">
                    {resolveBrandLogo(item.link) ? (
                      <img
                        src={resolveBrandLogo(item.link)}
                        alt="Logo da loja"
                        className="h-6 w-6 object-contain"
                        onError={() => {
                          setBrokenLogoByLink((prev) => ({ ...prev, [item.link]: true }))
                        }}
                      />
                    ) : (
                      <span className="grid h-6 w-6 place-items-center text-base font-bold text-zinc-900">
                        {resolveBrandInitial(item.link)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2">
                <a
                  href={item.link}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-1 rounded-lg border border-zinc-300/80 bg-white/70 px-2 py-2 text-sm text-zinc-800 transition hover:bg-zinc-100 dark:border-white/10 dark:bg-white/10 dark:text-zinc-100 dark:hover:bg-white/15"
                >
                  <ShoppingCart className="h-4 w-4" />
                  Comprar
                </a>
                <button
                  type="button"
                  onClick={() => openEditModal(item)}
                  className="inline-flex items-center justify-center gap-1 rounded-lg border border-zinc-300/80 bg-white/70 px-2 py-2 text-sm text-zinc-800 transition hover:bg-zinc-100 dark:border-white/10 dark:bg-white/10 dark:text-zinc-100 dark:hover:bg-white/15"
                >
                  <Pencil className="h-4 w-4" />
                  Editar
                </button>
                <button
                  type="button"
                  onClick={() => onDeleteWishItem(item.id)}
                  className="inline-flex items-center justify-center gap-1 rounded-lg border border-red-300/70 bg-red-50/70 px-2 py-2 text-sm text-red-700 transition hover:bg-red-100 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300 dark:hover:bg-red-500/20"
                >
                  <Trash2 className="h-4 w-4" />
                  Excluir
                </button>
              </div>
            </article>
          ))
        )}
      </div>

      {isAddModalOpen ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/55 p-4" onClick={() => setIsAddModalOpen(false)}>
          <div
            className="w-full max-w-md rounded-2xl border border-zinc-200/90 bg-white p-4 shadow-2xl dark:border-white/10 dark:bg-zinc-900"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-2">
              <h4 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Novo item da lista</h4>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-300/80 text-zinc-700 transition hover:bg-zinc-100 dark:border-white/15 dark:text-zinc-200 dark:hover:bg-white/10"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-3 space-y-2">
              <input
                value={newWishTitle}
                onChange={(event) => onNewWishTitleChange(event.target.value)}
                placeholder="Nome do produto"
                className="w-full rounded-lg border border-zinc-300/80 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition focus:border-emerald-500/60 dark:border-white/10 dark:bg-black/40 dark:text-zinc-100"
              />
              <input
                value={newWishLink}
                onChange={(event) => onNewWishLinkChange(event.target.value)}
                placeholder="https://link-do-produto.com"
                className="w-full rounded-lg border border-zinc-300/80 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition focus:border-emerald-500/60 dark:border-white/10 dark:bg-black/40 dark:text-zinc-100"
              />
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={newWishCategory}
                  onChange={(event) => onNewWishCategoryChange(event.target.value)}
                  className="w-full rounded-lg border border-zinc-300/80 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition focus:border-emerald-500/60 dark:border-white/10 dark:bg-black/40 dark:text-zinc-100"
                >
                  <option value="geral">Categoria: Geral</option>
                  <option value="tecnologia">Categoria: Tecnologia</option>
                  <option value="casa">Categoria: Casa</option>
                  <option value="moda">Categoria: Moda</option>
                  <option value="livros">Categoria: Livros</option>
                  <option value="outros">Categoria: Outros</option>
                </select>
                <select
                  value={newWishPriority}
                  onChange={(event) =>
                    onNewWishPriorityChange(event.target.value as 'baixa' | 'media' | 'alta')
                  }
                  className="w-full rounded-lg border border-zinc-300/80 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition focus:border-emerald-500/60 dark:border-white/10 dark:bg-black/40 dark:text-zinc-100"
                >
                  <option value="alta">Prioridade: Alta</option>
                  <option value="media">Prioridade: Media</option>
                  <option value="baixa">Prioridade: Baixa</option>
                </select>
              </div>
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
                className="inline-flex items-center gap-1 rounded-lg bg-emerald-500 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-emerald-600"
              >
                <Plus className="h-4 w-4" />
                Adicionar
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {editingItem ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/55 p-4" onClick={() => setEditingItem(null)}>
          <div
            className="w-full max-w-md rounded-2xl border border-zinc-200/90 bg-white p-4 shadow-2xl dark:border-white/10 dark:bg-zinc-900"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-2">
              <h4 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Editar item</h4>
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-300/80 text-zinc-700 transition hover:bg-zinc-100 dark:border-white/15 dark:text-zinc-200 dark:hover:bg-white/10"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-3 space-y-2">
              <input
                value={editTitle}
                onChange={(event) => setEditTitle(event.target.value)}
                placeholder="Nome do produto"
                className="w-full rounded-lg border border-zinc-300/80 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition focus:border-emerald-500/60 dark:border-white/10 dark:bg-black/40 dark:text-zinc-100"
              />
              <input
                value={editLink}
                onChange={(event) => setEditLink(event.target.value)}
                placeholder="https://link-do-produto.com"
                className="w-full rounded-lg border border-zinc-300/80 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition focus:border-emerald-500/60 dark:border-white/10 dark:bg-black/40 dark:text-zinc-100"
              />
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={editCategory}
                  onChange={(event) => setEditCategory(event.target.value)}
                  className="w-full rounded-lg border border-zinc-300/80 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition focus:border-emerald-500/60 dark:border-white/10 dark:bg-black/40 dark:text-zinc-100"
                >
                  <option value="geral">Categoria: Geral</option>
                  <option value="tecnologia">Categoria: Tecnologia</option>
                  <option value="casa">Categoria: Casa</option>
                  <option value="moda">Categoria: Moda</option>
                  <option value="livros">Categoria: Livros</option>
                  <option value="outros">Categoria: Outros</option>
                </select>
                <select
                  value={editPriority}
                  onChange={(event) => setEditPriority(event.target.value as 'baixa' | 'media' | 'alta')}
                  className="w-full rounded-lg border border-zinc-300/80 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition focus:border-emerald-500/60 dark:border-white/10 dark:bg-black/40 dark:text-zinc-100"
                >
                  <option value="alta">Prioridade: Alta</option>
                  <option value="media">Prioridade: Media</option>
                  <option value="baixa">Prioridade: Baixa</option>
                </select>
              </div>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="rounded-lg border border-zinc-300/80 px-3 py-1.5 text-sm text-zinc-700 transition hover:bg-zinc-100 dark:border-white/15 dark:text-zinc-200 dark:hover:bg-white/10"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={submitEdit}
                className="inline-flex items-center gap-1 rounded-lg bg-emerald-500 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-emerald-600"
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  )
}
