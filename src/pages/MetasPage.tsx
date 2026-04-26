import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { CircleEllipsis, Plus, Square, Target, Wallet } from 'lucide-react'
import { createGoal, deleteGoal, fetchGoals, type Goal, type GoalStatus, updateGoal } from '../api/goals'

const tabs: Array<{ id: GoalStatus; label: string }> = [
  { id: 'active', label: 'Ativas' },
  { id: 'completed', label: 'Concluídas' },
  { id: 'late', label: 'Atrasadas' },
]

const categoryIcons = {
  fitness: Target,
  financas: Wallet,
  leitura: Square,
}

function formatDate(value: string | null) {
  if (!value) return '--'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '--'
  return date.toLocaleDateString('pt-BR')
}

function formatDateTime(value: string | null) {
  if (!value) return '--'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '--'
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

export default function MetasPage() {
  const [selectedTab, setSelectedTab] = useState<GoalStatus>('active')
  const [goals, setGoals] = useState<Goal[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('geral')
  const [targetCount, setTargetCount] = useState(4)
  const [dueDate, setDueDate] = useState('')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editCategory, setEditCategory] = useState('geral')
  const [editTargetCount, setEditTargetCount] = useState(1)
  const [editDueDate, setEditDueDate] = useState('')

  async function loadGoals(tab: GoalStatus) {
    setIsLoading(true)
    setError('')
    try {
      const data = await fetchGoals(tab)
      setGoals(data)
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Falha ao carregar metas')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void loadGoals(selectedTab)
  }, [selectedTab])

  useEffect(() => {
    if (!isCreateModalOpen) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsCreateModalOpen(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [isCreateModalOpen])

  useEffect(() => {
    if (!editingGoal) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setEditingGoal(null)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [editingGoal])

  const monthProgress = useMemo(() => {
    if (goals.length === 0) return 0
    return Math.round(goals.reduce((acc, goal) => acc + goal.progress, 0) / goals.length)
  }, [goals])

  const completedRate = useMemo(() => {
    if (goals.length === 0) return 0
    const completed = goals.filter((goal) => goal.status === 'completed').length
    return Math.round((completed / goals.length) * 100)
  }, [goals])

  const milestones = useMemo(() => {
    return goals.filter((goal) => Boolean(goal.dueDate)).slice(0, 2)
  }, [goals])

  async function handleCreateGoal(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSubmitting(true)
    setError('')
    try {
      await createGoal({
        title,
        category: category.trim() || 'geral',
        targetCount: Math.max(1, targetCount),
        dueDate: dueDate || undefined,
      })
      setTitle('')
      setCategory('geral')
      setTargetCount(4)
      setDueDate('')
      setIsCreateModalOpen(false)
      await loadGoals(selectedTab)
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : 'Falha ao criar meta')
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleConcludeGoal(goalId: string) {
    setError('')
    try {
      await updateGoal(goalId, { status: 'completed', progress: 100 })
      await loadGoals(selectedTab)
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : 'Falha ao concluir meta')
    }
  }

  function handleOpenEditGoal(goal: Goal) {
    setEditingGoal(goal)
    setEditTitle(goal.title)
    setEditCategory(goal.category || 'geral')
    setEditTargetCount(Math.max(1, goal.targetCount || 1))
    setEditDueDate(goal.dueDate ? new Date(goal.dueDate).toISOString().slice(0, 10) : '')
  }

  async function handleEditGoal(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!editingGoal) return
    setIsSubmitting(true)
    setError('')
    try {
      await updateGoal(editingGoal.id, {
        title: editTitle.trim(),
        category: editCategory.trim() || 'geral',
        targetCount: Math.max(1, editTargetCount),
        dueDate: editDueDate || '',
      })
      setEditingGoal(null)
      await loadGoals(selectedTab)
    } catch (editError) {
      setError(editError instanceof Error ? editError.message : 'Falha ao editar meta')
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleDeleteGoal() {
    if (!editingGoal) return
    
    setIsSubmitting(true)
    setError('')
    try {
      await deleteGoal(editingGoal.id)
      setEditingGoal(null)
      await loadGoals(selectedTab)
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Falha ao excluir meta')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-full min-w-0 rounded-2xl border border-teal-300/30 bg-zinc-900/10 p-4 sm:p-5 dark:bg-black/20">
      <div className="space-y-4 sm:space-y-5">
        <div className="flex min-w-0 flex-wrap items-center gap-2 text-2xl font-semibold text-zinc-900 dark:text-zinc-100 sm:text-3xl">
          <Target className="h-7 w-7 shrink-0 text-emerald-400 sm:h-8 sm:w-8" />
          <span className="min-w-0">Metas</span>
        </div>
        <p className="max-w-prose text-sm leading-relaxed text-zinc-600 dark:text-zinc-400 sm:text-base">
          Defina e acompanhe metas
        </p>
      </div>
      {error ? <p className="mt-3 text-sm text-red-500">{error}</p> : null}

      <div className="mt-5 grid grid-cols-1 gap-4 xl:grid-cols-[0.9fr_2fr_1fr]">
        <section className="rounded-2xl border border-zinc-200/70 bg-white/60 p-4 dark:border-white/10 dark:bg-black/30">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Progresso do Mês</h2>
          <div className="mt-4 flex items-center gap-4">
            <div
              className="relative h-20 w-20 rounded-full"
              style={{
                background: `conic-gradient(rgb(45 212 191) ${monthProgress * 3.6}deg, rgba(148,163,184,0.25) 0deg)`,
              }}
            >
              <div className="absolute inset-[7px] grid place-items-center rounded-full bg-zinc-900/80 text-sm font-semibold text-white">
                {monthProgress}%
              </div>
            </div>
            <div className="space-y-1 text-sm">
              <p className="font-semibold text-zinc-900 dark:text-zinc-100">{monthProgress}%</p>
              <p className="text-zinc-600 dark:text-zinc-400">Progresso Mês</p>
              <p className="font-semibold text-zinc-900 dark:text-zinc-100">{completedRate}%</p>
              <p className="text-zinc-600 dark:text-zinc-400">Concluídas</p>
            </div>
          </div>
          <div className="mt-4 rounded-xl border border-zinc-200/80 bg-white/70 px-3 py-2.5 dark:border-white/10 dark:bg-white/5">
            <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{tabs.find((t) => t.id === selectedTab)?.label}</p>
            <p className="text-xs text-zinc-600 dark:text-zinc-400">{goals.length} metas</p>
          </div>
        </section>

        <section className="rounded-2xl border border-zinc-200/70 bg-white/60 p-4 dark:border-white/10 dark:bg-black/30">
          <div className="mb-3 flex items-center justify-between gap-2">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Metas</h2>
            <div className="rounded-xl border border-zinc-200/80 bg-white/70 p-1 text-xs dark:border-white/10 dark:bg-white/5">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setSelectedTab(tab.id)}
                  className={
                    selectedTab === tab.id
                      ? 'rounded-lg bg-zinc-200/90 px-2.5 py-1 text-zinc-900 dark:bg-white/15 dark:text-zinc-100'
                      : 'px-2 py-1 text-zinc-600 dark:text-zinc-400'
                  }
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2.5">
            {isLoading ? <p className="text-sm text-zinc-600 dark:text-zinc-400">Carregando metas...</p> : null}
            {!isLoading && goals.length === 0 ? (
              <p className="text-sm text-zinc-600 dark:text-zinc-400">Nenhuma meta cadastrada nessa aba.</p>
            ) : null}
            {!isLoading
              ? goals.map((goal) => {
                  const key = goal.category.toLowerCase() as keyof typeof categoryIcons
                  const Icon = categoryIcons[key] ?? Plus
                  return (
                    <article
                      key={goal.id}
                      className="rounded-xl border border-zinc-200/80 bg-white/80 p-2.5 dark:border-white/10 dark:bg-white/5"
                    >
                      <div className="flex items-center gap-3">
                        <div className="grid h-8 w-8 place-items-center rounded-full bg-teal-500/20">
                          <Icon className="h-4 w-4 text-teal-300" aria-hidden />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="mb-1 flex items-center justify-between gap-2">
                            <p className="truncate font-medium text-zinc-900 dark:text-zinc-100">{goal.title}</p>
                            <p className="text-sm text-zinc-700 dark:text-zinc-300">{goal.progress}%</p>
                          </div>
                          <p className="mb-1 text-[11px] uppercase tracking-wide text-zinc-500 dark:text-zinc-500">
                            {goal.category} · alvo {goal.targetCount}
                          </p>
                          <div className="h-1.5 w-full rounded-full bg-zinc-300/60 dark:bg-zinc-700/60">
                            <div
                              className="h-1.5 rounded-full bg-teal-400"
                              style={{ width: `${goal.progress}%` }}
                              aria-hidden
                            />
                          </div>
                        </div>
                        <p className="max-w-[7.5rem] shrink-0 text-right text-xs text-zinc-600 dark:text-zinc-400">
                          {goal.status === 'completed' ? (
                            <>
                              Concluída
                              <br />
                              {formatDateTime(goal.completedAt ?? goal.updatedAt)}
                            </>
                          ) : (
                            formatDate(goal.dueDate)
                          )}
                        </p>
                        <div className="flex items-center gap-2">
                          {goal.status === 'active' || goal.status === 'late' ? (
                            <button
                              type="button"
                              onClick={() => handleConcludeGoal(goal.id)}
                              className="rounded-xl border border-zinc-300/90 bg-zinc-100/90 px-3 py-1.5 text-sm font-medium text-zinc-800 dark:border-white/10 dark:bg-white/10 dark:text-zinc-100"
                            >
                              Concluir
                            </button>
                          ) : null}
                          <button
                            type="button"
                            onClick={() => handleOpenEditGoal(goal)}
                            className="rounded-xl border border-zinc-300/90 bg-zinc-100/90 px-3 py-1.5 text-sm font-medium text-zinc-800 dark:border-white/10 dark:bg-white/10 dark:text-zinc-100"
                          >
                            Editar
                          </button>
                        </div>
                      </div>
                    </article>
                  )
                })
              : null}
          </div>
        </section>

        <section className="flex flex-col gap-3">
          <div className="rounded-2xl border border-zinc-200/70 bg-white/60 p-4 dark:border-white/10 dark:bg-black/30">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Milestones Importantes</h2>
              <CircleEllipsis className="h-4 w-4 text-zinc-500 dark:text-zinc-400" aria-hidden />
            </div>
            <div className="space-y-2">
              {milestones.length === 0 ? (
                <p className="text-sm text-zinc-600 dark:text-zinc-400">Sem milestones no momento.</p>
              ) : (
                milestones.map((goal) => (
                  <article
                    key={goal.id}
                    className="rounded-xl border border-zinc-200/80 bg-white/75 px-3 py-2 dark:border-white/10 dark:bg-white/5"
                  >
                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{goal.title}</p>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400">Prazo: {formatDate(goal.dueDate)}</p>
                  </article>
                ))
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl border border-teal-300/40 bg-teal-200/30 px-4 py-2.5 text-base font-medium text-zinc-900 transition hover:bg-teal-200/40 dark:bg-teal-400/20 dark:text-zinc-100 dark:hover:bg-teal-400/30"
          >
            <Plus className="h-5 w-5" aria-hidden />
            Adicionar Meta
          </button>
        </section>
      </div>

      {isCreateModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"
            aria-label="Fechar modal de nova meta"
            onClick={() => setIsCreateModalOpen(false)}
          />
          <form
            onSubmit={handleCreateGoal}
            className="relative z-10 w-full max-w-md space-y-4 rounded-2xl border border-zinc-200/80 bg-white/95 p-5 shadow-xl dark:border-white/10 dark:bg-zinc-900/95"
          >
            <div>
              <p className="text-base font-semibold text-zinc-900 dark:text-zinc-100">Adicionar meta</p>
              <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
                Crie uma nova meta e acompanhe seu progresso na lista principal.
              </p>
            </div>
            <div className="space-y-1.5">
              <label
                htmlFor="goal-title"
                className="text-xs font-medium tracking-wide text-zinc-700 uppercase dark:text-zinc-300"
              >
                Título
              </label>
              <input
                id="goal-title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Ex.: Ler 2 livros este mês"
                required
                className="min-h-10 w-full rounded-xl border border-zinc-300/80 bg-white/80 px-3 text-sm text-zinc-900 outline-none focus:border-teal-400 dark:border-white/10 dark:bg-white/10 dark:text-zinc-100"
              />
            </div>
            <div className="space-y-1.5">
              <label
                htmlFor="goal-category"
                className="text-xs font-medium tracking-wide text-zinc-700 uppercase dark:text-zinc-300"
              >
                Categoria
              </label>
              <input
                id="goal-category"
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                placeholder="Ex.: academia"
                required
                className="min-h-10 w-full rounded-xl border border-zinc-300/80 bg-white/80 px-3 text-sm text-zinc-900 outline-none focus:border-teal-400 dark:border-white/10 dark:bg-white/10 dark:text-zinc-100"
              />
            </div>
            <div className="space-y-1.5">
              <label
                htmlFor="goal-target-count"
                className="text-xs font-medium tracking-wide text-zinc-700 uppercase dark:text-zinc-300"
              >
                Alvo de tarefas
              </label>
              <input
                id="goal-target-count"
                value={targetCount}
                onChange={(event) => setTargetCount(Number(event.target.value))}
                type="number"
                min={1}
                className="min-h-10 w-full rounded-xl border border-zinc-300/80 bg-white/80 px-3 text-sm text-zinc-900 outline-none focus:border-teal-400 dark:border-white/10 dark:bg-white/10 dark:text-zinc-100"
              />
            </div>
            <div className="space-y-1.5">
              <label
                htmlFor="goal-due-date"
                className="text-xs font-medium tracking-wide text-zinc-700 uppercase dark:text-zinc-300"
              >
                Prazo (opcional)
              </label>
              <input
                id="goal-due-date"
                value={dueDate}
                onChange={(event) => setDueDate(event.target.value)}
                type="date"
                className="min-h-10 w-full rounded-xl border border-zinc-300/80 bg-white/80 px-3 text-sm text-zinc-900 outline-none focus:border-teal-400 dark:border-white/10 dark:bg-white/10 dark:text-zinc-100"
              />
            </div>
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="rounded-xl border border-zinc-300/80 px-3 py-2 text-sm text-zinc-700 transition hover:bg-zinc-100 dark:border-white/10 dark:text-zinc-200 dark:hover:bg-white/10"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-teal-300/40 bg-teal-200/30 px-4 py-2 text-sm font-medium text-zinc-900 transition hover:bg-teal-200/40 disabled:cursor-not-allowed disabled:opacity-70 dark:bg-teal-400/20 dark:text-zinc-100 dark:hover:bg-teal-400/30"
              >
                <Plus className="h-4 w-4" aria-hidden />
                {isSubmitting ? 'Salvando...' : 'Salvar meta'}
              </button>
            </div>
          </form>
        </div>
      ) : null}

      {editingGoal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"
            aria-label="Fechar modal de edição"
            onClick={() => setEditingGoal(null)}
          />
          <form
            onSubmit={handleEditGoal}
            className="relative z-10 w-full max-w-md space-y-4 rounded-2xl border border-zinc-200/80 bg-white/95 p-5 shadow-xl dark:border-white/10 dark:bg-zinc-900/95"
          >
            <p className="text-base font-semibold text-zinc-900 dark:text-zinc-100">Editar meta</p>
            <input
              value={editTitle}
              onChange={(event) => setEditTitle(event.target.value)}
              required
              className="min-h-10 w-full rounded-xl border border-zinc-300/80 bg-white/80 px-3 text-sm text-zinc-900 outline-none focus:border-teal-400 dark:border-white/10 dark:bg-white/10 dark:text-zinc-100"
            />
            <input
              value={editCategory}
              onChange={(event) => setEditCategory(event.target.value)}
              required
              className="min-h-10 w-full rounded-xl border border-zinc-300/80 bg-white/80 px-3 text-sm text-zinc-900 outline-none focus:border-teal-400 dark:border-white/10 dark:bg-white/10 dark:text-zinc-100"
            />
            <input
              value={editTargetCount}
              onChange={(event) => setEditTargetCount(Number(event.target.value))}
              type="number"
              min={1}
              className="min-h-10 w-full rounded-xl border border-zinc-300/80 bg-white/80 px-3 text-sm text-zinc-900 outline-none focus:border-teal-400 dark:border-white/10 dark:bg-white/10 dark:text-zinc-100"
            />
            <input
              value={editDueDate}
              onChange={(event) => setEditDueDate(event.target.value)}
              type="date"
              className="min-h-10 w-full rounded-xl border border-zinc-300/80 bg-white/80 px-3 text-sm text-zinc-900 outline-none focus:border-teal-400 dark:border-white/10 dark:bg-white/10 dark:text-zinc-100"
            />
            <div className="flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={handleDeleteGoal}
                disabled={isSubmitting}
                className="rounded-xl border border-red-300/70 bg-red-50/80 px-3 py-2 text-sm text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-70 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-300 dark:hover:bg-red-500/20"
              >
                Excluir meta
              </button>
              <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setEditingGoal(null)}
                className="rounded-xl border border-zinc-300/80 px-3 py-2 text-sm text-zinc-700 transition hover:bg-zinc-100 dark:border-white/10 dark:text-zinc-200 dark:hover:bg-white/10"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-teal-300/40 bg-teal-200/30 px-4 py-2 text-sm font-medium text-zinc-900 transition hover:bg-teal-200/40 disabled:cursor-not-allowed disabled:opacity-70 dark:bg-teal-400/20 dark:text-zinc-100 dark:hover:bg-teal-400/30"
              >
                {isSubmitting ? 'Salvando...' : 'Salvar alterações'}
              </button>
              </div>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  )
}
