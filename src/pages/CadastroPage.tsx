import { useState } from 'react'
import type { FormEvent } from 'react'
import { CalendarDays, Eye, EyeOff, Loader2 } from 'lucide-react'
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
  const [showPassword, setShowPassword] = useState(false)

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
    <div className="min-h-[100dvh] bg-[#07080d] p-3 text-zinc-100 sm:p-5">
      <div className="mx-auto grid min-h-[calc(100dvh-1.5rem)] w-full max-w-6xl overflow-hidden rounded-2xl border border-white/10 bg-zinc-950/90 shadow-2xl sm:min-h-[calc(100dvh-2.5rem)] md:grid-cols-2">
        <section className="relative hidden overflow-hidden border-r border-white/5 bg-[radial-gradient(120%_120%_at_0%_0%,rgba(239,68,68,0.42),rgba(127,29,29,0.22)_38%,rgba(10,10,14,0.96)_78%)] p-8 md:flex md:flex-col md:justify-between">
          <CalendarDays className="pointer-events-none absolute -left-8 -top-6 h-28 w-28 text-red-200/15" aria-hidden />
          <CalendarDays className="pointer-events-none absolute -bottom-8 -left-5 h-32 w-32 rotate-[-18deg] text-red-300/10" aria-hidden />
          <CalendarDays className="pointer-events-none absolute -right-8 -top-6 h-32 w-32 text-red-200/10" aria-hidden />
          <CalendarDays className="pointer-events-none absolute -right-10 -bottom-8 h-36 w-36 rotate-[14deg] text-red-300/10" aria-hidden />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_38%_34%,rgba(255,255,255,0.08),transparent_42%)]" />

          <div />
          <div className="max-w-sm space-y-3">
            <h1 className="text-5xl font-semibold leading-tight tracking-tight text-white">Sua Agenda, Organizada.</h1>
            <p className="text-xl text-zinc-200/85">Comece agora e mantenha tudo em um lugar.</p>
          </div>
          <div />
        </section>

        <section className="relative flex flex-col justify-center overflow-hidden bg-zinc-950 px-5 py-8 sm:px-8">
          <CalendarDays className="pointer-events-none absolute -left-7 -top-6 h-20 w-20 text-red-300/15 md:hidden" aria-hidden />
          <CalendarDays className="pointer-events-none absolute -right-8 top-10 h-24 w-24 rotate-12 text-red-300/10 md:hidden" aria-hidden />
          <CalendarDays className="pointer-events-none absolute -bottom-8 -right-8 h-24 w-24 text-red-300/10 md:hidden" aria-hidden />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_16%_10%,rgba(239,68,68,0.16),transparent_34%)] md:hidden" />
          <div className="mx-auto w-full max-w-md">
            <div className="rounded-2xl border border-white/10 bg-zinc-950/80 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-md sm:p-6">
              <div className="mb-6">
                <h2 className="text-4xl font-semibold tracking-tight text-white">Cadastro</h2>
                <p className="mt-1 text-zinc-400">Crie sua conta para acessar sua agenda.</p>
              </div>

              <form className="space-y-4" onSubmit={onSubmit}>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <label className="block space-y-1.5">
                  <span className="text-sm font-medium text-zinc-200">Nome</span>
                  <input
                    type="text"
                    value={nome}
                    onChange={(event) => setNome(event.target.value)}
                    placeholder="Seu nome"
                    required
                    className="min-h-12 w-full rounded-xl border border-white/12 bg-zinc-900/90 px-3 text-sm text-zinc-100 outline-none transition placeholder:text-zinc-500 focus:border-red-400 focus:ring-2 focus:ring-red-900/40"
                  />
                </label>

                <label className="block space-y-1.5">
                  <span className="text-sm font-medium text-zinc-200">Sobrenome</span>
                  <input
                    type="text"
                    value={sobrenome}
                    onChange={(event) => setSobrenome(event.target.value)}
                    placeholder="Seu sobrenome"
                    required
                    className="min-h-12 w-full rounded-xl border border-white/12 bg-zinc-900/90 px-3 text-sm text-zinc-100 outline-none transition placeholder:text-zinc-500 focus:border-red-400 focus:ring-2 focus:ring-red-900/40"
                  />
                </label>
              </div>

              <label className="block space-y-1.5">
                <span className="text-sm font-medium text-zinc-200">Email</span>
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="voce@exemplo.com"
                  required
                  className="min-h-12 w-full rounded-xl border border-red-500/55 bg-zinc-900/90 px-3 text-sm text-zinc-100 outline-none transition placeholder:text-zinc-500 focus:border-red-400 focus:ring-2 focus:ring-red-900/40"
                />
              </label>

              <label className="block space-y-1.5">
                <span className="text-sm font-medium text-zinc-200">Senha</span>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={senha}
                    onChange={(event) => setSenha(event.target.value)}
                    placeholder="Minimo 6 caracteres"
                    required
                    className="min-h-12 w-full rounded-xl border border-white/12 bg-zinc-900/90 px-3 pr-11 text-sm text-zinc-100 outline-none transition placeholder:text-zinc-500 focus:border-red-400 focus:ring-2 focus:ring-red-900/40"
                  />
                  <button
                    type="button"
                    className="absolute right-1.5 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-zinc-500 transition hover:bg-white/5 hover:text-zinc-200"
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
                className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-red-400/80 bg-red-500 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_0_30px_rgba(239,68,68,0.28)] transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-75"
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
                <span>{isLoading ? 'Cadastrando...' : 'Cadastrar'}</span>
              </button>

                {errorMessage ? (
                  <p
                    role="alert"
                    className="rounded-lg border border-red-500/40 bg-red-950/35 px-3 py-2 text-sm text-red-200"
                  >
                    {errorMessage}
                  </p>
                ) : null}
              </form>

              <Link to="/auth/login" className="mt-4 block text-sm text-zinc-300 transition hover:text-white">
                Ja tem conta? Fazer login
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
