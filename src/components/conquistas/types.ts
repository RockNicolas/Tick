import type { ComponentType } from 'react'
import type { LucideProps } from 'lucide-react'

export type MedalProgress = {
  id: string
  title: string
  description: string
  icon: ComponentType<LucideProps>
  colorClass: string
  current: number
  target: number
  percent: number
  unlocked: boolean
}
