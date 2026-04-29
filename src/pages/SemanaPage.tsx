import { useState } from 'react'
import SemanaCadastroMensalLink from '../components/semana/SemanaCadastroMensalLink'
import SemanaFetchError from '../components/semana/SemanaFetchError'
import SemanaTimeline from '../components/semana/SemanaTimeline'
import SemanaToolbar from '../components/semana/SemanaToolbar'
import { useTickSettingsVersion } from '../hooks/useTickSettings'
import { readWeekEnabledForCurrentUser } from '../lib/tickSettings'
import { useSemanaWeek } from '../hooks/useSemanaWeek'
import type { PeriodId } from '../lib/semanaCalendar'

export default function SemanaPage() {
  useTickSettingsVersion()
  const weekEnabled = readWeekEnabledForCurrentUser()
  const [period, setPeriod] = useState<PeriodId>('inteiro')
  const { weekDays, viewStart, viewEnd, byDate, loading, error, toggleDemandDone } =
    useSemanaWeek(period)

  if (!weekEnabled) {
    return (
      <div className="space-y-4">
        <p className="rounded-xl border border-zinc-300/70 bg-zinc-50/80 px-4 py-3 text-sm text-zinc-700 dark:border-white/10 dark:bg-white/5 dark:text-zinc-300">
          O módulo Semana está desativado para este usuário. Ative em Configurações para voltar a usar.
        </p>
      </div>
    )
  }

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
          onToggleDone={toggleDemandDone}
        />

        <SemanaCadastroMensalLink />
      </div>
    </div>
  )
}
