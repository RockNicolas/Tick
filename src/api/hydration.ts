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

export async function fetchHydrationForDate(dateKey: string): Promise<number> {
  const userId = requireLoggedUserId()
  const params = new URLSearchParams({ userId, dateKey })
  const res = await fetch(`${API_PREFIX}/hydration?${params.toString()}`)
  if (!res.ok) throw new Error(await parseErrorMessage(res, 'Falha ao carregar hidratacao'))
  const data = (await res.json()) as { cups?: number }
  return Math.max(0, Math.min(3, Math.round(Number(data.cups ?? 0))))
}

export async function upsertHydrationForDate(dateKey: string, cups: number): Promise<number> {
  const userId = requireLoggedUserId()
  const normalizedCups = Math.max(0, Math.min(3, Math.round(cups)))
  const res = await fetch(`${API_PREFIX}/hydration`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, dateKey, cups: normalizedCups }),
  })
  if (!res.ok) throw new Error(await parseErrorMessage(res, 'Falha ao salvar hidratacao'))
  const data = (await res.json()) as { cups?: number }
  return Math.max(0, Math.min(3, Math.round(Number(data.cups ?? normalizedCups))))
}
