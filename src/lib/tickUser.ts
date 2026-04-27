export type TickStoredUser = {
  id: string
  name: string
  email: string
}

export function readTickStoredUser(): TickStoredUser | null {
  const raw = localStorage.getItem('tick:user')
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw) as Partial<TickStoredUser>
    if (!parsed?.id || !parsed?.email) return null
    return {
      id: parsed.id,
      email: parsed.email,
      name: typeof parsed.name === 'string' ? parsed.name : '',
    }
  } catch {
    return null
  }
}

export function getUserInitials(name: string) {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
  if (parts.length === 0) return '??'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0] ?? ''}${parts[parts.length - 1][0] ?? ''}`.toUpperCase()
}
