import { Calendar, Clock, Keyboard, Settings, Sparkles } from 'lucide-react'
import { startTransition, useEffect, useState } from 'react'
import SettingsSectionCard from '../components/settings/SettingsSectionCard'
import SettingsToggleRow from '../components/settings/SettingsToggleRow'
import { SITE_NAME } from '../constants/branding'
import { useTickSettingsVersion } from '../hooks/useTickSettings'
import {
  readAutoOpenTodayPanel,
  readShowClockSeconds,
  writeAutoOpenTodayPanel,
  writeShowClockSeconds,
} from '../lib/tickSettings'

export default function ConfiguracoesPage() {
  const tickSettingsVersion = useTickSettingsVersion()

  const [autoOpen, setAutoOpen] = useState(() => readAutoOpenTodayPanel())
  const [showSeconds, setShowSeconds] = useState(() => readShowClockSeconds())

  useEffect(() => {
    startTransition(() => {
      setAutoOpen(readAutoOpenTodayPanel())
      setShowSeconds(readShowClockSeconds())
    })
  }, [tickSettingsVersion])

  return (
    <div className="min-w-0 space-y-5 sm:space-y-6">
      <div className="flex min-w-0 flex-wrap items-center gap-2 text-2xl font-semibold text-zinc-900 dark:text-zinc-100 sm:text-3xl">
        <Settings className="h-7 w-7 shrink-0 text-zinc-600 sm:h-8 sm:w-8 dark:text-zinc-300" />
        <span className="min-w-0">Configurações</span>
      </div>
      <p className="max-w-prose text-sm leading-relaxed text-zinc-600 dark:text-zinc-400 sm:text-base">
        Ajustes rápidos do {SITE_NAME}. As opções abaixo ficam salvas neste navegador.
      </p>

      <div className="mx-auto grid max-w-5xl grid-cols-1 gap-4 md:grid-cols-2">
        <SettingsSectionCard icon={Calendar} title="Visão mensal" fillHeight>
          <SettingsToggleRow
            id="toggle-auto-open"
            label="Abrir painel do dia automaticamente"
            description="Se hoje tiver demandas, o painel lateral abre sozinho ao carregar a página mensal."
            checked={autoOpen}
            onChange={(next) => {
              writeAutoOpenTodayPanel(next)
              setAutoOpen(next)
            }}
          />
        </SettingsSectionCard>

        <SettingsSectionCard icon={Clock} title="Aparência" fillHeight>
          <SettingsToggleRow
            id="toggle-seconds"
            label="Mostrar segundos no relógio"
            description="No topo da visão mensal, o relógio pode mostrar ou esconder os segundos."
            checked={showSeconds}
            onChange={(next) => {
              writeShowClockSeconds(next)
              setShowSeconds(next)
            }}
          />
        </SettingsSectionCard>

        <SettingsSectionCard icon={Keyboard} title="Atalhos" fillHeight>
          <ul className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
            <li>
              <span className="font-medium text-zinc-800 dark:text-zinc-300">Esc</span> — fecha o painel de
              demandas do dia (quando aberto).
            </li>
            <li>
              <span className="font-medium text-zinc-800 dark:text-zinc-300">Esc</span> — dentro do modal de
              edição de uma demanda, fecha só o modal.
            </li>
          </ul>
        </SettingsSectionCard>

        <SettingsSectionCard icon={Sparkles} title="Sobre" fillHeight>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            <span className="font-semibold text-zinc-900 dark:text-zinc-200">{SITE_NAME}</span> — agenda e
            demandas com foco no mês atual. Versão do pacote:{' '}
            <span className="tabular-nums text-zinc-800 dark:text-zinc-300">0.0.0</span>
          </p>
        </SettingsSectionCard>
      </div>
    </div>
  )
}
