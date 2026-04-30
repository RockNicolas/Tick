export type GoalStatus = 'active' | 'completed' | 'late'

export type Goal = {
  id: string
  title: string
  category: string
  targetCount: number
  progress: number
  status: GoalStatus
  dueDate: string | null
  completedAt: string | null
  createdAt: string
  updatedAt: string
}

const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '')
const API_PREFIX = `${API_BASE}/api`

function requireLoggedUserId() {
  const raw = localStorage.getItem('tick:user')
  if (!raw) throw new Error('Usuario nao autenticado')
  try {
    const parsed = JSON.parse(raw) as { id?: string }
    if (!parsed?.id) throw new Error('missing id')
    return parsed.id
  } catch {
    throw new Error('Usuario nao autenticado')
  }
}

async function parseErrorMessage(res: Response, fallback: string) {
  try {
    const data = (await res.json()) as { error?: string }
    if (typeof data.error === 'string' && data.error.trim()) return data.error
  } catch {
    // no-op
  }
  return fallback
}

export async function fetchGoals(status?: GoalStatus): Promise<Goal[]> {
  const userId = requireLoggedUserId()
  const params = new URLSearchParams({ userId })
  if (status) params.set('status', status)
  const res = await fetch(`${API_PREFIX}/goals?${params.toString()}`)
  if (!res.ok) throw new Error(await parseErrorMessage(res, 'Falha ao carregar metas'))
  const data = (await res.json()) as { goals?: Goal[] }
  return data.goals ?? []
}

export async function createGoal(input: {
  title: string
  category: string
  targetCount: number
  dueDate?: string
}): Promise<Goal> {
  const userId = requireLoggedUserId()
  const res = await fetch(`${API_PREFIX}/goals`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...input, userId }),
  })
  if (!res.ok) throw new Error(await parseErrorMessage(res, 'Falha ao criar meta'))
  const data = (await res.json()) as { goal: Goal }
  return data.goal
}

export async function updateGoal(
  goalId: string,
  input: {
    title?: string
    category?: string
    progress?: number
    targetCount?: number
    status?: GoalStatus
    dueDate?: string
  },
): Promise<Goal> {
  const userId = requireLoggedUserId()
  const res = await fetch(`${API_PREFIX}/goals/${goalId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...input, userId }),
  })
  if (!res.ok) throw new Error(await parseErrorMessage(res, 'Falha ao atualizar meta'))
  const data = (await res.json()) as { goal: Goal }
  return data.goal
}

export async function deleteGoal(goalId: string): Promise<void> {
  const userId = requireLoggedUserId()
  const res = await fetch(`${API_PREFIX}/goals/${goalId}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId }),
  })
  if (!res.ok) throw new Error(await parseErrorMessage(res, 'Falha ao excluir meta'))
}
