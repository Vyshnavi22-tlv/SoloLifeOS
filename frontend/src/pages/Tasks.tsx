import React, { useState } from 'react'
import {
  Plus,
  Search,
  ListTodo,
  Columns,
  Calendar as CalendarIcon,
  Clock,
  AlertCircle,
  RefreshCcw,
  Folder,
  Trash2,
  Edit3,
  CheckCircle,
  Circle,
  GripVertical
} from 'lucide-react'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input, Select } from '../components/ui/Input'
import { Dialog } from '../components/ui/Dialog'
import { useToastStore } from '../stores/toastStore'

interface SubTask {
  id: string
  text: string
  done: boolean
}

interface Task {
  id: string
  title: string
  description?: string
  status: 'todo' | 'in_progress' | 'done'
  project: string
  priority: 'low' | 'medium' | 'high'
  deadline?: string // YYYY-MM-DD
  labels: string[]
  recurrence: 'none' | 'daily' | 'weekly'
  subtasks: SubTask[]
}

export const Tasks: React.FC = () => {
  const { addToast } = useToastStore()

  // Seed data
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: 'task-1',
      title: 'Draft landing page design system',
      description: 'Establish typography and color tokens for SoloLife UI.',
      status: 'in_progress',
      project: 'Work',
      priority: 'high',
      deadline: new Date().toISOString().split('T')[0],
      labels: ['Design', 'UI'],
      recurrence: 'none',
      subtasks: [
        { id: 'sub-1-1', text: 'Select color palettes', done: true },
        { id: 'sub-1-2', text: 'Configure typography classes', done: false }
      ]
    },
    {
      id: 'task-2',
      title: 'Weekly grocery shopping',
      description: 'Buy fresh vegetables, milk, and eggs.',
      status: 'todo',
      project: 'Personal',
      priority: 'low',
      deadline: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      labels: ['Chores'],
      recurrence: 'weekly',
      subtasks: []
    },
    {
      id: 'task-3',
      title: 'React 19 Hooks documentation',
      description: 'Review improvements in useActionState and actions.',
      status: 'todo',
      project: 'Study',
      priority: 'medium',
      deadline: new Date(Date.now() + 172800000).toISOString().split('T')[0],
      labels: ['Development'],
      recurrence: 'none',
      subtasks: [
        { id: 'sub-3-1', text: 'Read React 19 blog post', done: true },
        { id: 'sub-3-2', text: 'Write demo code sandbox', done: false }
      ]
    },
    {
      id: 'task-4',
      title: 'Complete fitness workout logs',
      description: 'Track daily running distance and gym logs.',
      status: 'done',
      project: 'Personal',
      priority: 'medium',
      deadline: new Date().toISOString().split('T')[0],
      labels: ['Fitness'],
      recurrence: 'daily',
      subtasks: []
    }
  ])

  React.useEffect(() => {
    try {
      const stored = localStorage.getItem('sololifeos_quick_tasks')
      if (stored) {
        const quickTasks = JSON.parse(stored) as Task[]
        if (quickTasks.length > 0) {
          setTasks(prev => [...quickTasks, ...prev])
          localStorage.removeItem('sololifeos_quick_tasks')
          addToast(`Imported ${quickTasks.length} quick-added tasks!`, 'success')
        }
      }
    } catch {}
  }, [addToast])

  // View settings
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban')
  const [searchQuery, setSearchQuery] = useState('')
  const [projectFilter, setProjectFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)

  // Form Fields
  const [formTitle, setFormTitle] = useState('')
  const [formDesc, setFormDesc] = useState('')
  const [formStatus, setFormStatus] = useState<'todo' | 'in_progress' | 'done'>('todo')
  const [formProject, setFormProject] = useState('Personal')
  const [formPriority, setFormPriority] = useState<'low' | 'medium' | 'high'>('medium')
  const [formDeadline, setFormDeadline] = useState('')
  const [formLabelsStr, setFormLabelsStr] = useState('')
  const [formRecurrence, setFormRecurrence] = useState<'none' | 'daily' | 'weekly'>('none')
  const [formSubtasks, setFormSubtasks] = useState<string[]>([])
  const [newSubtaskText, setNewSubtaskText] = useState('')

  // Unique lists from data
  const projectsList = Array.from(new Set(tasks.map((t) => t.project)))

  // Filters & Search
  const filteredTasks = tasks.filter((t) => {
    const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (t.description && t.description.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesProject = projectFilter === 'all' || t.project === projectFilter
    const matchesPriority = priorityFilter === 'all' || t.priority === priorityFilter
    return matchesSearch && matchesProject && matchesPriority
  })

  // Open Create / Edit Modals
  const openCreateModal = () => {
    setModalMode('create')
    setSelectedTaskId(null)
    setFormTitle('')
    setFormDesc('')
    setFormStatus('todo')
    setFormProject('Personal')
    setFormPriority('medium')
    setFormDeadline(new Date().toISOString().split('T')[0])
    setFormLabelsStr('')
    setFormRecurrence('none')
    setFormSubtasks([])
    setIsModalOpen(true)
  }

  const openEditModal = (task: Task) => {
    setModalMode('edit')
    setSelectedTaskId(task.id)
    setFormTitle(task.title)
    setFormDesc(task.description || '')
    setFormStatus(task.status)
    setFormProject(task.project)
    setFormPriority(task.priority)
    setFormDeadline(task.deadline || '')
    setFormLabelsStr(task.labels.join(', '))
    setFormRecurrence(task.recurrence)
    setFormSubtasks(task.subtasks.map((s) => s.text))
    setIsModalOpen(true)
  }

  // Create or Save Task
  const handleSaveTask = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formTitle.trim()) {
      addToast('Task title is required', 'warning')
      return
    }

    const labels = formLabelsStr
      .split(',')
      .map((l) => l.trim())
      .filter((l) => l.length > 0)

    const subtasksObj: SubTask[] = formSubtasks.map((txt, index) => {
      // Find existing subtask if editing, else generate new
      if (modalMode === 'edit' && selectedTaskId) {
        const existingTask = tasks.find((t) => t.id === selectedTaskId)
        const matchedSub = existingTask?.subtasks[index]
        if (matchedSub && matchedSub.text === txt) {
          return matchedSub
        }
      }
      return { id: `sub-${Math.random()}`, text: txt, done: false }
    })

    if (modalMode === 'create') {
      const newTask: Task = {
        id: `task-${Math.random().toString(36).substr(2, 9)}`,
        title: formTitle,
        description: formDesc,
        status: formStatus,
        project: formProject,
        priority: formPriority,
        deadline: formDeadline || undefined,
        labels,
        recurrence: formRecurrence,
        subtasks: subtasksObj
      }
      setTasks([...tasks, newTask])
      addToast('Task added successfully!', 'success')
    } else if (modalMode === 'edit' && selectedTaskId) {
      setTasks(
        tasks.map((t) =>
          t.id === selectedTaskId
            ? {
                ...t,
                title: formTitle,
                description: formDesc,
                status: formStatus,
                project: formProject,
                priority: formPriority,
                deadline: formDeadline || undefined,
                labels,
                recurrence: formRecurrence,
                subtasks: subtasksObj
              }
            : t
        )
      )
      addToast('Task changes saved!', 'success')
    }
    setIsModalOpen(false)
  }

  const handleDeleteTask = (id: string) => {
    setTasks(tasks.filter((t) => t.id !== id))
    addToast('Task deleted successfully', 'error')
    setIsModalOpen(false)
  }

  const addSubtaskInput = () => {
    if (newSubtaskText.trim()) {
      setFormSubtasks([...formSubtasks, newSubtaskText.trim()])
      setNewSubtaskText('')
    }
  }

  const removeSubtaskInput = (idx: number) => {
    setFormSubtasks(formSubtasks.filter((_, i) => i !== idx))
  }

  // HTML5 Drag and Drop handlers for Kanban Board
  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('taskId', id)
  }

  const handleDrop = (e: React.DragEvent, targetStatus: Task['status']) => {
    e.preventDefault()
    const id = e.dataTransfer.getData('taskId')
    if (id) {
      setTasks(
        tasks.map((t) => (t.id === id ? { ...t, status: targetStatus } : t))
      )
      const targetTask = tasks.find((t) => t.id === id)
      if (targetTask) {
        addToast(`Moved "${targetTask.title}" to ${targetStatus.replace('_', ' ')}`, 'success')
      }
    }
  }

  // Priority styling classes
  const priorityStyles = {
    low: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    medium: 'bg-amber-50 text-amber-700 border-amber-200',
    high: 'bg-rose-50 text-rose-700 border-rose-200'
  }

  // Render Kanban Column component helper
  const renderKanbanColumn = (status: Task['status'], label: string, color: string) => {
    const colTasks = filteredTasks.filter((t) => t.status === status)
    return (
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => handleDrop(e, status)}
        className="flex-1 bg-slate-50/60 backdrop-blur-md border border-slate-100 p-4 rounded-3xl min-h-[500px] flex flex-col gap-4"
      >
        <div className="flex justify-between items-center border-b border-slate-200/50 pb-2">
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${color}`} />
            <h3 className="font-bold text-slate-800 text-sm">{label}</h3>
          </div>
          <span className="text-[10px] font-extrabold bg-slate-200/60 px-2 py-0.5 rounded-sm text-slate-500">
            {colTasks.length}
          </span>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto max-h-[600px] scrollbar-thin">
          {colTasks.length === 0 ? (
            <p className="text-xs text-slate-400 italic py-12 text-center">Drop tasks here</p>
          ) : (
            colTasks.map((t) => {
              const completedSubs = t.subtasks.filter((s) => s.done).length
              const totalSubs = t.subtasks.length

              return (
                <Card
                  key={t.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, t.id)}
                  onClick={() => openEditModal(t)}
                  variant={t.priority === 'high' ? 'glass-pink' : 'white'}
                  className="p-4 cursor-grab active:cursor-grabbing border border-slate-200/50 hover:shadow-xs transition-all relative group"
                >
                  <div className="space-y-3">
                    <div className="flex justify-between items-start gap-2">
                      <h4 className="font-bold text-slate-800 text-xs leading-relaxed group-hover:text-sky-600 transition-colors">
                        {t.title}
                      </h4>
                      <GripVertical size={14} className="text-slate-300 shrink-0 cursor-grab" />
                    </div>

                    {t.description && (
                      <p className="text-[10px] text-slate-500 line-clamp-2 leading-relaxed">{t.description}</p>
                    )}

                    {/* Subtasks Progress */}
                    {totalSubs > 0 && (
                      <div className="space-y-1.5 pt-1">
                        <div className="flex justify-between text-[9px] text-slate-400 font-bold">
                          <span>Subtasks checklist</span>
                          <span>{completedSubs}/{totalSubs}</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-1">
                          <div
                            className="bg-sky-400 h-1 rounded-full"
                            style={{ width: `${(completedSubs / totalSubs) * 100}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Metadata badges */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-2 text-[8px] font-extrabold uppercase tracking-wide">
                      <span className={`px-2 py-0.5 rounded-sm border ${priorityStyles[t.priority]}`}>
                        {t.priority}
                      </span>
                      {t.deadline && (
                        <span className="flex items-center gap-1 bg-slate-100 border border-slate-200 text-slate-500 px-2 py-0.5 rounded-sm">
                          <Clock size={8} /> {t.deadline}
                        </span>
                      )}
                      <span className="bg-sky-50 border border-sky-100 text-sky-600 px-2 py-0.5 rounded-sm">
                        {t.project}
                      </span>
                    </div>
                  </div>
                </Card>
              )
            })
          )}
        </div>
      </div>
    )
  }

  // Render Task List item helper
  const renderListView = () => {
    return (
      <Card variant="white" className="space-y-4">
        <div className="divide-y divide-slate-100">
          {filteredTasks.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-12">No tasks matches your filter criteria.</p>
          ) : (
            filteredTasks.map((t) => {
              const completedSubs = t.subtasks.filter((s) => s.done).length
              const totalSubs = t.subtasks.length

              return (
                <div
                  key={t.id}
                  onClick={() => openEditModal(t)}
                  className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 cursor-pointer hover:bg-slate-50/20 px-2 rounded-xl transition-colors"
                >
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setTasks(
                          tasks.map((task) =>
                            task.id === t.id
                              ? { ...task, status: task.status === 'done' ? 'todo' : 'done' }
                              : task
                          )
                        )
                        addToast('Status updated', 'success')
                      }}
                      className="mt-1 cursor-pointer shrink-0"
                    >
                      {t.status === 'done' ? (
                        <CheckCircle size={18} className="text-emerald-500" />
                      ) : (
                        <Circle size={18} className="text-slate-300 hover:text-sky-500" />
                      )}
                    </button>

                    <div className="space-y-1 min-w-0">
                      <h4 className={`font-bold text-sm text-slate-800 truncate ${t.status === 'done' ? 'line-through text-slate-400' : ''}`}>
                        {t.title}
                      </h4>
                      {t.description && <p className="text-xs text-slate-500 truncate">{t.description}</p>}
                      <div className="flex flex-wrap items-center gap-2 text-[9px] font-semibold text-slate-400 pt-1">
                        <span className={`px-2 py-0.5 rounded-sm border uppercase font-extrabold ${priorityStyles[t.priority]}`}>
                          {t.priority}
                        </span>
                        <span className="bg-slate-100 text-slate-500 px-2 py-0.5 rounded-sm capitalize">{t.project}</span>
                        {t.deadline && (
                          <span className="flex items-center gap-1 bg-slate-100 text-slate-500 px-2 py-0.5 rounded-sm">
                            <CalendarIcon size={10} /> {t.deadline}
                          </span>
                        )}
                        {totalSubs > 0 && (
                          <span className="bg-sky-50 text-sky-600 px-2 py-0.5 rounded-sm font-bold">
                            Subtasks: {completedSubs}/{totalSubs}
                          </span>
                        )}
                        {t.recurrence !== 'none' && (
                          <span className="flex items-center gap-1 bg-purple-50 text-purple-600 px-2 py-0.5 rounded-sm">
                            <RefreshCcw size={8} /> {t.recurrence}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); openEditModal(t) }}>
                      <Edit3 size={12} className="text-slate-500" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleDeleteTask(t.id) }}>
                      <Trash2 size={12} className="text-rose-500" />
                    </Button>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      {/* Top Filter and Search Action Control */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/60 backdrop-blur-md p-4 rounded-3xl border border-slate-100">
        <div className="flex items-center gap-3">
          <ListTodo className="text-sky-500 w-8 h-8 shrink-0" />
          <div>
            <h1 className="text-xl font-extrabold text-slate-800 leading-tight">Task Manager 📋</h1>
            <p className="text-[10px] text-slate-500 font-semibold">Organize project sprint backlogs, check checklists, and manage priorities.</p>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="flex flex-wrap gap-3 flex-1 max-w-2xl md:justify-end">
          <div className="relative flex-1 min-w-[150px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50/50 border border-slate-200/50 rounded-2xl text-xs focus:outline-hidden focus:ring-2 focus:ring-sky-300 focus:border-sky-300 transition-all text-slate-800"
            />
          </div>

          <div className="relative">
            <select
              value={projectFilter}
              onChange={(e) => setProjectFilter(e.target.value)}
              className="w-full pl-3 pr-8 py-2 bg-slate-50/50 border border-slate-200/50 rounded-2xl text-xs focus:outline-hidden focus:ring-2 focus:ring-sky-300 focus:border-sky-300 transition-all text-slate-800 appearance-none cursor-pointer"
            >
              <option value="all">All Projects</option>
              {projectsList.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
            <Folder className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 w-3 h-3 pointer-events-none" />
          </div>

          <div className="relative">
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full pl-3 pr-8 py-2 bg-slate-50/50 border border-slate-200/50 rounded-2xl text-xs focus:outline-hidden focus:ring-2 focus:ring-sky-300 focus:border-sky-300 transition-all text-slate-800 appearance-none cursor-pointer"
            >
              <option value="all">All Priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
            <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 w-3 h-3 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* View Switchers */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        {/* Toggle Toggles */}
        <div className="flex bg-slate-100 p-1 rounded-2xl w-full sm:w-auto">
          <button
            onClick={() => setViewMode('kanban')}
            className={`flex-1 sm:flex-none px-4 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              viewMode === 'kanban' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Columns size={12} />
            <span>Kanban Board</span>
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`flex-1 sm:flex-none px-4 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              viewMode === 'list' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <ListTodo size={12} />
            <span>List Agenda</span>
          </button>
        </div>

        <Button onClick={openCreateModal} className="w-full sm:w-auto">
          <Plus size={14} className="mr-1" /> Create Task
        </Button>
      </div>

      {/* Main Container Views */}
      <div className="transition-all duration-300">
        {viewMode === 'kanban' ? (
          <div className="flex flex-col md:flex-row gap-6">
            {renderKanbanColumn('todo', 'To Do', 'bg-indigo-400')}
            {renderKanbanColumn('in_progress', 'In Progress', 'bg-sky-400')}
            {renderKanbanColumn('done', 'Completed', 'bg-emerald-400')}
          </div>
        ) : (
          renderListView()
        )}
      </div>

      {/* Task Creation & Details Modal */}
      <Dialog
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalMode === 'create' ? 'Create Custom Task 📝' : 'Edit Task Configuration ✏y'}
        footer={
          <div className="flex justify-between w-full">
            {modalMode === 'edit' ? (
              <Button
                variant="danger"
                onClick={() => selectedTaskId && handleDeleteTask(selectedTaskId)}
              >
                Delete Task
              </Button>
            ) : (
              <div />
            )}
            <div className="flex gap-2">
              <Button variant="ghost" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveTask} variant="primary">
                {modalMode === 'create' ? 'Create Task' : 'Save Changes'}
              </Button>
            </div>
          </div>
        }
      >
        <form onSubmit={handleSaveTask} className="space-y-4">
          <Input
            label="Task Title"
            placeholder="Write report, run tests, buy grocery..."
            value={formTitle}
            onChange={(e) => setFormTitle(e.target.value)}
          />

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Description (Optional)</label>
            <textarea
              placeholder="Add task specifications and logs..."
              value={formDesc}
              onChange={(e) => setFormDesc(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm focus:outline-hidden focus:ring-2 focus:ring-sky-300 focus:border-sky-300 transition-all text-slate-800 h-20 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Project Group"
              value={formProject}
              onChange={(e) => setFormProject(e.target.value)}
              options={[
                { value: 'Personal', label: 'Personal Chores' },
                { value: 'Work', label: 'Work Deliverables' },
                { value: 'Study', label: 'Study & Academics' },
                { value: 'Fitness', label: 'Fitness & Health' }
              ]}
            />

            <Select
              label="Priority Level"
              value={formPriority}
              onChange={(e) => setFormPriority(e.target.value as any)}
              options={[
                { value: 'low', label: 'Low' },
                { value: 'medium', label: 'Medium' },
                { value: 'high', label: 'High' }
              ]}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Deadline Date"
              type="date"
              value={formDeadline}
              onChange={(e) => setFormDeadline(e.target.value)}
            />

            <Select
              label="Recurrence Cycle"
              value={formRecurrence}
              onChange={(e) => setFormRecurrence(e.target.value as any)}
              options={[
                { value: 'none', label: 'No Recurrence' },
                { value: 'daily', label: 'Daily Cycle' },
                { value: 'weekly', label: 'Weekly Cycle' }
              ]}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Labels / Tags (Comma separated)"
              placeholder="Design, Dev, Chores"
              value={formLabelsStr}
              onChange={(e) => setFormLabelsStr(e.target.value)}
            />

            <Select
              label="Initial Status"
              value={formStatus}
              onChange={(e) => setFormStatus(e.target.value as any)}
              options={[
                { value: 'todo', label: 'To Do' },
                { value: 'in_progress', label: 'In Progress' },
                { value: 'done', label: 'Completed' }
              ]}
            />
          </div>

          {/* Subtask Manager */}
          <div className="space-y-2 border-t border-slate-100 pt-3">
            <label className="block text-xs font-semibold text-slate-500">Subtask Checklists</label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add subtask text..."
                value={newSubtaskText}
                onChange={(e) => setNewSubtaskText(e.target.value)}
                className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-sky-300 focus:border-sky-300 transition-all text-slate-800"
              />
              <Button type="button" onClick={addSubtaskInput} size="sm">
                Add Item
              </Button>
            </div>

            <div className="space-y-2 max-h-24 overflow-y-auto scrollbar-thin pt-1">
              {formSubtasks.map((txt, idx) => (
                <div key={idx} className="flex justify-between items-center text-xs bg-slate-50 p-2 rounded-lg border border-slate-100">
                  <span className="truncate">{txt}</span>
                  <button
                    type="button"
                    onClick={() => removeSubtaskInput(idx)}
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
