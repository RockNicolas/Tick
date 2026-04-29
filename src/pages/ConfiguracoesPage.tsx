import { Bell, Calendar, Clock, Settings, Sparkles, UserRound } from 'lucide-react'
import { startTransition, useEffect, useState } from 'react'
import SettingsSectionCard from '../components/settings/SettingsSectionCard'
import SettingsToggleRow from '../components/settings/SettingsToggleRow'
import { SITE_NAME } from '../constants/branding'
import { useTickSettingsVersion } from '../hooks/useTickSettings'
import {
  readAutoOpenTodayPanel,
  readGoalsEnabledForCurrentUser,
  readNotificationPreferencesForCurrentUser,
  readProfileAchievementsEnabledForCurrentUser,
  readProfileWishlistEnabledForCurrentUser,
  readShowClockSeconds,
  readWaterGoalEnabledForCurrentUser,
  readWeekEnabledForCurrentUser,
  readWishlistEnabledForCurrentUser,
  writeAutoOpenTodayPanel,
  writeGoalsEnabledForCurrentUser,
  writeNotificationPreferencesForCurrentUser,
  writeProfileAchievementsEnabledForCurrentUser,
  writeProfileWishlistEnabledForCurrentUser,
  writeShowClockSeconds,
  writeWaterGoalEnabledForCurrentUser,
  writeWeekEnabledForCurrentUser,
  writeWishlistEnabledForCurrentUser,
} from '../lib/tickSettings'

export default function ConfiguracoesPage() {
  const tickSettingsVersion = useTickSettingsVersion()

  const [autoOpen, setAutoOpen] = useState(() => readAutoOpenTodayPanel())
  const [showSeconds, setShowSeconds] = useState(() => readShowClockSeconds())
  const [weekEnabled, setWeekEnabled] = useState(() => readWeekEnabledForCurrentUser())
  const [goalsEnabled, setGoalsEnabled] = useState(() => readGoalsEnabledForCurrentUser())
  const [waterGoalEnabled, setWaterGoalEnabled] = useState(() => readWaterGoalEnabledForCurrentUser())
  const [profileAchievementsEnabled, setProfileAchievementsEnabled] = useState(() =>
    readProfileAchievementsEnabledForCurrentUser(),
  )
  const [profileWishlistEnabled, setProfileWishlistEnabled] = useState(() =>
    readProfileWishlistEnabledForCurrentUser(),
  )
  const [wishlistEnabled, setWishlistEnabled] = useState(() => readWishlistEnabledForCurrentUser())
  const [notificationPrefs, setNotificationPrefs] = useState(() => readNotificationPreferencesForCurrentUser())

  useEffect(() => {
    startTransition(() => {
      setAutoOpen(readAutoOpenTodayPanel())
      setShowSeconds(readShowClockSeconds())
      setWeekEnabled(readWeekEnabledForCurrentUser())
      setGoalsEnabled(readGoalsEnabledForCurrentUser())
      setWaterGoalEnabled(readWaterGoalEnabledForCurrentUser())
      setProfileAchievementsEnabled(readProfileAchievementsEnabledForCurrentUser())
      setProfileWishlistEnabled(readProfileWishlistEnabledForCurrentUser())
      setWishlistEnabled(readWishlistEnabledForCurrentUser())
      setNotificationPrefs(readNotificationPreferencesForCurrentUser())
    })
  }, [tickSettingsVersion])

  const writeNotificationPrefs = (next: typeof notificationPrefs) => {
    writeNotificationPreferencesForCurrentUser(next)
    setNotificationPrefs(next)
  }

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
              writeNotificationPrefs({
                ...notificationPrefs,
                enabled: next ? true : notificationPrefs.enabled,
                categories: {
                  ...notificationPrefs.categories,
                  progress: next ? true : false,
                },
                waterRemindersEnabled: next ? true : false,
              })
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
          <SettingsToggleRow
            id="toggle-water-goal"
            label="Usar meta de água"
            description="Exibe ou oculta o card de hidratação na página de metas para este usuário."
            checked={waterGoalEnabled}
            onChange={(next) => {
              writeWaterGoalEnabledForCurrentUser(next)
              setWaterGoalEnabled(next)
              writeNotificationPrefs({
                ...notificationPrefs,
                enabled: next ? true : notificationPrefs.enabled,
                waterRemindersEnabled: next ? true : false,
              })
            }}
          />
        </SettingsSectionCard>

        <SettingsSectionCard icon={UserRound} title="Perfil" fillHeight>
          <SettingsToggleRow
            id="toggle-profile-achievements"
            label="Mostrar conquistas no perfil"
            description="Exibe ou oculta o card de conquistas na página de perfil."
            checked={profileAchievementsEnabled}
            onChange={(next) => {
              writeProfileAchievementsEnabledForCurrentUser(next)
              setProfileAchievementsEnabled(next)
            }}
          />
          <SettingsToggleRow
            id="toggle-profile-wishlist"
            label="Mostrar wishlist no perfil"
            description="Exibe ou oculta o card de wishlist na página de perfil."
            checked={profileWishlistEnabled}
            onChange={(next) => {
              writeProfileWishlistEnabledForCurrentUser(next)
              setProfileWishlistEnabled(next)
            }}
          />
        </SettingsSectionCard>

        <SettingsSectionCard icon={Bell} title="Notificações" fillHeight>
          <SettingsToggleRow
            id="toggle-notifications-enabled"
            label="Ativar notificações"
            description="Controla o envio imediato de notificações no sistema."
            checked={notificationPrefs.enabled}
            onChange={(next) => {
              writeNotificationPrefs({ ...notificationPrefs, enabled: next })
            }}
          />
          <SettingsToggleRow
            id="toggle-notifications-push"
            label="Canal Push"
            description="Permite receber alertas rápidos do sistema por push."
            checked={notificationPrefs.channels.push}
            onChange={(next) => {
              writeNotificationPrefs({
                ...notificationPrefs,
                channels: { ...notificationPrefs.channels, push: next },
              })
            }}
          />
          <SettingsToggleRow
            id="toggle-notifications-email"
            label="Canal Email"
            description="Permite receber notificações por email."
            checked={notificationPrefs.channels.email}
            onChange={(next) => {
              writeNotificationPrefs({
                ...notificationPrefs,
                channels: { ...notificationPrefs.channels, email: next },
              })
            }}
          />
          <SettingsToggleRow
            id="toggle-notifications-reminders"
            label="Lembretes"
            description="Notificações de tarefas e metas próximas do prazo."
            checked={notificationPrefs.categories.reminders}
            onChange={(next) => {
              writeNotificationPrefs({
                ...notificationPrefs,
                categories: { ...notificationPrefs.categories, reminders: next },
              })
            }}
          />
          <SettingsToggleRow
            id="toggle-notifications-water"
            label="Lembretes de água"
            description="Quando ativo, envia lembretes de hidratação ao longo do dia."
            checked={notificationPrefs.waterRemindersEnabled}
            onChange={(next) => {
              writeNotificationPrefs({
                ...notificationPrefs,
                waterRemindersEnabled: next,
              })
            }}
          />
          <SettingsToggleRow
            id="toggle-notifications-progress"
            label="Progresso"
            description="Notificações de marcos e evolução nas metas."
            checked={notificationPrefs.categories.progress}
            onChange={(next) => {
              writeNotificationPrefs({
                ...notificationPrefs,
                categories: { ...notificationPrefs.categories, progress: next },
              })
            }}
          />
          <SettingsToggleRow
            id="toggle-notifications-alerts"
            label="Alertas críticos"
            description="Notificações de pendências e atrasos com prioridade alta."
            checked={notificationPrefs.categories.alerts}
            onChange={(next) => {
              writeNotificationPrefs({
                ...notificationPrefs,
                categories: { ...notificationPrefs.categories, alerts: next },
              })
            }}
          />
          <SettingsToggleRow
            id="toggle-quiet-hours"
            label="Horário de silêncio"
            description="Silencia notificações não críticas entre os horários escolhidos."
            checked={notificationPrefs.quietHours.enabled}
            onChange={(next) => {
              writeNotificationPrefs({
                ...notificationPrefs,
                quietHours: { ...notificationPrefs.quietHours, enabled: next },
              })
            }}
          />
          <div className="space-y-2">
            <p className="text-xs text-zinc-600 sm:text-sm dark:text-zinc-400">Intervalo padrão: 22:00 até 07:00</p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <label className="flex flex-col gap-1 text-xs text-zinc-600 dark:text-zinc-400">
                <span>Início do silêncio</span>
                <input
                  type="time"
                  value={notificationPrefs.quietHours.start}
                  onChange={(event) => {
                    writeNotificationPrefs({
                      ...notificationPrefs,
                      quietHours: { ...notificationPrefs.quietHours, start: event.currentTarget.value },
                    })
                  }}
                  className="h-10 rounded-xl border border-zinc-300/80 bg-white/85 px-3 text-sm text-zinc-900 outline-none transition focus:border-red-400/80 dark:border-white/15 dark:bg-black/40 dark:text-zinc-100 dark:focus:border-red-400/70"
                />
              </label>
              <label className="flex flex-col gap-1 text-xs text-zinc-600 dark:text-zinc-400">
                <span>Fim do silêncio</span>
                <input
                  type="time"
                  value={notificationPrefs.quietHours.end}
                  onChange={(event) => {
                    writeNotificationPrefs({
                      ...notificationPrefs,
                      quietHours: { ...notificationPrefs.quietHours, end: event.currentTarget.value },
                    })
                  }}
                  className="h-10 rounded-xl border border-zinc-300/80 bg-white/85 px-3 text-sm text-zinc-900 outline-none transition focus:border-red-400/80 dark:border-white/15 dark:bg-black/40 dark:text-zinc-100 dark:focus:border-red-400/70"
                />
              </label>
            </div>
          </div>
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
