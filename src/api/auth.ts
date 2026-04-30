export type AuthUser = {
  id: string
  name: string
  email: string
}

type AuthResponse = {
  user: AuthUser
}

const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '')
const API_PREFIX = `${API_BASE}/api`

async function parseErrorMessage(res: Response, fallback: string) {
  try {
    const data = (await res.json()) as { error?: string }
    if (typeof data.error === 'string' && data.error.trim()) return data.error
  } catch {
    // no-op
  }
  return fallback
}

export async function registerWithEmail(payload: {
  name: string
  email: string
  password: string
}): Promise<AuthUser> {
  const res = await fetch(`${API_PREFIX}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!res.ok) {
    throw new Error(await parseErrorMessage(res, 'Falha ao criar conta'))
  }
  const data = (await res.json()) as AuthResponse
  return data.user
}

export async function loginWithEmail(payload: { email: string; password: string }): Promise<AuthUser> {
  const res = await fetch(`${API_PREFIX}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!res.ok) {
    throw new Error(await parseErrorMessage(res, 'Falha ao entrar'))
  }
  const data = (await res.json()) as AuthResponse
  return data.user
}
