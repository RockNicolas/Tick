import { useEffect, useMemo, useState } from 'react'
import { createWishItem, fetchWishlist, updateWishItem } from '../api/wishlist'
import DesejosPageHeader from '../components/desejos/DesejosPageHeader'
import DesejosSummary from '../components/desejos/DesejosSummary'
import DesejosWishlistSection from '../components/desejos/DesejosWishlistSection'
import type { WishItem } from '../components/perfil/types'

export default function DesejosPage() {
  const [wishItems, setWishItems] = useState<WishItem[]>([])
  const [newWishTitle, setNewWishTitle] = useState('')
  const [newWishLink, setNewWishLink] = useState('')
  const [wishlistError, setWishlistError] = useState('')

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const items = await fetchWishlist()
        if (cancelled) return
        setWishItems(items.map(({ id, title, link, done }) => ({ id, title, link, done })))
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
        onNewWishTitleChange={setNewWishTitle}
        onNewWishLinkChange={setNewWishLink}
        onAddWishItem={() => {
          const title = newWishTitle.trim()
          const link = newWishLink.trim()
          if (!title || !link) return
          setWishlistError('')
          ;(async () => {
            try {
              const created = await createWishItem({ title, link })
              setWishItems((prev) => [...prev, { id: created.id, title: created.title, link: created.link, done: created.done }])
              setNewWishTitle('')
              setNewWishLink('')
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
      />
    </div>
  )
}
