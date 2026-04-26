import { useState } from 'react'
import type { FormEvent } from 'react'
import { Eye, EyeOff, Home, Loader2 } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { loginWithEmail } from '../api/auth'

export default function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setErrorMessage('')
    setIsLoading(true)

    try {
      const user = await loginWithEmail({
        email: email.trim(),
        password: senha,
      })
      localStorage.setItem('tick:user', JSON.stringify(user))
      navigate('/', { replace: true })
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Erro ao autenticar')
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
            <h1 className="text-2xl font-semibold text-zinc-900 dark:text-white">Login</h1>
            <p className="text-sm text-zinc-600 dark:text-zinc-300">Entre para acessar sua agenda.</p>
          </div>

          <form className="space-y-3" onSubmit={onSubmit}>
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
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={senha}
                  onChange={(event) => setSenha(event.target.value)}
                  placeholder="Sua senha"
                  required
                  className="min-h-11 w-full rounded-xl border border-zinc-300/80 bg-white px-3 pr-11 text-sm text-zinc-900 outline-none transition focus:border-red-300 focus:ring-2 focus:ring-red-200 dark:border-white/15 dark:bg-zinc-900/40 dark:text-zinc-100 dark:focus:border-red-300/60 dark:focus:ring-red-900/40"
                />
                <button
                  type="button"
                  className="absolute right-1.5 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-white/10 dark:hover:text-white"
                  onClick={() => setShowPassword((value) => !value)}
                  aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" aria-hidden /> : <Eye className="h-4 w-4" aria-hidden />}
                </button>
              </div>
            </label>

            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-red-500/80 bg-red-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-75"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
              <span>{isLoading ? 'Entrando...' : 'Entrar'}</span>
            </button>

            {errorMessage ? (
              <p
                role="alert"
              className="rounded-lg border border-red-300/60 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-950/30 dark:text-red-200"
              >
                {errorMessage}
              </p>
            ) : null}

            <button
              type="button"
              className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-zinc-300/90 bg-white px-4 py-2.5 text-sm font-medium text-zinc-900 transition hover:border-zinc-400 hover:bg-zinc-50 dark:border-white/15 dark:bg-white/10 dark:text-zinc-100 dark:hover:border-white/25 dark:hover:bg-white/15"
            >
              Continuar com Google
            </button>
          </form>

          <Link to="/auth/cadastro" className="block w-full text-left text-sm text-zinc-600 transition hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-white">
            Nao tem conta? Criar cadastro
          </Link>
        </section>
      </div>
    </div>
  )
}
