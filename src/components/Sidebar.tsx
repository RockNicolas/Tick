import { NavLink, useNavigate } from 'react-router-dom'
import { Calendar, CalendarDays, Gift, Home, LogOut, Settings, Target, Trophy, X } from 'lucide-react'
import { SITE_LOGO_SRC, SITE_NAME } from '../constants/branding'
import { useMediaQuery } from '../hooks/useMediaQuery'
import { useTickSettingsVersion } from '../hooks/useTickSettings'
import {
  readGoalsEnabledForCurrentUser,
  readWeekEnabledForCurrentUser,
  readWishlistEnabledForCurrentUser,
} from '../lib/tickSettings'

const mainItems = [
  { to: '/', label: 'Início', icon: Home, end: true },
  { to: '/semana', label: 'Semana', icon: CalendarDays, end: false },
  { to: '/mensal', label: 'Mensal', icon: Calendar, end: false },
  { to: '/metas', label: 'Metas', icon: Target, end: false },
  { to: '/conquistas', label: 'Conquistas', icon: Trophy, end: false },
  { to: '/desejos', label: 'Desejos', icon: Gift, end: false },
] as const

const footerItem = { to: '/configuracoes', label: 'Configurações', icon: Settings, end: false } as const

type NavItem = (typeof mainItems)[number] | typeof footerItem

function NavRow({
  item,
  onNavigate,
  desktopHoverExpand,
}: {
  item: NavItem
  onNavigate: () => void
  desktopHoverExpand: boolean
}) {
  const { to, label, icon: Icon, end } = item
  return (
    <NavLink
      to={to}
      end={end}
      onClick={onNavigate}
      className={({ isActive }) =>
        [
          'flex min-h-[2.75rem] items-center rounded-xl py-2.5 text-sm font-medium transition-[padding,gap,colors,opacity,box-shadow,border-color] duration-200 ease-out',
          desktopHoverExpand
            ? 'w-full justify-center gap-0 px-0 group-hover/sidebar:justify-start group-hover/sidebar:gap-3 group-hover/sidebar:px-3 group-focus-within/sidebar:justify-start group-focus-within/sidebar:gap-3 group-focus-within/sidebar:px-3'
            : 'justify-start gap-3 px-3',
          isActive
            ? 'border border-zinc-300/80 bg-zinc-200/80 text-zinc-900 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.7)] backdrop-blur-md dark:border-white/10 dark:bg-white/[0.1] dark:text-white dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]'
            : 'border border-transparent text-zinc-600 hover:text-zinc-900 dark:text-zinc-500 dark:hover:text-zinc-300',
        ].join(' ')
      }
    >
      <Icon className="h-[1.125rem] w-[1.125rem] shrink-0 stroke-[1.6]" aria-hidden />
      <span
        className={
          desktopHoverExpand
            ? 'min-w-0 max-w-0 overflow-hidden whitespace-nowrap opacity-0 transition-[max-width,opacity] duration-200 ease-out group-hover/sidebar:max-w-[11rem] group-hover/sidebar:opacity-100 group-focus-within/sidebar:max-w-[11rem] group-focus-within/sidebar:opacity-100'
            : 'min-w-0 break-words'
        }
      >
        {label}
      </span>
    </NavLink>
  )
}

type SidebarProps = {
  mobileOpen: boolean
  onClose: () => void
}

export default function Sidebar({ mobileOpen, onClose }: SidebarProps) {
  const navigate = useNavigate()
  const isMobile = useMediaQuery('(max-device-width: 767px)')
  useTickSettingsVersion()
  const weekEnabled = readWeekEnabledForCurrentUser()
  const goalsEnabled = readGoalsEnabledForCurrentUser()
  const wishlistEnabled = readWishlistEnabledForCurrentUser()
  const drawerInert = isMobile && !mobileOpen
  const closeIfMobile = () => {
    if (isMobile) onClose()
  }
  const handleLogout = () => {
    localStorage.removeItem('tick:user')
    closeIfMobile()
    navigate('/auth/login')
  }
  const visibleMainItems = mainItems.filter((item) => {
    if (item.to === '/semana' && !weekEnabled) return false
    if (item.to === '/metas' && !goalsEnabled) return false
    if (item.to === '/desejos' && !wishlistEnabled) return false
    return true
  })

  return (
    <aside
      id="app-sidebar"
      inert={drawerInert ? true : undefined}
      className={[
        'z-50 flex max-w-[100vw] shrink-0 flex-col border-r border-zinc-200/80 bg-white/95 backdrop-blur-xl dark:border-white/[0.06] dark:bg-zinc-950/95',
        isMobile
          ? 'fixed left-0 top-0 h-[100dvh] w-[min(17.5rem,88vw)] -translate-x-full transition-transform duration-200 ease-out'
          : 'group/sidebar relative h-full min-h-0 w-[4.25rem] self-stretch overflow-hidden rounded-tl-3xl transition-[width,box-shadow] duration-200 ease-out hover:w-[13.5rem] hover:shadow-[4px_0_20px_-8px_rgba(0,0,0,0.12)] focus-within:w-[13.5rem] focus-within:shadow-[4px_0_20px_-8px_rgba(0,0,0,0.12)] dark:hover:shadow-[4px_0_20px_-8px_rgba(0,0,0,0.35)] dark:focus-within:shadow-[4px_0_20px_-8px_rgba(0,0,0,0.35)]',
        isMobile && mobileOpen ? 'translate-x-0' : '',
      ].join(' ')}
    >
      <div className={`shrink-0 px-4 pb-1 pt-[max(1rem,env(safe-area-inset-top))] ${isMobile ? '' : 'hidden'}`}>
        <div className="flex justify-end">
          <button
            type="button"
            className="rounded-xl p-2.5 text-zinc-500 transition hover:bg-black/5 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-white/5 dark:hover:text-zinc-200"
            aria-label="Fechar menu"
            onClick={onClose}
          >
            <X className="h-5 w-5" strokeWidth={1.75} aria-hidden />
          </button>
        </div>
      </div>

      <nav
        className={[
          'flex min-h-0 flex-1 flex-col overflow-hidden pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-3',
          isMobile
            ? 'px-3'
            : 'px-1 transition-[padding] duration-200 ease-out group-hover/sidebar:px-3 group-focus-within/sidebar:px-3',
        ].join(' ')}
        aria-label="Principal"
      >
        <div className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto overflow-x-hidden">
          <NavLink
            to="/"
            end
            onClick={closeIfMobile}
            className={({ isActive }) =>
              [
                'mb-2 flex w-full shrink-0 cursor-default select-none justify-center overflow-hidden rounded-xl py-2 no-underline transition-[padding] duration-200 ease-out',
                isMobile ? 'px-2' : 'px-0 group-hover/sidebar:px-2 group-focus-within/sidebar:px-2',
                isActive ? 'bg-zinc-200/70 dark:bg-white/[0.08]' : '',
              ].join(' ')
            }
          >
            <img
              src={SITE_LOGO_SRC}
              alt={SITE_NAME}
              width={160}
              height={48}
              className={
                isMobile
                  ? 'mx-auto h-10 w-auto max-w-full cursor-default object-contain object-center'
                  : 'mx-auto h-9 w-auto max-w-[2.75rem] cursor-default object-contain object-center transition-[max-width,height] duration-200 ease-out group-hover/sidebar:max-w-[min(100%,10rem)] group-hover/sidebar:h-10 group-focus-within/sidebar:max-w-[min(100%,10rem)] group-focus-within/sidebar:h-10'
              }
              decoding="async"
            />
          </NavLink>
          {visibleMainItems.map((item) => (
            <NavRow
              key={item.to}
              item={item}
              onNavigate={closeIfMobile}
              desktopHoverExpand={!isMobile}
            />
          ))}
        </div>

        <div className="mt-2 shrink-0 border-t border-zinc-200/70 pt-2 dark:border-white/[0.06]">
          <NavRow
            item={footerItem}
            onNavigate={closeIfMobile}
            desktopHoverExpand={!isMobile}
          />
          {isMobile ? (
            <button
              type="button"
              onClick={handleLogout}
              className="mt-1 flex min-h-[2.75rem] w-full items-center gap-3 rounded-xl border border-red-400/30 bg-red-500/10 px-3 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-500/15 dark:border-red-500/30 dark:bg-red-500/15 dark:text-red-300"
            >
              <LogOut className="h-[1.125rem] w-[1.125rem] shrink-0 stroke-[1.6]" aria-hidden />
              <span>Deslogar</span>
            </button>
          ) : null}
        </div>
      </nav>
    </aside>
  )
}