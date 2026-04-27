export type MonthlyDemand = {
  title: string
  category: string
  note: string
  done: boolean
  priority?: 'baixa' | 'media' | 'importante'
  color?: string
  /** "HH:mm" local; ambos preenchidos aparecem na grade Semana. */
  startTime?: string | null
  endTime?: string | null
}
