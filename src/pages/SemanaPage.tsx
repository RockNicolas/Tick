import { useState } from 'react'
import SemanaCadastroMensalLink from '../components/semana/SemanaCadastroMensalLink'
import SemanaFetchError from '../components/semana/SemanaFetchError'
import SemanaTimeline from '../components/semana/SemanaTimeline'
import SemanaToolbar from '../components/semana/SemanaToolbar'
import { useSemanaWeek } from '../hooks/useSemanaWeek'
import type { PeriodId } from '../lib/semanaCalendar'

export default function SemanaPage() {
  const [period, setPeriod] = useState<PeriodId>('inteiro')
  const { weekDays, viewStart, viewEnd, byDate, loading, error } = useSemanaWeek(period)

  return (
    <div className="flex h-full min-h-0 min-w-0 flex-col gap-3 sm:gap-4">
      <SemanaToolbar period={period} onPeriodChange={setPeriod} />

      {error ? <SemanaFetchError message={error} /> : null}

      <div className="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-2xl border border-zinc-200/80 bg-white/70 shadow-sm dark:border-white/10 dark:bg-black/40">
        <SemanaTimeline
          loading={loading}
          byDate={byDate}
          weekDays={weekDays}
          viewStart={viewStart}
          viewEnd={viewEnd}
        />

        <SemanaCadastroMensalLink />
      </div>
    </div>
  )
}
