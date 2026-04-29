import { Calendar, Clock, Settings, Sparkles } from 'lucide-react'
import { startTransition, useEffect, useState } from 'react'
import SettingsSectionCard from '../components/settings/SettingsSectionCard'
import SettingsToggleRow from '../components/settings/SettingsToggleRow'
import { SITE_NAME } from '../constants/branding'
import { useTickSettingsVersion } from '../hooks/useTickSettings'
import {
  readAutoOpenTodayPanel,
  readGoalsEnabledForCurrentUser,
  readShowClockSeconds,
  readWeekEnabledForCurrentUser,
  readWishlistEnabledForCurrentUser,
  writeAutoOpenTodayPanel,
  writeGoalsEnabledForCurrentUser,
  writeShowClockSeconds,
  writeWeekEnabledForCurrentUser,
  writeWishlistEnabledForCurrentUser,
} from '../lib/tickSettings'

export default function ConfiguracoesPage() {
  const tickSettingsVersion = useTickSettingsVersion()

  const [autoOpen, setAutoOpen] = useState(() => readAutoOpenTodayPanel())
  const [showSeconds, setShowSeconds] = useState(() => readShowClockSeconds())
  const [weekEnabled, setWeekEnabled] = useState(() => readWeekEnabledForCurrentUser())
  const [goalsEnabled, setGoalsEnabled] = useState(() => readGoalsEnabledForCurrentUser())
  const [wishlistEnabled, setWishlistEnabled] = useState(() => readWishlistEnabledForCurrentUser())

  useEffect(() => {
    startTransition(() => {
      setAutoOpen(readAutoOpenTodayPanel())
      setShowSeconds(readShowClockSeconds())
      setWeekEnabled(readWeekEnabledForCurrentUser())
      setGoalsEnabled(readGoalsEnabledForCurrentUser())
      setWishlistEnabled(readWishlistEnabledForCurrentUser())
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

        <SettingsSectionCard icon={Sparkles} title="Módulos" fillHeight>
          <SettingsToggleRow
            id="toggle-week"
            label="Usar visão Semana"
            description="Exibe ou oculta o módulo Semana no menu lateral para este usuário."
            checked={weekEnabled}
            onChange={(next) => {
              writeWeekEnabledForCurrentUser(next)
              setWeekEnabled(next)
            }}
          />
          <SettingsToggleRow
            id="toggle-goals"
            label="Usar módulo Metas"
            description="Exibe ou oculta o módulo Metas no menu lateral para este usuário."
            checked={goalsEnabled}
            onChange={(next) => {
              writeGoalsEnabledForCurrentUser(next)
              setGoalsEnabled(next)
            }}
          />
          <SettingsToggleRow
            id="toggle-wishlist"
            label="Usar lista de desejos"
            description="Quando desativado, o menu Desejos e o resumo no perfil ficam ocultos para este usuário."
            checked={wishlistEnabled}
            onChange={(next) => {
              writeWishlistEnabledForCurrentUser(next)
              setWishlistEnabled(next)
            }}
          />
        </SettingsSectionCard>

        <SettingsSectionCard icon={Sparkles} title="Sobre" fillHeight>
          <div className="space-y-3 text-sm text-zinc-600 dark:text-zinc-400">
            <p>
              <span className="font-semibold text-zinc-900 dark:text-zinc-200">{SITE_NAME}</span> é um sistema de
              organização pessoal com agenda mensal e semanal, gestão de metas e lista de desejos, tudo integrado
              em um único painel.
            </p>
            <p>
              Primeira versão:{' '}
              <span className="tabular-nums font-semibold text-zinc-900 dark:text-zinc-200">1.0.0</span>
            </p>
          </div>
        </SettingsSectionCard>
      </div>
    </div>
  )
}
