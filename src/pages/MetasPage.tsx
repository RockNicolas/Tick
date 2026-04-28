import { useMetasPage } from '../hooks/useMetasPage'
import MetasCreateModal from '../components/metas/MetasCreateModal'
import MetasEditModal from '../components/metas/MetasEditModal'
import MetasGoalsSection from '../components/metas/MetasGoalsSection'
import MetasMilestonesColumn from '../components/metas/MetasMilestonesColumn'
import MetasPageHeader from '../components/metas/MetasPageHeader'
import MetasProgressCard from '../components/metas/MetasProgressCard'

export default function MetasPage() {
  const m = useMetasPage()

  return (
    <div className="min-h-full min-w-0 rounded-2xl border border-teal-300/30 bg-zinc-900/10 p-4 sm:p-5 dark:bg-black/20">
      <MetasPageHeader />
      {m.error ? <p className="mt-3 text-sm text-red-500">{m.error}</p> : null}

      <div className="mt-5 grid grid-cols-1 gap-4 xl:grid-cols-[0.9fr_2fr_1fr]">
        <MetasProgressCard
          monthProgress={m.monthProgress}
          completedRate={m.completedRate}
          selectedTab={m.selectedTab}
          goalCount={m.goals.length}
        />
        <MetasGoalsSection
          selectedTab={m.selectedTab}
          onTabChange={m.setSelectedTab}
          isLoading={m.isLoading}
          goals={m.goals}
          onConcludeGoal={m.handleConcludeGoal}
          onOpenEditGoal={m.handleOpenEditGoal}
        />
        <MetasMilestonesColumn onAddClick={() => m.setIsCreateModalOpen(true)} />
      </div>

      <MetasCreateModal
        open={m.isCreateModalOpen}
        onClose={() => m.setIsCreateModalOpen(false)}
        title={m.title}
        onTitleChange={m.setTitle}
        category={m.category}
        onCategoryChange={m.setCategory}
        targetCount={m.targetCount}
        onTargetCountChange={m.setTargetCount}
        dueDate={m.dueDate}
        onDueDateChange={m.setDueDate}
        isSubmitting={m.isSubmitting}
        onSubmit={m.handleCreateGoal}
      />

      <MetasEditModal
        goal={m.editingGoal}
        onClose={() => m.setEditingGoal(null)}
        editTitle={m.editTitle}
        onEditTitleChange={m.setEditTitle}
        editCategory={m.editCategory}
        onEditCategoryChange={m.setEditCategory}
        editTargetCount={m.editTargetCount}
        onEditTargetCountChange={m.setEditTargetCount}
        editDueDate={m.editDueDate}
        onEditDueDateChange={m.setEditDueDate}
        isSubmitting={m.isSubmitting}
        onSubmit={m.handleEditGoal}
        onDelete={m.handleDeleteGoal}
      />
    </div>
  )
}
