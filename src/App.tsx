import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import AppShell from './components/AppShell'
import CadastroPage from './pages/CadastroPage'
import ConfiguracoesPage from './pages/ConfiguracoesPage'
import DesejosPage from './pages/DesejosPage.tsx'
import InicioPage from './pages/InicioPage'
import LoginPage from './pages/LoginPage'
import MensalPage from './pages/MensalPage'
import MetasPage from './pages/MetasPage'
import PerfilPage from './pages/PerfilPage'
import SemanaPage from './pages/SemanaPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/auth" element={<Navigate to="/auth/login" replace />} />
        <Route path="/auth/login" element={<LoginPage />} />
        <Route path="/auth/cadastro" element={<CadastroPage />} />
        <Route element={<AppShell />}>
          <Route path="/" element={<InicioPage />} />
          <Route path="/mensal" element={<MensalPage />} />
          <Route path="/semana" element={<SemanaPage />} />
          <Route path="/metas" element={<MetasPage />} />
          <Route path="/desejos" element={<DesejosPage />} />
          <Route path="/perfil" element={<PerfilPage />} />
          <Route path="/configuracoes" element={<ConfiguracoesPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
