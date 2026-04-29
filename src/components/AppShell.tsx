import { startTransition, useEffect, useRef, useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Bell, Menu, UserRound } from 'lucide-react'
import { SITE_LOGO_SRC, SITE_NAME } from '../constants/branding'
import AppBackground from './AppBackground'
import DesktopTopBar from './DesktopTopBar'
import { useMediaQuery } from '../hooks/useMediaQuery'
import Sidebar from './Sidebar'
import ThemeToggleButton from './ThemeToggleButton'
import { DAY_DEMANDS_UPDATED_EVENT } from '../api/dayDemands'
import { fetchGoals, updateGoal } from '../api/goals'
import {
  getUnreadTickNotificationCount,
  listTickNotifications,
  markTickNotificationAsRead,
  triggerNotificationEvent,
} from '../lib/tickNotifications'
import { useTickNotificationsVersion } from '../hooks/useTickNotifications'
import { getUserInitials, readTickStoredUser, type TickStoredUser } from '../lib/tickUser'
/*import WelcomeGreeting from './WelcomeGreeting'*/

export default function AppShell() {
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [mobileNotificationsOpen, setMobileNotificationsOpen] = useState(false)
  const mobileUser: TickStoredUser | null = readTickStoredUser()
  const notificationsRef = useRef<HTMLDivElement | null>(null)
  const isMobileLayout = useMediaQuery('(max-width: 767px)')
  useTickNotificationsVersion()
  const unreadCount = getUnreadTickNotificationCount()
  const notifications = listTickNotifications()

  useEffect(() => {
    startTransition(() => {
      setMobileNavOpen(false)
    })
  }, [location.pathname])

  useEffect(() => {
    if (!mobileNavOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileNavOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [mobileNavOpen])

  useEffect(() => {
    if (!mobileNotificationsOpen) return
    const onClickOutside = (event: MouseEvent) => {
      const target = event.target
      if (!(target instanceof Node)) return
      if (notificationsRef.current && !notificationsRef.current.contains(target)) {
        setMobileNotificationsOpen(false)
      }
    }
    const onEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMobileNotificationsOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    document.addEventListener('keydown', onEscape)
    return () => {
      document.removeEventListener('mousedown', onClickOutside)
      document.removeEventListener('keydown', onEscape)
    }
  }, [mobileNotificationsOpen])

  useEffect(() => {
    if (!mobileNavOpen) return
    if (!isMobileLayout) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [mobileNavOpen, isMobileLayout])

  useEffect(() => {
    const syncGoalsAndNotify = async () => {
      try {
        const goals = await fetchGoals()
        for (const goal of goals) {
          if (goal.progress < 100) continue
          if (goal.status !== 'completed') {
            await updateGoal(goal.id, { status: 'completed', progress: 100 })
          }
          triggerNotificationEvent('goal_progress_milestone', {
            title: `Meta concluida automaticamente: ${goal.title}`,
            body: 'Parabens! Sua meta foi concluida com base nas demandas finalizadas.',
            dedupeKey: `goal_progress_milestone:auto:${goal.id}`,
            minIntervalMs: 365 * 24 * 60 * 60 * 1000,
          })
        }
      } catch {
        // nao bloqueia o shell principal
      }
    }

    const onDemandsUpdated = () => {
      void syncGoalsAndNotify()
    }

    window.addEventListener(DAY_DEMANDS_UPDATED_EVENT, onDemandsUpdated)
    void syncGoalsAndNotify()
    return () => window.removeEventListener(DAY_DEMANDS_UPDATED_EVENT, onDemandsUpdated)
  }, [])

  return (
    <div className="relative isolate h-[100dvh] overflow-hidden text-zinc-900 dark:text-zinc-100">
      <AppBackground />
      <div
        className={
          isMobileLayout
            ? 'relative z-10 h-full'
            : 'relative z-10 flex h-full min-h-0 min-w-0 flex-row'
        }
      >
        {isMobileLayout && mobileNavOpen ? (
          <button
            type="button"
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px] dark:bg-black/60"
            aria-label="Fechar menu"
            onClick={() => setMobileNavOpen(false)}
          />
        ) : null}

        <Sidebar mobileOpen={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />

        <div
          className={
            isMobileLayout
              ? 'fixed inset-y-0 left-0 right-0 z-0 flex min-h-0 flex-col'
              : 'flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden'
          }
        >
          {isMobileLayout ? null : <DesktopTopBar />}

          {isMobileLayout ? (
            <header className="fixed inset-x-0 top-0 z-30 flex min-h-[3.25rem] shrink-0 items-center justify-center border-b border-zinc-200/80 bg-white/90 px-3 py-3 pt-[max(0.75rem,env(safe-area-inset-top))] backdrop-blur-md dark:border-white/[0.06] dark:bg-zinc-950/80">
              <button
                type="button"
                className="absolute left-3 top-1/2 z-10 inline-flex min-h-11 min-w-11 -translate-y-1/2 items-center justify-center rounded-xl border border-zinc-200/80 bg-zinc-100/80 text-zinc-800 transition hover:bg-zinc-200/80 dark:border-white/10 dark:bg-white/5 dark:text-zinc-200 dark:hover:bg-white/10"
                aria-expanded={mobileNavOpen}
                aria-controls="app-sidebar"
                onClick={() => setMobileNavOpen((o) => !o)}
              >
                <Menu className="h-6 w-6" strokeWidth={1.75} aria-hidden />
                <span className="sr-only">Abrir ou fechar menu</span>
              </button>
              <img
                src={SITE_LOGO_SRC}
                alt=""
                width={120}
                height={36}
                className="h-9 w-auto max-w-[min(200px,55vw)] cursor-default object-contain object-center"
                decoding="async"
              />
              <span className="sr-only">{SITE_NAME}</span>
              <div
                ref={notificationsRef}
                className="absolute right-2 top-1/2 z-10 flex -translate-y-1/2 items-center justify-center gap-0.5"
              >
                <ThemeToggleButton />
                <button
                  type="button"
                  className="relative inline-flex min-h-10 min-w-10 items-center justify-center rounded-xl text-zinc-500 transition hover:bg-black/5 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-white/10 dark:hover:text-zinc-100"
                  aria-label="Notificações"
                  aria-haspopup="menu"
                  aria-expanded={mobileNotificationsOpen}
                  onClick={() => setMobileNotificationsOpen((value) => !value)}
                >
                  <Bell className={['h-5 w-5', unreadCount > 0 ? 'tick-bell-notification-unread' : ''].join(' ')} strokeWidth={1.75} aria-hidden />
                  {unreadCount > 0 ? (
                    <span className="absolute right-1.5 top-1.5 min-w-4 rounded-full bg-red-500 px-1 text-center text-[10px] font-semibold leading-4 text-white">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  ) : null}
                </button>
                <button
                  type="button"
                  className="inline-flex min-h-10 min-w-10 items-center justify-center rounded-xl text-zinc-500 transition hover:bg-black/5 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-white/10 dark:hover:text-zinc-100"
                  aria-label="Perfil"
                  onClick={() => {
                    if (!mobileUser) {
                      navigate('/auth/login')
                      return
                    }
                    navigate('/perfil')
                  }}
                >
                  {mobileUser ? (
                    <span className="grid h-8 w-8 place-items-center rounded-full border border-zinc-300/80 bg-zinc-100 text-xs font-semibold text-zinc-800 dark:border-white/15 dark:bg-white/10 dark:text-zinc-100">
                      {getUserInitials(mobileUser.name || mobileUser.email)}
                    </span>
                  ) : (
                    <UserRound className="h-5 w-5" strokeWidth={1.75} aria-hidden />
                  )}
                </button>
                {mobileNotificationsOpen ? (
                  <div
                    role="menu"
                    className="absolute right-0 top-11 z-20 w-72 rounded-xl border border-zinc-200/80 bg-white/95 p-2 shadow-lg backdrop-blur-md dark:border-white/10 dark:bg-zinc-900/95"
                  >
                    <p className="mb-2 px-1 text-sm font-semibold text-zinc-800 dark:text-zinc-100">Notificações</p>
                    <div className="max-h-60 space-y-1 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <p className="rounded-lg px-3 py-2 text-sm text-zinc-500 dark:text-zinc-400">Sem notificações.</p>
                      ) : (
                        notifications.slice(0, 20).map((item) => (
                          <button
                            key={item.id}
                            type="button"
                            role="menuitem"
                            onClick={() => markTickNotificationAsRead(item.id)}
                            className="block w-full rounded-lg border border-zinc-200/70 bg-zinc-50/60 px-3 py-2 text-left text-zinc-800 transition hover:bg-zinc-100 dark:border-white/10 dark:bg-white/5 dark:text-zinc-100 dark:hover:bg-white/10"
                          >
                            <p className="text-sm font-medium">{item.title}</p>
                            <p className="mt-1 text-xs leading-relaxed">{item.body}</p>
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                ) : null}
              </div>
            </header>
          ) : null}

          <div
            className={`flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden ${
              isMobileLayout
                ? 'px-3 pb-3 pt-[calc(3.25rem+0.75rem)] sm:px-4 sm:pb-4 sm:pt-[calc(3.25rem+1rem)]'
                : 'px-6 pb-6 pt-3 lg:px-8 lg:pb-8 lg:pt-4'
            }`}
          >
            <main
              id="main-content"
              className="glass-panel flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-2xl p-4 shadow-lg shadow-zinc-400/20 sm:rounded-3xl sm:p-6 dark:shadow-black/40"
            >
              {/* <WelcomeGreeting /> */}
              <div className="min-h-0 flex-1 overflow-x-auto overflow-y-auto">
                <Outlet />
              </div>
            </main>
          </div>
        </div>
      </div>
    </div>
  )
}
