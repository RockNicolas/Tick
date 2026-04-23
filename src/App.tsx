import './App.css'
import { BrowserRouter, NavLink, Route, Routes } from 'react-router-dom'
import { Home, Info, LayoutDashboard } from 'lucide-react'

function HomePage() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-3xl font-semibold text-slate-800">
        <Home className="h-8 w-8 text-blue-600" />
        <span>Agenda</span>
      </div>
      <p className="text-slate-600">
        Bem-vindo — aqui você pode começar a montar sua agenda virtual sobre este fundo
        fosco com painéis de vidro.
      </p>
      <button className="rounded-xl border border-white/50 bg-white/35 px-4 py-2 font-medium text-slate-800 shadow-sm backdrop-blur-md transition hover:bg-white/55">
        Ação principal
      </button>
    </div>
  )
}

function AboutPage() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-3xl font-semibold text-slate-800">
        <Info className="h-8 w-8 text-emerald-600" />
        <span>Sobre</span>
      </div>
      <p className="text-slate-600">
        Esta é uma página de exemplo usando React Router e ícones do Lucide React.
      </p>
      <div className="rounded-2xl border border-white/40 bg-white/20 p-4 text-slate-700 shadow-inner backdrop-blur-md">
        React Router permite navegação entre páginas sem recarregar a página.
      </div>
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <div className="relative isolate min-h-screen overflow-hidden px-4 py-6 text-slate-800 sm:px-6 lg:px-8">
        {/* Fundo cinza fosco + profundidade */}
        <div
          className="pointer-events-none fixed inset-0 -z-20"
          aria-hidden
          style={{
            background:
              'linear-gradient(165deg, #c8ccd4 0%, #aeb4bf 42%, #9aa2ad 100%)',
          }}
        />
        <div
          className="pointer-events-none fixed inset-0 -z-10 opacity-90"
          aria-hidden
          style={{
            backgroundImage: `
              radial-gradient(ellipse 120% 80% at 0% 0%, rgba(255,255,255,0.35) 0%, transparent 55%),
              radial-gradient(ellipse 100% 70% at 100% 100%, rgba(80,90,105,0.18) 0%, transparent 50%)
            `,
          }}
        />
        <div
          className="pointer-events-none fixed -left-40 top-1/4 -z-10 h-[32rem] w-[32rem] rounded-full bg-slate-400/35 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none fixed -right-32 bottom-0 -z-10 h-[28rem] w-[28rem] rounded-full bg-slate-500/25 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none fixed left-1/3 top-1/2 -z-10 h-72 w-72 -translate-x-1/2 rounded-full bg-white/20 blur-2xl"
          aria-hidden
        />

        <header className="glass-panel mx-auto mb-8 max-w-4xl rounded-3xl p-6 shadow-lg shadow-slate-900/10">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <LayoutDashboard className="h-10 w-10 text-blue-600 drop-shadow-sm" />
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-800">Tick</h1>
                <p className="text-sm text-slate-600/90">Agenda virtual</p>
              </div>
            </div>
            <nav className="flex flex-wrap gap-2">
              <NavLink
                to="/"
                className={({ isActive }) =>
                  `rounded-full px-4 py-2 text-sm font-medium backdrop-blur-sm transition ${
                    isActive
                      ? 'border border-blue-500/40 bg-blue-600/90 text-white shadow-md shadow-blue-900/20'
                      : 'border border-white/45 bg-white/25 text-slate-700 hover:bg-white/40'
                  }`
                }
              >
                Home
              </NavLink>
              <NavLink
                to="/sobre"
                className={({ isActive }) =>
                  `rounded-full px-4 py-2 text-sm font-medium backdrop-blur-sm transition ${
                    isActive
                      ? 'border border-blue-500/40 bg-blue-600/90 text-white shadow-md shadow-blue-900/20'
                      : 'border border-white/45 bg-white/25 text-slate-700 hover:bg-white/40'
                  }`
                }
              >
                Sobre
              </NavLink>
            </nav>
          </div>
        </header>

        <main className="glass-panel mx-auto max-w-4xl rounded-3xl p-6 shadow-lg shadow-slate-900/10">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/sobre" element={<AboutPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}

export default App
