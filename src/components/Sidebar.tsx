import { NavLink } from 'react-router-dom'
import { Calendar, CalendarDays, Home, Settings, Target, X } from 'lucide-react'
import { SITE_LOGO_SRC, SITE_NAME } from '../constants/branding'
import { useMediaQuery } from '../hooks/useMediaQuery'

const mainItems = [
  { to: '/', label: 'Início', icon: Home, end: true },
  { to: '/mensal', label: 'Mensal', icon: Calendar, end: false },
  { to: '/semana', label: 'Semana', icon: CalendarDays, end: false },
  { to: '/metas', label: 'Metas', icon: Target, end: false },
] as const

const footerItem = { to: '/configuracoes', label: 'Configurações', icon: Settings, end: false } as const

type NavItem = (typeof mainItems)[number] | typeof footerItem

function NavRow({
  item,
  onNavigate,
}: {
  item: NavItem
  onNavigate: () => void
}) {
  const { to, label, icon: Icon, end } = item
  return (
    <NavLink
      to={to}
      end={end}
      onClick={onNavigate}
      className={({ isActive }) =>
        [
          'flex min-h-[2.75rem] items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
          isActive
            ? 'border border-zinc-300/80 bg-zinc-200/80 text-zinc-900 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.7)] backdrop-blur-md dark:border-white/10 dark:bg-white/[0.1] dark:text-white dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]'
            : 'border border-transparent text-zinc-600 hover:text-zinc-900 dark:text-zinc-500 dark:hover:text-zinc-300',
        ].join(' ')
      }
    >
      <Icon className="h-[1.125rem] w-[1.125rem] shrink-0 stroke-[1.6]" aria-hidden />
      <span className="min-w-0 break-words">{label}</span>
    </NavLink>
  )
}

type SidebarProps = {
  mobileOpen: boolean
  onClose: () => void
}

export default function Sidebar({ mobileOpen, onClose }: SidebarProps) {
  const isMobile = useMediaQuery('(max-width: 767px)')
  const drawerInert = isMobile && !mobileOpen
  const closeIfMobile = () => {
    if (isMobile) onClose()
  }

  return (
    <aside
      id="app-sidebar"
      inert={drawerInert ? true : undefined}
      className={[
        'flex h-[100dvh] w-[min(17.5rem,88vw)] max-w-[100vw] shrink-0 flex-col',
        'border-r border-zinc-200/80 bg-white/95 backdrop-blur-xl dark:border-white/[0.06] dark:bg-zinc-950/95 md:bg-white/92 md:dark:bg-zinc-950/90',
        'rounded-none md:rounded-tl-3xl',
        'fixed left-0 top-0 z-50 -translate-x-full transition-transform duration-200 ease-out',
        'md:relative md:z-auto md:h-screen md:w-[13.5rem] md:translate-x-0 md:transition-none',
        mobileOpen ? 'translate-x-0' : '',
      ].join(' ')}
    >
      <div className="shrink-0 px-4 pb-1 pt-[max(1rem,env(safe-area-inset-top))] md:hidden">
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
        className="flex min-h-0 flex-1 flex-col overflow-hidden px-3 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-3 md:pb-6 md:pt-5"
        aria-label="Principal"
      >
        <div className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto">
          <NavLink
            to="/"
            end
            onClick={closeIfMobile}
            className={({ isActive }) =>
              [
                'mb-2 flex shrink-0 cursor-default select-none justify-center rounded-xl px-2 py-2 no-underline transition-colors',
                isActive ? 'bg-zinc-200/70 dark:bg-white/[0.08]' : '',
              ].join(' ')
            }
          >
            <img
              src={SITE_LOGO_SRC}
              alt={SITE_NAME}
              width={160}
              height={48}
              className="mx-auto h-10 w-auto max-w-full cursor-default object-contain object-center"
              decoding="async"
            />
          </NavLink>
          {mainItems.map((item) => (
            <NavRow key={item.to} item={item} onNavigate={closeIfMobile} />
          ))}
        </div>

        <div className="mt-2 shrink-0 border-t border-zinc-200/70 pt-2 dark:border-white/[0.06]">
          <NavRow item={footerItem} onNavigate={closeIfMobile} />
        </div>
      </nav>
    </aside>
  )
}
