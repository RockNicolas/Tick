import { BrowserRouter, Route, Routes } from 'react-router-dom'
import AppShell from './components/AppShell'
import ConfiguracoesPage from './pages/ConfiguracoesPage'
import InicioPage from './pages/InicioPage'
import MensalPage from './pages/MensalPage'
import MetasPage from './pages/MetasPage'
import SemanaPage from './pages/SemanaPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route path="/" element={<InicioPage />} />
          <Route path="/mensal" element={<MensalPage />} />
          <Route path="/semana" element={<SemanaPage />} />
          <Route path="/metas" element={<MetasPage />} />
          <Route path="/configuracoes" element={<ConfiguracoesPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
