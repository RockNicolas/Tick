import { Plus } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function SemanaCadastroMensalLink() {
  return (
    <Link
      to="/mensal"
      className="absolute bottom-4 right-4 inline-flex items-center gap-2 rounded-2xl border border-teal-400/40 bg-teal-500/90 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-teal-900/20 transition hover:bg-teal-400"
    >
      <Plus className="h-5 w-5" aria-hidden />
      Cadastrar no mensal
    </Link>
  )
}
