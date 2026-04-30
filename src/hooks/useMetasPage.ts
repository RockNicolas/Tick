import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { DAY_DEMANDS_UPDATED_EVENT } from '../api/dayDemands'
import { createGoal, deleteGoal, fetchGoals, type Goal, type GoalStatus, updateGoal } from '../api/goals'
import { triggerNotificationEvent } from '../lib/tickNotifications'

export function useMetasPage() {
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

  function normalizeGoalStatus(goal: Goal): Goal {
    if (goal.progress >= 100 && goal.status !== 'completed') {
      return { ...goal, status: 'completed' }
    }
    return goal
  }

  async function loadGoals(tab: GoalStatus) {
    setIsLoading(true)
    setError('')
    try {
      const data = await fetchGoals(tab)
      const normalized = data.map(normalizeGoalStatus).filter((goal) => {
        if (tab === 'active') return goal.status === 'active'
        if (tab === 'completed') return goal.status === 'completed'
        return goal.status === 'late'
      })
      setGoals(normalized)
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Falha ao carregar metas')
    } finally {
      setIsLoading(false)
    }
  }

  async function syncAutoCompletedGoals() {
    const allGoals = await fetchGoals()
    let hasAutoCompletedGoal = false
    for (const goal of allGoals) {
      if (goal.progress < 100) continue
      if (goal.status !== 'completed') {
        await updateGoal(goal.id, { status: 'completed', progress: 100 })
      }
      hasAutoCompletedGoal = true
      triggerNotificationEvent('goal_progress_milestone', {
        title: `Meta concluida: ${goal.title}`,
        body: 'Parabens! Sua meta foi concluida com base nas demandas finalizadas.',
        dedupeKey: `goal_progress_milestone:auto:${goal.id}`,
        minIntervalMs: 365 * 24 * 60 * 60 * 1000,
      })
    }
    return hasAutoCompletedGoal
  }

  async function notifyGoldGoalAchievementIfUnlocked() {
    const completedGoals = await fetchGoals('completed')
    if (completedGoals.length < 1) return
    triggerNotificationEvent('goal_progress_milestone', {
      title: 'Conquista desbloqueada: Meta de Ouro',
      body: 'Voce concluiu sua primeira meta.',
      dedupeKey: 'achievement:goal',
      minIntervalMs: 365 * 24 * 60 * 60 * 1000,
    })
  }

  useEffect(() => {
    void loadGoals(selectedTab)
  }, [selectedTab])

  useEffect(() => {
    const onDemandsUpdated = () => {
      void (async () => {
        try {
          const hasAutoCompletedGoal = await syncAutoCompletedGoals()
          if (hasAutoCompletedGoal) await notifyGoldGoalAchievementIfUnlocked()
          const nextTab: GoalStatus = hasAutoCompletedGoal ? 'completed' : selectedTab
          if (hasAutoCompletedGoal) setSelectedTab('completed')
          await loadGoals(nextTab)
        } catch {
          // ignore: fluxo de notificacao nao deve bloquear recarga da tela
        }
      })()
    }
    window.addEventListener(DAY_DEMANDS_UPDATED_EVENT, onDemandsUpdated)
    return () => window.removeEventListener(DAY_DEMANDS_UPDATED_EVENT, onDemandsUpdated)
  }, [selectedTab])

  useEffect(() => {
    void (async () => {
      try {
        const hasAutoCompletedGoal = await syncAutoCompletedGoals()
        if (hasAutoCompletedGoal) await notifyGoldGoalAchievementIfUnlocked()
        if (hasAutoCompletedGoal && selectedTab === 'active') {
          setSelectedTab('completed')
        }
      } catch {
        // sem bloqueio de UI
      }
    })()
  }, [])

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

  const milestones = useMemo(() => goals.filter((goal) => Boolean(goal.dueDate)).slice(0, 2), [goals])

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
      setSelectedTab('active')
      await loadGoals('active')
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : 'Falha ao criar meta')
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleConcludeGoal(goalId: string) {
    setError('')
    try {
      const goal = await updateGoal(goalId, { status: 'completed', progress: 100 })
      triggerNotificationEvent('goal_progress_milestone', {
        title: `Meta concluida: ${goal.title}`,
        body: 'Parabens! Voce concluiu uma meta.',
        dedupeKey: `goal_progress_milestone:completed:${goal.id}`,
        minIntervalMs: 30 * 60 * 1000,
      })
      await notifyGoldGoalAchievementIfUnlocked()
      setSelectedTab('completed')
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
      const updated = await updateGoal(editingGoal.id, {
        title: editTitle.trim(),
        category: editCategory.trim() || 'geral',
        targetCount: Math.max(1, editTargetCount),
        dueDate: editDueDate || '',
      })
      if (updated.progress >= 100 || updated.status === 'completed') {
        triggerNotificationEvent('goal_progress_milestone', {
          title: `Meta concluida: ${updated.title}`,
          body: 'Parabens! Voce concluiu uma meta.',
          dedupeKey: `goal_progress_milestone:completed:${updated.id}`,
          minIntervalMs: 30 * 60 * 1000,
        })
        await notifyGoldGoalAchievementIfUnlocked()
      }
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

  useEffect(() => {
    if (goals.length === 0) return
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)
    for (const goal of goals) {
      if (!goal.dueDate) continue
      const dueDate = new Date(goal.dueDate)
      if (Number.isNaN(dueDate.getTime())) continue
      if (dueDate >= todayStart) continue
      if (goal.status === 'completed') continue
      triggerNotificationEvent('overdue_critical', {
        title: `Meta em atraso: ${goal.title}`,
        body: 'Existe uma meta com prazo vencido que precisa de atencao.',
        dedupeKey: `overdue_critical:goal:${goal.id}`,
        minIntervalMs: 30 * 60 * 1000,
      })
    }
  }, [goals])

  return {
    selectedTab,
    setSelectedTab,
    goals,
    isLoading,
    isSubmitting,
    error,
    title,
    setTitle,
    category,
    setCategory,
    targetCount,
    setTargetCount,
    dueDate,
    setDueDate,
    isCreateModalOpen,
    setIsCreateModalOpen,
    editingGoal,
    setEditingGoal,
    editTitle,
    setEditTitle,
    editCategory,
    setEditCategory,
    editTargetCount,
    setEditTargetCount,
    editDueDate,
    setEditDueDate,
    monthProgress,
    completedRate,
    milestones,
    handleCreateGoal,
    handleConcludeGoal,
    handleOpenEditGoal,
    handleEditGoal,
    handleDeleteGoal,
  }
}
