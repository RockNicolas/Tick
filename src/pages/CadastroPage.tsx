import { useState } from 'react'
import type { FormEvent } from 'react'
import { Home, Loader2 } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { registerWithEmail } from '../api/auth'

export default function CadastroPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [nome, setNome] = useState('')
  const [sobrenome, setSobrenome] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setErrorMessage('')
    setIsLoading(true)

    if (nome.trim().length < 2 || sobrenome.trim().length < 2 || senha.length < 6) {
      setErrorMessage('Preencha nome, sobrenome e senha com 6+ caracteres')
      setIsLoading(false)
      return
    }

    try {
      const user = await registerWithEmail({
        name: `${nome.trim()} ${sobrenome.trim()}`,
        email: email.trim(),
        password: senha,
      })
      localStorage.setItem('tick:user', JSON.stringify(user))
      navigate('/', { replace: true })
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Erro ao cadastrar')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="relative isolate min-h-[100dvh] overflow-x-hidden bg-zinc-100 px-4 py-8 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100 sm:px-6">
      <div className="mx-auto w-full max-w-md space-y-4">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-zinc-600 transition hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-white"
        >
          <Home className="h-4 w-4" aria-hidden />
          Voltar para Agenda
        </Link>

        <section className="space-y-4 rounded-2xl border border-zinc-200/90 bg-white/90 p-5 shadow-lg backdrop-blur-md dark:border-white/10 dark:bg-white/5">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold text-zinc-900 dark:text-white">Cadastro</h1>
            <p className="text-sm text-zinc-600 dark:text-zinc-300">Crie sua conta para comecar a usar o Tick.</p>
          </div>

          <form className="space-y-3" onSubmit={onSubmit}>
            <label className="block space-y-1.5">
              <span className="text-sm font-medium text-zinc-700 dark:text-zinc-200">Nome</span>
              <input
                type="text"
                value={nome}
                onChange={(event) => setNome(event.target.value)}
                placeholder="Seu nome"
                required
                className="min-h-11 w-full rounded-xl border border-zinc-300/80 bg-white px-3 text-sm text-zinc-900 outline-none transition focus:border-red-300 focus:ring-2 focus:ring-red-200 dark:border-white/15 dark:bg-zinc-900/40 dark:text-zinc-100 dark:focus:border-red-300/60 dark:focus:ring-red-900/40"
              />
            </label>

            <label className="block space-y-1.5">
              <span className="text-sm font-medium text-zinc-700 dark:text-zinc-200">Sobrenome</span>
              <input
                type="text"
                value={sobrenome}
                onChange={(event) => setSobrenome(event.target.value)}
                placeholder="Seu sobrenome"
                required
                className="min-h-11 w-full rounded-xl border border-zinc-300/80 bg-white px-3 text-sm text-zinc-900 outline-none transition focus:border-red-300 focus:ring-2 focus:ring-red-200 dark:border-white/15 dark:bg-zinc-900/40 dark:text-zinc-100 dark:focus:border-red-300/60 dark:focus:ring-red-900/40"
              />
            </label>

            <label className="block space-y-1.5">
              <span className="text-sm font-medium text-zinc-700 dark:text-zinc-200">Email</span>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="voce@exemplo.com"
                required
                className="min-h-11 w-full rounded-xl border border-zinc-300/80 bg-white px-3 text-sm text-zinc-900 outline-none transition focus:border-red-300 focus:ring-2 focus:ring-red-200 dark:border-white/15 dark:bg-zinc-900/40 dark:text-zinc-100 dark:focus:border-red-300/60 dark:focus:ring-red-900/40"
              />
            </label>

            <label className="block space-y-1.5">
              <span className="text-sm font-medium text-zinc-700 dark:text-zinc-200">Senha</span>
              <input
                type="password"
                value={senha}
                onChange={(event) => setSenha(event.target.value)}
                placeholder="Minimo 6 caracteres"
                required
                className="min-h-11 w-full rounded-xl border border-zinc-300/80 bg-white px-3 text-sm text-zinc-900 outline-none transition focus:border-red-300 focus:ring-2 focus:ring-red-200 dark:border-white/15 dark:bg-zinc-900/40 dark:text-zinc-100 dark:focus:border-red-300/60 dark:focus:ring-red-900/40"
              />
            </label>

            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-red-500/80 bg-red-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-75"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
              <span>{isLoading ? 'Cadastrando...' : 'Cadastrar'}</span>
            </button>

            {errorMessage ? (
              <p
                role="alert"
                className="rounded-lg border border-red-300/60 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-950/30 dark:text-red-200"
              >
                {errorMessage}
              </p>
            ) : null}
          </form>

          <Link to="/auth/login" className="block w-full text-left text-sm text-zinc-600 transition hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-white">
            Ja tem conta? Fazer login
          </Link>
        </section>
      </div>
    </div>
  )
}
