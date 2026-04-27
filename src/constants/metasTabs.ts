import type { GoalStatus } from '../api/goals'

export const METAS_TABS: Array<{ id: GoalStatus; label: string }> = [
  { id: 'active', label: 'Ativas' },
  { id: 'completed', label: 'Concluídas' },
  { id: 'late', label: 'Atrasadas' },
]
