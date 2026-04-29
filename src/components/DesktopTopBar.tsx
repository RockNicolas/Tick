import { useEffect, useRef, useState } from 'react'
import { Bell, UserRound } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { getUserInitials, readTickStoredUser, type TickStoredUser } from '../lib/tickUser'
import { useTickNotificationsVersion } from '../hooks/useTickNotifications'
import {
  clearAllTickNotifications,
  getUnreadTickNotificationCount,
  listTickNotifications,
  markAllTickNotificationsAsRead,
  markTickNotificationAsRead,
} from '../lib/tickNotifications'
import ThemeToggleButton from './ThemeToggleButton'

export default function DesktopTopBar() {
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [notificationActionsOpen, setNotificationActionsOpen] = useState(false)
  const [hideReadNotifications, setHideReadNotifications] = useState(() => {
    try {
      const raw = localStorage.getItem('tick:notifications:hide-read')
      return raw === null ? true : raw === 'true'
    } catch {
      return true
    }
  })
  const [user, setUser] = useState<TickStoredUser | null>(() => readTickStoredUser())
  useTickNotificationsVersion()
  const menuRef = useRef<HTMLDivElement | null>(null)
  const notificationsRef = useRef<HTMLDivElement | null>(null)
  const notifications = listTickNotifications()
  const unreadCount = getUnreadTickNotificationCount()
  const visibleNotifications = hideReadNotifications
    ? notifications.filter((item) => !item.read)
    : notifications

  const getNotificationToneClass = (item: (typeof visibleNotifications)[number]) => {
    const isPositive = item.eventId === 'goal_progress_milestone' || item.eventId === 'water_goal_completed'
    const isNegative = item.eventId === 'overdue_critical' || item.severity === 'critical'

    if (item.read) {
      if (isPositive) {
        return 'border-transparent bg-transparent text-emerald-700 hover:bg-emerald-50 dark:text-emerald-300 dark:hover:bg-emerald-950/20'
      }
      if (isNegative) {
        return 'border-transparent bg-transparent text-red-700 hover:bg-red-50 dark:text-red-300 dark:hover:bg-red-950/20'
      }
      return 'border-transparent bg-transparent text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-white/5'
    }

    if (isPositive) {
      return 'border-emerald-200/80 bg-emerald-50/80 text-emerald-900 hover:bg-emerald-50 dark:border-emerald-500/30 dark:bg-emerald-950/25 dark:text-emerald-100 dark:hover:bg-emerald-950/35'
    }
    if (isNegative) {
      return 'border-red-200/70 bg-red-50/70 text-zinc-800 hover:bg-red-50 dark:border-red-500/20 dark:bg-red-950/20 dark:text-zinc-100 dark:hover:bg-red-950/30'
    }
    return 'border-zinc-200/80 bg-zinc-50/60 text-zinc-800 hover:bg-zinc-100 dark:border-white/10 dark:bg-white/5 dark:text-zinc-100 dark:hover:bg-white/10'
  }

  useEffect(() => {
    if (!menuOpen && !notificationsOpen) return
    const onDocumentClick = (event: MouseEvent) => {
      const target = event.target
      if (!(target instanceof Node)) return
      if (menuRef.current && !menuRef.current.contains(target)) {
        setMenuOpen(false)
      }
      if (notificationsRef.current && !notificationsRef.current.contains(target)) setNotificationsOpen(false)
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMenuOpen(false)
        setNotificationsOpen(false)
      }
    }
    document.addEventListener('mousedown', onDocumentClick)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onDocumentClick)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [menuOpen, notificationsOpen])

  const handleAccountClick = () => {
    if (!user) {
      navigate('/auth/login')
      return
    }
    setMenuOpen((value) => !value)
  }

  const handleLogout = () => {
    localStorage.removeItem('tick:user')
    setUser(null)
    setMenuOpen(false)
    navigate('/auth/login')
  }

  useEffect(() => {
    try {
      localStorage.setItem('tick:notifications:hide-read', hideReadNotifications ? 'true' : 'false')
    } catch {
      /* ignore */
    }
  }, [hideReadNotifications])

  return (
    <header
      className="relative z-30 flex h-14 w-full shrink-0 items-center justify-end gap-0.5 border-b border-zinc-200/80 bg-white/85 pt-[max(0.25rem,env(safe-area-inset-top))] backdrop-blur-md dark:border-white/[0.06] dark:bg-zinc-950/90 md:pl-4 md:pr-5"
      role="banner"
    >
      <ThemeToggleButton />
      <div className="relative" ref={notificationsRef}>
        <button
          type="button"
          className="relative inline-flex min-h-10 min-w-10 items-center justify-center rounded-xl text-zinc-500 transition hover:bg-black/5 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-white/10 dark:hover:text-zinc-100"
          aria-label="Notificações"
          aria-haspopup="menu"
          aria-expanded={notificationsOpen}
          onClick={() => {
            setNotificationsOpen((value) => !value)
            setNotificationActionsOpen(false)
          }}
        >
          <Bell
            className={['h-5 w-5', unreadCount > 0 ? 'tick-bell-notification-unread' : ''].join(' ')}
            strokeWidth={1.75}
            aria-hidden
          />
          {unreadCount > 0 ? (
            <span className="absolute right-1.5 top-1.5 min-w-4 rounded-full bg-red-500 px-1 text-center text-[10px] font-semibold leading-4 text-white">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          ) : null}
        </button>

        {notificationsOpen ? (
          <div
            role="menu"
            className="absolute right-0 top-12 z-40 w-80 rounded-xl border border-zinc-200/80 bg-white/95 p-2 shadow-lg backdrop-blur-md dark:border-white/10 dark:bg-zinc-900/95"
          >
            <div className="mb-2 flex items-center justify-between px-1">
              <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">Notificações</p>
              <div className="relative">
                <button
                  type="button"
                  className="rounded-md px-2 py-1 text-xs font-medium text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-white/10 dark:hover:text-white"
                  onClick={() => setNotificationActionsOpen((value) => !value)}
                >
                  Ações
                </button>
                {notificationActionsOpen ? (
                  <div className="absolute right-0 top-8 z-10 w-48 rounded-lg border border-zinc-200/80 bg-white p-1 shadow-md dark:border-white/10 dark:bg-zinc-900">
                    <button
                      type="button"
                      className="block w-full rounded-md px-2 py-1.5 text-left text-xs text-zinc-700 transition hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-white/10"
                      onClick={() => {
                        setHideReadNotifications((value) => !value)
                        setNotificationActionsOpen(false)
                      }}
                    >
                      {hideReadNotifications ? 'Mostrar lidas' : 'Ocultar lidas'}
                    </button>
                    <button
                      type="button"
                      className="block w-full rounded-md px-2 py-1.5 text-left text-xs text-zinc-700 transition hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-white/10"
                      onClick={() => {
                        markAllTickNotificationsAsRead()
                        setNotificationActionsOpen(false)
                      }}
                    >
                      Marcar todas como lidas
                    </button>
                    <button
                      type="button"
                      className="block w-full rounded-md px-2 py-1.5 text-left text-xs text-red-600 transition hover:bg-red-50 dark:text-red-300 dark:hover:bg-red-950/30"
                      onClick={() => {
                        clearAllTickNotifications()
                        setNotificationActionsOpen(false)
                      }}
                    >
                      Limpar notificações
                    </button>
                  </div>
                ) : null}
              </div>
            </div>
            <div className="max-h-72 space-y-1 overflow-y-auto">
              {visibleNotifications.length === 0 ? (
                <p className="rounded-lg px-3 py-2 text-sm text-zinc-500 dark:text-zinc-400">Sem notificações ainda.</p>
              ) : (
                visibleNotifications.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    role="menuitem"
                    onClick={() => markTickNotificationAsRead(item.id)}
                    className={['block w-full rounded-lg border px-3 py-2 text-left transition', getNotificationToneClass(item)].join(' ')}
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
      <div className="relative" ref={menuRef}>
        <button
          type="button"
          className={[
            'inline-flex min-h-10 min-w-10 items-center justify-center transition',
            user
              ? 'h-10 w-10 rounded-full border border-zinc-300/80 bg-zinc-100 text-xs font-semibold text-zinc-800 hover:bg-zinc-200 dark:border-white/15 dark:bg-white/10 dark:text-zinc-100 dark:hover:bg-white/20'
              : 'rounded-xl text-zinc-500 hover:bg-black/5 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-white/10 dark:hover:text-zinc-100',
          ].join(' ')}
          aria-label="Conta"
          aria-haspopup={user ? 'menu' : undefined}
          aria-expanded={user ? menuOpen : undefined}
          onClick={handleAccountClick}
        >
          {user ? (
            <span aria-hidden>{getUserInitials(user.name || user.email)}</span>
          ) : (
            <UserRound className="h-5 w-5" strokeWidth={1.75} aria-hidden />
          )}
        </button>

        {user && menuOpen ? (
          <div
            role="menu"
            className="absolute right-0 top-12 z-40 w-44 rounded-xl border border-zinc-200/80 bg-white/95 p-1 shadow-lg backdrop-blur-md dark:border-white/10 dark:bg-zinc-900/95"
          >
            <button
              type="button"
              role="menuitem"
              className="block w-full rounded-lg px-3 py-2 text-left text-sm text-zinc-700 transition hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-200 dark:hover:bg-white/10 dark:hover:text-white"
              onClick={() => {
                setMenuOpen(false)
                navigate('/perfil')
              }}
            >
              Perfil 
            </button>
            <button
              type="button"
              role="menuitem"
              className="block w-full rounded-lg px-3 py-2 text-left text-sm text-red-600 transition hover:bg-red-50 dark:text-red-300 dark:hover:bg-red-950/40"
              onClick={handleLogout}
            >
              Deslogar
            </button>
          </div>
        ) : null}
      </div>
    </header>
  )
}
