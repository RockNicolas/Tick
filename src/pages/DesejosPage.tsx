import { useEffect, useMemo, useState } from 'react'
import { createWishItem, deleteWishItem, fetchWishlist, updateWishItem } from '../api/wishlist'
import DesejosPageHeader from '../components/desejos/DesejosPageHeader'
import DesejosSummary from '../components/desejos/DesejosSummary'
import DesejosWishlistSection from '../components/desejos/DesejosWishlistSection'
import type { WishItem } from '../components/perfil/types'

export default function DesejosPage() {
  const [wishItems, setWishItems] = useState<WishItem[]>([])
  const [newWishTitle, setNewWishTitle] = useState('')
  const [newWishLink, setNewWishLink] = useState('')
  const [newWishCategory, setNewWishCategory] = useState('geral')
  const [newWishPriority, setNewWishPriority] = useState<'baixa' | 'media' | 'alta'>('media')
  const [wishlistError, setWishlistError] = useState('')

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const items = await fetchWishlist()
        if (cancelled) return
        setWishItems(
          items.map(({ id, title, link, category, priority, done, createdAt, updatedAt }) => ({
            id,
            title,
            link,
            category,
            priority,
            done,
            createdAt,
            updatedAt,
          })),
        )
      } catch (error) {
        if (cancelled) return
        setWishlistError(error instanceof Error ? error.message : 'Falha ao carregar lista de desejos')
        setWishItems([])
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const doneWishCount = useMemo(() => wishItems.filter((item) => item.done).length, [wishItems])

  return (
    <div className="min-w-0 space-y-4">
      <DesejosPageHeader />
      <DesejosSummary doneWishCount={doneWishCount} />
      {wishlistError ? <p className="text-sm text-red-500">{wishlistError}</p> : null}
      <DesejosWishlistSection
        wishItems={wishItems}
        newWishTitle={newWishTitle}
        newWishLink={newWishLink}
        newWishCategory={newWishCategory}
        newWishPriority={newWishPriority}
        onNewWishTitleChange={setNewWishTitle}
        onNewWishLinkChange={setNewWishLink}
        onNewWishCategoryChange={setNewWishCategory}
        onNewWishPriorityChange={setNewWishPriority}
        onAddWishItem={() => {
          const title = newWishTitle.trim()
          const link = newWishLink.trim()
          if (!title || !link) return
          setWishlistError('')
          ;(async () => {
            try {
              const created = await createWishItem({
                title,
                link,
                category: newWishCategory,
                priority: newWishPriority,
              })
              setWishItems((prev) => [
                ...prev,
                {
                  id: created.id,
                  title: created.title,
                  link: created.link,
                  category: created.category,
                  priority: created.priority,
                  done: created.done,
                  createdAt: created.createdAt,
                  updatedAt: created.updatedAt,
                },
              ])
              setNewWishTitle('')
              setNewWishLink('')
              setNewWishCategory('geral')
              setNewWishPriority('media')
            } catch (error) {
              setWishlistError(error instanceof Error ? error.message : 'Falha ao adicionar item')
            }
          })()
        }}
        onToggleWishItem={(id) =>
          setWishItems((prev) => {
            const target = prev.find((entry) => entry.id === id)
            if (!target) return prev
            const nextDone = !target.done
            setWishlistError('')
            ;(async () => {
              try {
                await updateWishItem(id, { done: nextDone })
              } catch (error) {
                setWishlistError(error instanceof Error ? error.message : 'Falha ao atualizar item')
                setWishItems((rollback) =>
                  rollback.map((entry) => (entry.id === id ? { ...entry, done: target.done } : entry)),
                )
              }
            })()
            return prev.map((entry) => (entry.id === id ? { ...entry, done: nextDone } : entry))
          })
        }
        onEditWishItem={(id, input) => {
          const title = input.title.trim()
          const link = input.link.trim()
          if (!title || !link) return
          const previous = wishItems.find((item) => item.id === id)
          if (!previous) return
          setWishlistError('')
          setWishItems((prev) =>
            prev.map((entry) =>
              entry.id === id
                ? { ...entry, title, link, category: input.category, priority: input.priority }
                : entry,
            ),
          )
          ;(async () => {
            try {
              const updated = await updateWishItem(id, {
                title,
                link,
                category: input.category,
                priority: input.priority,
              })
              setWishItems((prev) =>
                prev.map((entry) =>
                  entry.id === id
                    ? {
                        ...entry,
                        title: updated.title,
                        link: updated.link,
                        category: updated.category,
                        priority: updated.priority,
                        updatedAt: updated.updatedAt,
                      }
                    : entry,
                ),
              )
            } catch (error) {
              setWishlistError(error instanceof Error ? error.message : 'Falha ao editar item')
              setWishItems((prev) => prev.map((entry) => (entry.id === id ? previous : entry)))
            }
          })()
        }}
        onDeleteWishItem={(id) => {
          const previous = wishItems
          setWishlistError('')
          setWishItems((prev) => prev.filter((entry) => entry.id !== id))
          ;(async () => {
            try {
              await deleteWishItem(id)
            } catch (error) {
              setWishlistError(error instanceof Error ? error.message : 'Falha ao excluir item')
              setWishItems(previous)
            }
          })()
        }}
      />
    </div>
  )
}
