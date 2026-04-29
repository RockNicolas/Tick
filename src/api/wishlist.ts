export type WishItem = {
  id: string
  title: string
  link: string
  done: boolean
  createdAt: string
  updatedAt: string
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

export async function fetchWishlist(): Promise<WishItem[]> {
  const userId = requireLoggedUserId()
  const params = new URLSearchParams({ userId })
  const res = await fetch(`${API_PREFIX}/wishlist?${params.toString()}`)
  if (!res.ok) throw new Error(await parseErrorMessage(res, 'Falha ao carregar lista de desejos'))
  const data = (await res.json()) as { items?: WishItem[] }
  return data.items ?? []
}

export async function createWishItem(input: { title: string; link: string }): Promise<WishItem> {
  const userId = requireLoggedUserId()
  const res = await fetch(`${API_PREFIX}/wishlist`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...input, userId }),
  })
  if (!res.ok) throw new Error(await parseErrorMessage(res, 'Falha ao criar item de desejo'))
  const data = (await res.json()) as { item: WishItem }
  return data.item
}

export async function updateWishItem(
  wishItemId: string,
  input: {
    title?: string
    link?: string
    done?: boolean
    sortOrder?: number
  },
): Promise<WishItem> {
  const userId = requireLoggedUserId()
  const res = await fetch(`${API_PREFIX}/wishlist/${wishItemId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...input, userId }),
  })
  if (!res.ok) throw new Error(await parseErrorMessage(res, 'Falha ao atualizar item de desejo'))
  const data = (await res.json()) as { item: WishItem }
  return data.item
}

export async function deleteWishItem(wishItemId: string): Promise<void> {
  const userId = requireLoggedUserId()
  const res = await fetch(`${API_PREFIX}/wishlist/${wishItemId}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId }),
  })
  if (!res.ok) throw new Error(await parseErrorMessage(res, 'Falha ao excluir item de desejo'))
}
