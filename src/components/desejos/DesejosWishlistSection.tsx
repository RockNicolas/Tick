import PerfilWishlistMarcosCard from '../perfil/PerfilWishlistMarcosCard'
import type { WishItem } from '../perfil/types'

type DesejosWishlistSectionProps = {
  wishItems: WishItem[]
  newWishTitle: string
  newWishLink: string
  onNewWishTitleChange: (value: string) => void
  onNewWishLinkChange: (value: string) => void
  onAddWishItem: () => void
  onToggleWishItem: (id: string) => void
}

export default function DesejosWishlistSection({
  wishItems,
  newWishTitle,
  newWishLink,
  onNewWishTitleChange,
  onNewWishLinkChange,
  onAddWishItem,
  onToggleWishItem,
}: DesejosWishlistSectionProps) {
  return (
    <div className="max-w-2xl">
      <PerfilWishlistMarcosCard
        wishItems={wishItems}
        newWishTitle={newWishTitle}
        newWishLink={newWishLink}
        onNewWishTitleChange={onNewWishTitleChange}
        onNewWishLinkChange={onNewWishLinkChange}
        onAddWishItem={onAddWishItem}
        onToggleWishItem={onToggleWishItem}
      />
    </div>
  )
}
