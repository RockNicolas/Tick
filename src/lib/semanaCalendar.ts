export type PeriodId = 'inteiro' | 'manha' | 'tarde' | 'noite'
export type WeekViewMode = 'grade' | 'grade-lista'

export function periodToViewRange(id: PeriodId): { startMin: number; endMin: number } {
  switch (id) {
    case 'manha':
      return { startMin: 7 * 60, endMin: 12 * 60 }
    case 'tarde':
      return { startMin: 12 * 60, endMin: 18 * 60 }
    case 'noite':
      return { startMin: 18 * 60, endMin: 22 * 60 + 60 }
    default:
      return { startMin: 7 * 60, endMin: 23 * 60 }
  }
}

export function weekDayLetters(): string[] {
  return ['D', 'S', 'T', 'Q', 'Q', 'S', 'S']
}
