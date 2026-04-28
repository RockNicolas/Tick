export type FixedCategoryId = 'fitness' | 'financas' | 'leitura' | 'outros'

export const FIXED_CATEGORIES: Array<{ id: FixedCategoryId; label: string }> = [
  { id: 'fitness', label: 'Fitness' },
  { id: 'financas', label: 'Finanças' },
  { id: 'leitura', label: 'Leitura' },
  { id: 'outros', label: 'Outros' },
]

function normalize(raw: string | null | undefined): string {
  return typeof raw === 'string' ? raw.trim().toLowerCase() : ''
}

export function canonicalCategoryId(raw: string | null | undefined): FixedCategoryId {
  const value = normalize(raw)
  if (value === 'fitness' || value === 'fitnes' || value === 'academia') return 'fitness'
  if (value === 'financas' || value === 'finanças' || value === 'financeiro') return 'financas'
  if (value === 'leitura' || value === 'livros' || value === 'livro') return 'leitura'
  return 'outros'
}

export function isFixedCategory(raw: string | null | undefined): boolean {
  return canonicalCategoryId(raw) !== 'outros'
}

export function customCategoryName(raw: string | null | undefined): string {
  const value = typeof raw === 'string' ? raw.trim() : ''
  if (!value) return ''
  if (isFixedCategory(value)) return ''
  if (normalize(value) === 'geral' || normalize(value) === 'outros') return ''
  return value
}

export function categoryDisplayLabel(raw: string | null | undefined): string {
  const value = typeof raw === 'string' ? raw.trim() : ''
  const canonical = canonicalCategoryId(value)
  if (canonical === 'fitness') return 'Fitness'
  if (canonical === 'financas') return 'Finanças'
  if (canonical === 'leitura') return 'Leitura'
  return value || 'Outros'
}
