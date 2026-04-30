export type UserAchievement = {
  id: string
  userId: string
  medalId: string
  unlockedAt: string
}

const API_PREFIX = '/api'

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

export async function fetchUserAchievements(): Promise<UserAchievement[]> {
  const userId = requireLoggedUserId()
  const params = new URLSearchParams({ userId })
  const res = await fetch(`${API_PREFIX}/achievements?${params.toString()}`)
  if (!res.ok) throw new Error(await parseErrorMessage(res, 'Falha ao carregar conquistas'))
  const data = (await res.json()) as { achievements?: UserAchievement[] }
  return data.achievements ?? []
}

export async function unlockAchievement(medalId: string): Promise<UserAchievement> {
  const userId = requireLoggedUserId()
  const res = await fetch(`${API_PREFIX}/achievements/unlock`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, medalId }),
  })
  if (!res.ok) throw new Error(await parseErrorMessage(res, 'Falha ao salvar conquista'))
  const data = (await res.json()) as { achievement: UserAchievement }
  return data.achievement
}
