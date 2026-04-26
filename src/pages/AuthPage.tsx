import { useState } from 'react'
import type { FormEvent } from 'react'
import { Home, Loader2 } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { loginWithEmail, registerWithEmail } from '../api/auth'

type AuthMode = 'login' | 'cadastro'

export default function AuthPage() {
  const navigate = useNavigate()
  const [mode, setMode] = useState<AuthMode>('login')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [nome, setNome] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const isCadastro = mode === 'cadastro'

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setErrorMessage('')
    setIsLoading(true)

    try {
      if (isCadastro) {
        if (nome.trim().length < 2 || senha.length < 6) {
          setErrorMessage('Preencha nome e senha com 6+ caracteres')
          setIsLoading(false)
          return
        }
        const user = await registerWithEmail({
          name: nome.trim(),
          email: email.trim(),
          password: senha,
        })
        localStorage.setItem('tick:user', JSON.stringify(user))
      } else {
        const user = await loginWithEmail({
          email: email.trim(),
          password: senha,
        })
        localStorage.setItem('tick:user', JSON.stringify(user))
      }

      navigate('/', { replace: true })
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Erro ao autenticar')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="relative isolate min-h-[100dvh] overflow-x-hidden bg-zinc-950 px-4 py-8 text-zinc-100 sm:px-6">
      <div className="mx-auto w-full max-w-md space-y-4">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-zinc-300 transition hover:text-white"
        >
          <Home className="h-4 w-4" aria-hidden />
          Voltar para Agenda
        </Link>

        <section className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-5 shadow-lg backdrop-blur-md">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold text-white">{isCadastro ? 'Cadastro' : 'Login'}</h1>
            <p className="text-sm text-zinc-300">
              {isCadastro
                ? 'Crie sua conta para comecar a usar o Tick.'
                : 'Entre para acessar sua agenda.'}
            </p>
          </div>

          <form className="space-y-3" onSubmit={onSubmit}>
            {isCadastro ? (
              <label className="block space-y-1.5">
                <span className="text-sm font-medium text-zinc-200">Nome</span>
                <input
                  type="text"
                  value={nome}
                  onChange={(event) => setNome(event.target.value)}
                  placeholder="Seu nome"
                  required
                  className="min-h-11 w-full rounded-xl border border-white/15 bg-zinc-900/40 px-3 text-sm text-zinc-100 outline-none transition focus:border-red-300/60 focus:ring-2 focus:ring-red-900/40"
                />
              </label>
            ) : null}

            <label className="block space-y-1.5">
              <span className="text-sm font-medium text-zinc-200">Email</span>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="voce@exemplo.com"
                required
                className="min-h-11 w-full rounded-xl border border-white/15 bg-zinc-900/40 px-3 text-sm text-zinc-100 outline-none transition focus:border-red-300/60 focus:ring-2 focus:ring-red-900/40"
              />
            </label>

            <label className="block space-y-1.5">
              <span className="text-sm font-medium text-zinc-200">Senha</span>
              <input
                type="password"
                value={senha}
                onChange={(event) => setSenha(event.target.value)}
                placeholder={isCadastro ? 'Minimo 6 caracteres' : 'Sua senha'}
                required
                className="min-h-11 w-full rounded-xl border border-white/15 bg-zinc-900/40 px-3 text-sm text-zinc-100 outline-none transition focus:border-red-300/60 focus:ring-2 focus:ring-red-900/40"
              />
            </label>

            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-red-500/80 bg-red-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-75"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
              <span>
                {isLoading ? (isCadastro ? 'Cadastrando...' : 'Entrando...') : isCadastro ? 'Cadastrar' : 'Entrar'}
              </span>
            </button>

            {errorMessage ? (
              <p
                role="alert"
                className="rounded-lg border border-red-500/30 bg-red-950/30 px-3 py-2 text-sm text-red-200"
              >
                {errorMessage}
              </p>
            ) : null}

            {!isCadastro ? (
              <button
                type="button"
                className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 py-2.5 text-sm font-medium text-zinc-100 transition hover:border-white/25 hover:bg-white/15"
              >
                Continuar com Google
              </button>
            ) : null}
          </form>

          <button
            type="button"
            className="w-full text-left text-sm text-zinc-300 transition hover:text-white"
            onClick={() => {
              setMode(isCadastro ? 'login' : 'cadastro')
              setErrorMessage('')
            }}
          >
            {isCadastro ? 'Ja tem conta? Fazer login' : 'Nao tem conta? Criar cadastro'}
          </button>
        </section>
      </div>
    </div>
  )
}
