export const MENSAL_WEEK_HEADERS: string[] = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SAB']

export function buildMonthCells(now: Date): (number | null)[] {
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const totalDays = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
  const firstWeekday = firstDayOfMonth.getDay()

  const cells = Array.from({ length: firstWeekday + totalDays }, (_, index) => {
    const dayNumber = index - firstWeekday + 1
    return dayNumber > 0 ? dayNumber : null
  })

  return [...cells, ...Array.from({ length: 42 - cells.length }, () => null)]
}
