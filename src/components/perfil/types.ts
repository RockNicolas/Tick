export type MonthlyCategoryStat = {
  category: string
  label: string
  percent: number
  color: string
}

export type WishItem = {
  id: string
  title: string
  link: string
  category: string
  priority: 'baixa' | 'media' | 'alta'
  done: boolean
  createdAt?: string
  updatedAt?: string
}
