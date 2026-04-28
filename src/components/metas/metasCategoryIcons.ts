import { BookOpen, Dumbbell, HandCoins, Tag, type LucideIcon } from 'lucide-react'
import { canonicalCategoryId } from '../../lib/categoryOptions'

export const metasCategoryIcons: Record<string, LucideIcon> = {
  fitness: Dumbbell,
  financas: HandCoins,
  leitura: BookOpen,
  outros: Tag,
}

export function getMetasCategoryIcon(category: string): LucideIcon {
  const key = canonicalCategoryId(category)
  return metasCategoryIcons[key] ?? Tag
}
