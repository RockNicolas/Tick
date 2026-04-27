import { Plus, Square, Target, Wallet, type LucideIcon } from 'lucide-react'

export const metasCategoryIcons: Record<string, LucideIcon> = {
  fitness: Target,
  financas: Wallet,
  leitura: Square,
}

export function getMetasCategoryIcon(category: string): LucideIcon {
  const key = category.toLowerCase()
  return metasCategoryIcons[key] ?? Plus
}
