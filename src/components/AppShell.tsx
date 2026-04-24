import { useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Menu } from 'lucide-react'
import { SITE_LOGO_SRC, SITE_NAME } from '../constants/branding'
import AppBackground from './AppBackground'
import Sidebar from './Sidebar'
/*import WelcomeGreeting from './WelcomeGreeting'*/

const MD_MIN = 768

export default function AppShell() {
  const location = useLocation()
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  useEffect(() => {
    setMobileNavOpen(false)
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
    if (!mobileNavOpen) return
    const mq = window.matchMedia(`(max-width: ${MD_MIN - 1}px)`)
    if (!mq.matches) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [mobileNavOpen])

  useEffect(() => {
    const mq = window.matchMedia(`(min-width: ${MD_MIN}px)`)
    const onChange = () => {
      if (mq.matches) setMobileNavOpen(false)
    }
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  return (
    <div className="relative isolate min-h-[100dvh] overflow-x-hidden text-zinc-100">
      <AppBackground />
      <div className="relative z-10 flex min-h-[100dvh] flex-col md:flex-row">
        {mobileNavOpen ? (
          <button
            type="button"
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-[2px] md:hidden"
            aria-label="Fechar menu"
            onClick={() => setMobileNavOpen(false)}
          />
        ) : null}

        <Sidebar mobileOpen={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />

        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          <header className="relative sticky top-0 z-30 flex min-h-[3.25rem] shrink-0 items-center justify-center border-b border-white/[0.06] bg-zinc-950/80 px-3 py-3 pt-[max(0.75rem,env(safe-area-inset-top))] backdrop-blur-md md:hidden">
            <button
              type="button"
              className="absolute left-3 top-1/2 z-10 inline-flex min-h-11 min-w-11 -translate-y-1/2 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-zinc-200 transition hover:bg-white/10"
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
          </header>

          <div className="flex min-h-0 min-w-0 flex-1 flex-col px-3 py-3 sm:px-4 sm:py-4 md:p-6 lg:p-8">
            <main
              id="main-content"
              className="glass-panel min-h-0 min-w-0 flex-1 overflow-x-auto rounded-2xl p-4 shadow-lg shadow-black/40 sm:rounded-3xl sm:p-6"
            >
             {/* <WelcomeGreeting /> */}
              <Outlet />
            </main>
          </div>
        </div>
      </div>
    </div>
  )
}
