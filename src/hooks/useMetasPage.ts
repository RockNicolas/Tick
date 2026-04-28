import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { DAY_DEMANDS_UPDATED_EVENT } from '../api/dayDemands'
import { createGoal, deleteGoal, fetchGoals, type Goal, type GoalStatus, updateGoal } from '../api/goals'

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
    const onDemandsUpdated = () => {
      void loadGoals(selectedTab)
    }
    window.addEventListener(DAY_DEMANDS_UPDATED_EVENT, onDemandsUpdated)
    return () => window.removeEventListener(DAY_DEMANDS_UPDATED_EVENT, onDemandsUpdated)
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
