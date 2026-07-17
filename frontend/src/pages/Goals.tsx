import React, { useState } from 'react'
import {
  Target,
  Calendar,
  CheckSquare,
  Sparkles,
  Plus,
  Edit2,
  Trash2,
  TrendingUp,
  Award
} from 'lucide-react'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input, Select } from '../components/ui/Input'
import { Dialog } from '../components/ui/Dialog'
import { useToastStore } from '../stores/toastStore'
import { LineChart } from '../components/ui/Chart'

interface Milestone {
  id: string
  title: string
  done: boolean
}

interface Goal {
  id: string
  title: string
  description?: string
  category: 'career' | 'health' | 'financial' | 'personal' | 'learning'
  deadline: string // YYYY-MM-DD
  milestones: Milestone[]
  history: { label: string; value: number }[] // History data for charts
}

export const Goals: React.FC = () => {
  const { addToast } = useToastStore()

  // Seed Data
  const [goals, setGoals] = useState<Goal[]>([
    {
      id: 'goal-1',
      title: 'Obtain AWS Solutions Architect Cert',
      description: 'Study cloud architectures, VPC configs, and scale options.',
      category: 'learning',
      deadline: '2026-10-15',
      milestones: [
        { id: 'm-1-1', title: 'Complete Stephane Maarek Course', done: true },
        { id: 'm-1-2', title: 'Pass 3 mock practice tests', done: false },
        { id: 'm-1-3', title: 'Schedule exam slot', done: false }
      ],
      history: [
        { label: 'Week 1', value: 0 },
        { label: 'Week 2', value: 15 },
        { label: 'Week 3', value: 33 },
        { label: 'Week 4', value: 33 }
      ]
    },
    {
      id: 'goal-2',
      title: 'Run a Half Marathon',
      description: 'Prepare legs and cardiovascular strength for 21.1km run.',
      category: 'health',
      deadline: '2026-08-30',
      milestones: [
        { id: 'm-2-1', title: 'Run 10km under 60 mins', done: true },
        { id: 'm-2-2', title: 'Complete 15km endurance run', done: true },
        { id: 'm-2-3', title: 'Weekly taper and stretching routine', done: false }
      ],
      history: [
        { label: 'Week 1', value: 10 },
        { label: 'Week 2', value: 35 },
        { label: 'Week 3', value: 66 },
        { label: 'Week 4', value: 66 }
      ]
    },
    {
      id: 'goal-3',
      title: 'Emergency Reserve Fund Savings',
      description: 'Save 6 months of basic expenses for security.',
      category: 'financial',
      deadline: '2026-12-31',
      milestones: [
        { id: 'm-3-1', title: 'Set up automatic deposit trigger', done: true },
        { id: 'm-3-2', title: 'Reach first $5,000 threshold', done: false }
      ],
      history: [
        { label: 'Week 1', value: 20 },
        { label: 'Week 2', value: 30 },
        { label: 'Week 3', value: 50 },
        { label: 'Week 4', value: 50 }
      ]
    }
  ])

  // Modals States
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null)

  // Form Fields
  const [formTitle, setFormTitle] = useState('')
  const [formDesc, setFormDesc] = useState('')
  const [formCategory, setFormCategory] = useState<Goal['category']>('career')
  const [formDeadline, setFormDeadline] = useState('')
  const [formMilestones, setFormMilestones] = useState<string[]>([])
  const [newMilestoneText, setNewMilestoneText] = useState('')

  // Calculate Progress Helper
  const getGoalProgress = (goal: Goal) => {
    if (goal.milestones.length === 0) return 0
    const completed = goal.milestones.filter((m) => m.done).length
    return Math.round((completed / goal.milestones.length) * 100)
  }

  // Analytics Computations
  const totalGoalsCount = goals.length
  const completedGoalsCount = goals.filter((g) => getGoalProgress(g) === 100).length
  const totalMilestonesCount = goals.reduce((acc, g) => acc + g.milestones.length, 0)
  const completedMilestonesCount = goals.reduce((acc, g) => acc + g.milestones.filter((m) => m.done).length, 0)
  const averageProgress = totalGoalsCount > 0
    ? Math.round(goals.reduce((acc, g) => acc + getGoalProgress(g), 0) / totalGoalsCount)
    : 0

  // Category Theme Badges Map
  const categoryThemes = {
    career: 'bg-indigo-50 text-indigo-700 border-indigo-100',
    health: 'bg-sky-50 text-sky-700 border-sky-100',
    financial: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    personal: 'bg-pink-50 text-pink-700 border-pink-100',
    learning: 'bg-purple-50 text-purple-700 border-purple-100'
  }

  // Open Create / Edit Dialogs
  const openCreateModal = () => {
    setModalMode('create')
    setSelectedGoalId(null)
    setFormTitle('')
    setFormDesc('')
    setFormCategory('career')
    setFormDeadline(new Date().toISOString().split('T')[0])
    setFormMilestones([])
    setIsModalOpen(true)
  }

  const openEditModal = (goal: Goal) => {
    setModalMode('edit')
    setSelectedGoalId(goal.id)
    setFormTitle(goal.title)
    setFormDesc(goal.description || '')
    setFormCategory(goal.category)
    setFormDeadline(goal.deadline)
    setFormMilestones(goal.milestones.map((m) => m.title))
    setIsModalOpen(true)
  }

  // Handlers
  const handleSaveGoal = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formTitle.trim()) {
      addToast('Goal title is required', 'warning')
      return
    }

    const milestoneObjects: Milestone[] = formMilestones.map((title, index) => {
      if (modalMode === 'edit' && selectedGoalId) {
        const existingGoal = goals.find((g) => g.id === selectedGoalId)
        const matched = existingGoal?.milestones[index]
        if (matched && matched.title === title) {
          return matched
        }
      }
      return { id: `m-${Math.random()}`, title, done: false }
    })

    if (modalMode === 'create') {
      const newGoal: Goal = {
        id: `goal-${Math.random().toString(36).substr(2, 9)}`,
        title: formTitle,
        description: formDesc,
        category: formCategory,
        deadline: formDeadline,
        milestones: milestoneObjects,
        history: [{ label: 'Week 1', value: 0 }]
      }
      setGoals([...goals, newGoal])
      addToast('New goal set successfully!', 'success')
    } else if (modalMode === 'edit' && selectedGoalId) {
      setGoals(
        goals.map((g) => {
          if (g.id === selectedGoalId) {
            const updatedMilestones = milestoneObjects
            const currentProgress = updatedMilestones.length > 0
              ? Math.round((updatedMilestones.filter((m) => m.done).length / updatedMilestones.length) * 100)
              : 0

            return {
              ...g,
              title: formTitle,
              description: formDesc,
              category: formCategory,
              deadline: formDeadline,
              milestones: updatedMilestones,
              history: [...g.history, { label: `W-${g.history.length + 1}`, value: currentProgress }]
            }
          }
          return g
        })
      )
      addToast('Goal configuration saved!', 'success')
    }
    setIsModalOpen(false)
  }

  const handleDeleteGoal = (id: string) => {
    setGoals(goals.filter((g) => g.id !== id))
    addToast('Goal removed', 'error')
    setIsModalOpen(false)
  }

  const addMilestoneInput = () => {
    if (newMilestoneText.trim()) {
      setFormMilestones([...formMilestones, newMilestoneText.trim()])
      setNewMilestoneText('')
    }
  }

  const removeMilestoneInput = (idx: number) => {
    setFormMilestones(formMilestones.filter((_, i) => i !== idx))
  }

  const toggleMilestone = (goalId: string, milestoneId: string) => {
    setGoals(
      goals.map((g) => {
        if (g.id === goalId) {
          const updatedMilestones = g.milestones.map((m) =>
            m.id === milestoneId ? { ...m, done: !m.done } : m
          )
          const newProgress = Math.round(
            (updatedMilestones.filter((m) => m.done).length / updatedMilestones.length) * 100
          )

          if (newProgress === 100) {
            addToast(`Congratulations! Goal "${g.title}" achieved! 🎉`, 'success')
          }

          return {
            ...g,
            milestones: updatedMilestones,
            history: [...g.history, { label: `W-${g.history.length + 1}`, value: newProgress }]
          }
        }
        return g
      })
    )
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
            Goals & Milestones 🎯
          </h1>
          <p className="text-slate-500 mt-1">Set long-term achievements and track progress metrics.</p>
        </div>
        <Button onClick={openCreateModal}>
          <Plus size={14} className="mr-1" /> Set New Goal
        </Button>
      </div>

      {/* Analytics Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Active Goals', value: totalGoalsCount, icon: <Target className="text-indigo-500" size={16} /> },
          { label: 'Achieved Goals', value: completedGoalsCount, icon: <Award className="text-emerald-500" size={16} /> },
          { label: 'Completed Milestones', value: `${completedMilestonesCount}/${totalMilestonesCount}`, icon: <CheckSquare className="text-sky-500" size={16} /> },
          { label: 'Average Progress', value: `${averageProgress}%`, icon: <TrendingUp className="text-pink-500" size={16} /> }
        ].map((stat, idx) => (
          <Card key={idx} variant="white" className="flex items-center gap-4 p-4 border border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center shrink-0">
              {stat.icon}
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{stat.label}</p>
              <h3 className="text-xl font-black text-slate-800 mt-0.5">{stat.value}</h3>
            </div>
          </Card>
        ))}
      </div>

      {/* AI Suggestions Box */}
      <Card variant="glass" className="space-y-3 p-6 border border-slate-200/55 relative overflow-hidden">
        <div className="flex items-center gap-2">
          <Sparkles className="text-purple-500 w-5 h-5 animate-pulse" />
          <h2 className="text-sm font-bold text-slate-800 tracking-tight">AI Goal Strategist recommendations</h2>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed max-w-4xl">
          "You are making rapid progress (66%) on your **Half Marathon** health goal! However, your study goal, **AWS Solutions Architect certification**, has pending course milestones that haven't changed in the last 7 days. Consider locking in 30 minutes of focus time in the mornings to balance your workloads."
        </p>
      </Card>

      {/* Goals Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {goals.map((goal) => {
          const progress = getGoalProgress(goal)
          return (
            <Card key={goal.id} variant="white" className="flex flex-col justify-between border border-slate-200/50 hover:shadow-xs transition-shadow">
              <div className="space-y-4">
                {/* Header */}
                <div className="flex justify-between items-start gap-4">
                  <div className="space-y-1">
                    <span className={`px-2 py-0.5 rounded-sm text-[8px] font-extrabold uppercase border ${categoryThemes[goal.category]}`}>
                      {goal.category}
                    </span>
                    <h3 className="font-extrabold text-slate-800 text-sm tracking-tight mt-1 leading-snug">
                      {goal.title}
                    </h3>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button
                      onClick={() => openEditModal(goal)}
                      className="p-1 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                    >
                      <Edit2 size={12} />
                    </button>
                    <button
                      onClick={() => handleDeleteGoal(goal.id)}
                      className="p-1 text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>

                {goal.description && (
                  <p className="text-xs text-slate-500 leading-relaxed font-medium">{goal.description}</p>
                )}

                {/* Progress Loader Bar */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[10px] text-slate-600 font-bold">
                    <span>Goal completion</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ${
                        progress === 100 ? 'bg-emerald-400' : 'bg-sky-400'
                      }`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                {/* Milestones list */}
                <div className="space-y-2.5 border-t border-slate-50 pt-3">
                  <h4 className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Milestones checklist</h4>
                  <div className="space-y-2">
                    {goal.milestones.map((m) => (
                      <label key={m.id} className="flex items-center gap-3 text-xs text-slate-700 font-medium cursor-pointer">
                        <input
                          type="checkbox"
                          checked={m.done}
                          onChange={() => toggleMilestone(goal.id, m.id)}
                          className="rounded-sm border-sky-300 text-sky-500 focus:ring-sky-500 shrink-0"
                        />
                        <span className={`leading-tight ${m.done ? 'line-through text-slate-400' : 'text-slate-700'}`}>
                          {m.title}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* History analytics mini chart */}
                {goal.history.length > 1 && (
                  <div className="border-t border-slate-50 pt-3">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5 mb-2">
                      <TrendingUp size={10} /> Progress Analytics Timeline
                    </span>
                    <LineChart height={80} data={goal.history} />
                  </div>
                )}
              </div>

              {/* Deadline */}
              <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-semibold border-t border-slate-50 pt-3 mt-4">
                <Calendar size={12} />
                <span>Target: {goal.deadline}</span>
              </div>
            </Card>
          )
        })}
      </div>

      {/* Goal details Dialog Modal */}
      <Dialog
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalMode === 'create' ? 'Set New Goal 🎯' : 'Edit Goal Specifications ✏️'}
        footer={
          <div className="flex justify-between w-full">
            {modalMode === 'edit' ? (
              <Button
                variant="danger"
                onClick={() => selectedGoalId && handleDeleteGoal(selectedGoalId)}
              >
                Delete Goal
              </Button>
            ) : (
              <div />
            )}
            <div className="flex gap-2">
              <Button variant="ghost" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveGoal} variant="primary">
                {modalMode === 'create' ? 'Create Goal' : 'Save Changes'}
              </Button>
            </div>
          </div>
        }
      >
        <form onSubmit={handleSaveGoal} className="space-y-4">
          <Input
            label="Goal Title"
            placeholder="Obtain certification, save money, gym streak..."
            value={formTitle}
            onChange={(e) => setFormTitle(e.target.value)}
          />

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Goal Description (Optional)</label>
            <textarea
              placeholder="Why this goal matters and what resources you need..."
              value={formDesc}
              onChange={(e) => setFormDesc(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm focus:outline-hidden focus:ring-2 focus:ring-sky-300 focus:border-sky-300 transition-all text-slate-800 h-20 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Category"
              value={formCategory}
              onChange={(e) => setFormCategory(e.target.value as any)}
              options={[
                { value: 'career', label: 'Career Development' },
                { value: 'health', label: 'Health & Fitness' },
                { value: 'financial', label: 'Financial Security' },
                { value: 'personal', label: 'Personal Growth' },
                { value: 'learning', label: 'Learning & Academics' }
              ]}
            />

            <Input
              label="Target Deadline"
              type="date"
              value={formDeadline}
              onChange={(e) => setFormDeadline(e.target.value)}
            />
          </div>

          {/* Milestones checklist */}
          <div className="space-y-2 border-t border-slate-100 pt-3">
            <label className="block text-xs font-semibold text-slate-500">Short-term Milestones (Required to calculate progress)</label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add milestone step..."
                value={newMilestoneText}
                onChange={(e) => setNewMilestoneText(e.target.value)}
                className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-sky-300 focus:border-sky-300 transition-all text-slate-800"
              />
              <Button type="button" onClick={addMilestoneInput} size="sm">
                Add Step
              </Button>
            </div>

            <div className="space-y-2 max-h-28 overflow-y-auto scrollbar-thin pt-1">
              {formMilestones.map((txt, idx) => (
                <div key={idx} className="flex justify-between items-center text-xs bg-slate-50 p-2 rounded-lg border border-slate-100">
                  <span className="truncate">{txt}</span>
                  <button
                    type="button"
                    onClick={() => removeMilestoneInput(idx)}
                    className="text-rose-500 font-bold hover:text-rose-600 cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>
        </form>
      </Dialog>
    </div>
  )
}
