import './App.css'
import { BrowserRouter, NavLink, Route, Routes } from 'react-router-dom'
import { Home, Info, LayoutDashboard } from 'lucide-react'

function HomePage() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-3xl font-semibold text-slate-900">
        <Home className="h-8 w-8 text-blue-600" />
        <span>Home</span>
      </div>
      <p className="text-slate-700">
        Bem-vindo ao seu projeto React com React Router e Lucide React configurados.
      </p>
      <button className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
        Botão Tailwind
      </button>
    </div>
  )
}

function AboutPage() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-3xl font-semibold text-slate-900">
        <Info className="h-8 w-8 text-emerald-600" />
        <span>Sobre</span>
      </div>
      <p className="text-slate-700">
        Esta é uma página de exemplo usando React Router e ícones do Lucide React.
      </p>
      <div className="rounded border border-slate-200 bg-slate-50 p-4 text-slate-800">
        React Router permite navegação entre páginas sem recarregar a página.
      </div>
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-100 px-4 py-6 text-slate-900 sm:px-6 lg:px-8">
        <header className="mx-auto mb-8 max-w-4xl rounded-3xl bg-white p-6 shadow-md shadow-slate-200/80">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <LayoutDashboard className="h-10 w-10 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold">Tick</h1>
                <p className="text-sm text-slate-500">React Router + Lucide React configurados</p>
              </div>
            </div>
            <nav className="flex flex-wrap gap-2">
              <NavLink
                to="/"
                className={({ isActive }) =>
                  `rounded-full px-4 py-2 text-sm font-medium transition ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`
                }
              >
                Home
              </NavLink>
              <NavLink
                to="/sobre"
                className={({ isActive }) =>
                  `rounded-full px-4 py-2 text-sm font-medium transition ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`
                }
              >
                Sobre
              </NavLink>
            </nav>
          </div>
        </header>

        <main className="mx-auto max-w-4xl rounded-3xl bg-white p-6 shadow-md shadow-slate-200/80">
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
