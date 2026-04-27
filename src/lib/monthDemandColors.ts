export function colorFromPriority(priority: 'baixa' | 'media' | 'importante'): string {
  if (priority === 'baixa') return '#3b82f6'
  if (priority === 'importante') return '#ef4444'
  return '#f59e0b'
}
