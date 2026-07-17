import React, { useState } from 'react'
import {
  Check,
  Plus,
  Edit2,
  Trash2,
  Award,
  Sparkles,
  AlertCircle,
  Clock,
  Calendar,
  CheckSquare
} from 'lucide-react'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input, Select } from '../components/ui/Input'
import { Dialog } from '../components/ui/Dialog'
import { useToastStore } from '../stores/toastStore'

interface Habit {
  id: string
  name: string
  category: 'health' | 'mind' | 'work' | 'fitness' | 'social'
  frequency: 'daily' | 'weekly'
  streak: number
  bestStreak: number
  reminderTime: string // HH:MM or "none"
  completions: string[] // Array of YYYY-MM-DD strings representing completed dates
  missedYesterday: boolean // Flag to trigger recovery action
}

export const Habits: React.FC = () => {
  const { addToast } = useToastStore()

  // Generate date strings for last 28 days for heatmaps
  const getLast28Days = () => {
    const dates = []
    for (let i = 27; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      dates.push(d.toISOString().split('T')[0])
    }
    return dates
  }

  const dateHistoryList = getLast28Days()
  const todayStr = new Date().toISOString().split('T')[0]
  
  const getYesterdayStr = () => {
    const d = new Date()
    d.setDate(d.getDate() - 1)
    return d.toISOString().split('T')[0]
  }
  const yesterdayStr = getYesterdayStr()

  // Seed data
  const [habits, setHabits] = useState<Habit[]>([
    {
      id: 'h-1',
      name: 'Morning Meditation (10m)',
      category: 'mind',
      frequency: 'daily',
      streak: 8,
      bestStreak: 15,
      reminderTime: '08:00',
      completions: [
        todayStr,
        yesterdayStr,
        dateHistoryList[20],
        dateHistoryList[21],
        dateHistoryList[22],
        dateHistoryList[23],
        dateHistoryList[24],
        dateHistoryList[25]
      ],
      missedYesterday: false
    },
    {
      id: 'h-2',
      name: 'Drink 3L of Water',
      category: 'health',
      frequency: 'daily',
      streak: 0,
      bestStreak: 30,
      reminderTime: '12:00',
      completions: [
        dateHistoryList[20],
        dateHistoryList[21],
        dateHistoryList[22],
        dateHistoryList[23],
        dateHistoryList[24]
      ],
      missedYesterday: true // Triggers recovery button!
    },
    {
      id: 'h-3',
      name: 'Weekly Gym Strength Workout',
      category: 'fitness',
      frequency: 'weekly',
      streak: 3,
      bestStreak: 6,
      reminderTime: '18:00',
      completions: [
        dateHistoryList[15],
        dateHistoryList[22]
      ],
      missedYesterday: false
    }
  ])

  React.useEffect(() => {
    try {
      const stored = localStorage.getItem('sololifeos_quick_habits')
      if (stored) {
        const quickHabits = JSON.parse(stored) as Habit[]
        if (quickHabits.length > 0) {
          setHabits(prev => [...quickHabits, ...prev])
          localStorage.removeItem('sololifeos_quick_habits')
          addToast(`Imported ${quickHabits.length} quick-added habits!`, 'success')
        }
      }
    } catch {}
  }, [addToast])

  // View States
  const [activeTab, setActiveTab] = useState<'daily' | 'weekly'>('daily')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')
  const [selectedHabitId, setSelectedHabitId] = useState<string | null>(null)

  // Form Fields
  const [formName, setFormName] = useState('')
  const [formCategory, setFormCategory] = useState<Habit['category']>('health')
  const [formFrequency, setFormFrequency] = useState<'daily' | 'weekly'>('daily')
  const [formReminder, setFormReminder] = useState('08:00')

  // Computations
  const filteredHabits = habits.filter((h) => h.frequency === activeTab)

  const totalCompletions = habits.reduce((acc, h) => acc + h.completions.length, 0)
  const activeStreaksMax = habits.reduce((max, h) => (h.streak > max ? h.streak : max), 0)
  const totalRecoveryAvailable = habits.filter((h) => h.missedYesterday).length

  // Calculate consistency rate (completions in last 28 days / total possible completions)
  const getConsistencyRate = () => {
    if (habits.length === 0) return 0
    const totalPossible = habits.length * 28
    const totalDone = habits.reduce((acc, h) => {
      const doneInPeriod = h.completions.filter((c) => dateHistoryList.includes(c)).length
      return acc + doneInPeriod
    }, 0)
    return Math.round((totalDone / totalPossible) * 100)
  }

  // Open Create / Edit Modals
  const openCreateModal = () => {
    setModalMode('create')
    setSelectedHabitId(null)
    setFormName('')
    setFormCategory('health')
    setFormFrequency('daily')
    setFormReminder('08:00')
    setIsModalOpen(true)
  }

  const openEditModal = (h: Habit) => {
    setModalMode('edit')
    setSelectedHabitId(h.id)
    setFormName(h.name)
    setFormCategory(h.category)
    setFormFrequency(h.frequency)
    setFormReminder(h.reminderTime)
    setIsModalOpen(true)
  }

  // Handlers
  const handleSaveHabit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formName.trim()) {
      addToast('Habit name is required', 'warning')
      return
    }

    if (modalMode === 'create') {
      const newHabit: Habit = {
        id: `h-${Math.random().toString(36).substr(2, 9)}`,
        name: formName,
        category: formCategory,
        frequency: formFrequency,
        streak: 0,
        bestStreak: 0,
        reminderTime: formReminder,
        completions: [],
        missedYesterday: false
      }
      setHabits([...habits, newHabit])
      addToast('Habit set up successfully!', 'success')
      if (formReminder !== 'none') {
        setTimeout(() => {
          addToast(`[HABIT REMINDER]: Time to complete: "${formName}"`, 'info')
        }, 3000)
      }
    } else if (modalMode === 'edit' && selectedHabitId) {
      setHabits(
        habits.map((h) =>
          h.id === selectedHabitId
            ? {
                ...h,
                name: formName,
                category: formCategory,
                frequency: formFrequency,
                reminderTime: formReminder
              }
            : h
        )
      )
      addToast('Habit settings saved!', 'success')
    }
    setIsModalOpen(false)
  }

  const handleDeleteHabit = (id: string) => {
    setHabits(habits.filter((h) => h.id !== id))
    addToast('Habit deleted', 'error')
    setIsModalOpen(false)
  }

  const toggleHabitCompletion = (id: string) => {
    setHabits(
      habits.map((h) => {
        if (h.id === id) {
          const isCompletedToday = h.completions.includes(todayStr)
          let updatedCompletions = [...h.completions]
          let newStreak = h.streak
          let newBest = h.bestStreak

          if (isCompletedToday) {
            // Remove completion
            updatedCompletions = updatedCompletions.filter((c) => c !== todayStr)
            newStreak = Math.max(0, newStreak - 1)
          } else {
            // Add completion
            updatedCompletions.push(todayStr)
            newStreak = newStreak + 1
            if (newStreak > newBest) {
              newBest = newStreak
            }
            addToast(`Streak incremented: ${newStreak} days! 🔥`, 'success')
          }

          return {
            ...h,
            completions: updatedCompletions,
            streak: newStreak,
            bestStreak: newBest,
            missedYesterday: isCompletedToday ? h.missedYesterday : false // Remove missed flag if done
          }
        }
        return h
      })
    )
  }

  // Missed Habit Recovery
  const recoverHabit = (id: string) => {
    setHabits(
      habits.map((h) => {
        if (h.id === id) {
          const updatedCompletions = [...h.completions, yesterdayStr]
          // Restore streak: since it was missed, streak was 0.
          // Let's set it to 1, or restore original if we want (let's assume they recover to streak 1 or increment)
          const newStreak = 1 // Start streak again
          addToast(`Yesterday's "${h.name}" completed! Streak recovered. 🩹`, 'success')
          return {
            ...h,
            completions: updatedCompletions,
            streak: newStreak,
            missedYesterday: false
          }
        }
        return h
      })
    )
  }

  // Category tags style
  const categoryStyles = {
    health: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    mind: 'bg-indigo-50 text-indigo-700 border-indigo-100',
    work: 'bg-purple-50 text-purple-700 border-purple-100',
    fitness: 'bg-sky-50 text-sky-700 border-sky-100',
    social: 'bg-pink-50 text-pink-700 border-pink-100'
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
            Habit Tracker ⏰
          </h1>
          <p className="text-slate-500 mt-1">Build daily consistency and view progress streaks.</p>
        </div>
        <Button onClick={openCreateModal}>
          <Plus size={14} className="mr-1" /> Create Habit
        </Button>
      </div>

      {/* Analytics Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Longest Active Streak', value: `${activeStreaksMax} days`, icon: <Award className="text-pink-500" size={16} /> },
          { label: 'Total Completions', value: totalCompletions, icon: <CheckSquare className="text-indigo-500" size={16} /> },
          { label: 'Monthly Consistency', value: `${getConsistencyRate()}%`, icon: <Sparkles className="text-sky-500" size={16} /> },
          { label: 'Missed Recoveries', value: totalRecoveryAvailable, icon: <AlertCircle className="text-rose-500" size={16} /> }
        ].map((stat, idx) => (
          <Card key={idx} variant="white" className="flex items-center gap-4 p-4 border border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center shrink-0">
              {stat.icon}
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{stat.label}</p>
              <h3 className="text-lg font-black text-slate-800 mt-0.5">{stat.value}</h3>
            </div>
          </Card>
        ))}
      </div>

      {/* Tabs Switcher */}
      <div className="flex bg-slate-100 p-1 rounded-2xl max-w-xs">
        <button
          onClick={() => setActiveTab('daily')}
          className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'daily' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          Daily Habits
        </button>
        <button
          onClick={() => setActiveTab('weekly')}
          className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'weekly' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          Weekly Habits
        </button>
      </div>

      {/* Grid List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredHabits.map((habit) => {
          const isDoneToday = habit.completions.includes(todayStr)

          return (
            <Card key={habit.id} variant="white" className="flex flex-col justify-between border border-slate-200/50 hover:shadow-xs transition-shadow">
              <div className="space-y-4">
                {/* Header */}
                <div className="flex justify-between items-start gap-4">
                  <div className="space-y-1">
                    <span className={`px-2 py-0.5 rounded-sm text-[8px] font-extrabold uppercase border ${categoryStyles[habit.category]}`}>
                      {habit.category}
                    </span>
                    <h3 className="font-extrabold text-slate-800 text-sm tracking-tight mt-1 leading-snug">
                      {habit.name}
                    </h3>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button
                      onClick={() => openEditModal(habit)}
                      className="p-1 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                    >
                      <Edit2 size={12} />
                    </button>
                    <button
                      onClick={() => handleDeleteHabit(habit.id)}
                      className="p-1 text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>

                {/* Streaks Counter Row */}
                <div className="flex justify-between items-center bg-slate-50/50 border border-slate-100 p-2.5 rounded-xl text-xs">
                  <div className="flex items-center gap-1.5 font-semibold text-slate-600">
                    <span>Current:</span>
                    <span className="text-slate-800 font-extrabold text-sm">{habit.streak}d 🔥</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-semibold text-slate-500">
                    <span>Best:</span>
                    <span className="text-slate-700 font-bold">{habit.bestStreak}d</span>
                  </div>
                </div>

                {/* Heatmap Grid (Last 28 Days) */}
                <div className="space-y-1.5">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1">
                    <Calendar size={10} /> 28-Day Consistency Map
                  </span>
                  <div className="grid grid-cols-7 gap-1">
                    {dateHistoryList.map((date) => {
                      const done = habit.completions.includes(date)
                      const cellToday = date === todayStr
                      return (
                        <div
                          key={date}
                          className={`aspect-square rounded-xs border transition-all ${
                            done
                              ? 'bg-emerald-400 border-emerald-500 shadow-xs'
                              : cellToday
                              ? 'bg-white border-sky-400'
                              : 'bg-slate-100 border-slate-200/50'
                          }`}
                          title={`${date}: ${done ? 'Completed' : 'Missed'}`}
                        />
                      )
                    })}
                  </div>
                </div>

                {/* Missed Recovery trigger */}
                {habit.missedYesterday && (
                  <div className="bg-rose-50/30 border border-rose-100 p-3 rounded-2xl flex justify-between items-center gap-2">
                    <div className="flex items-center gap-1.5 text-xs text-rose-800 font-bold">
                      <AlertCircle size={14} className="text-rose-600 shrink-0" />
                      <span>Missed yesterday</span>
                    </div>
                    <Button onClick={() => recoverHabit(habit.id)} size="sm" variant="secondary" className="text-[10px] py-1">
                      Recover Streak
                    </Button>
                  </div>
                )}
              </div>

              {/* Bottom Action Section */}
              <div className="flex items-center justify-between border-t border-slate-50 pt-3 mt-4 gap-3">
                {habit.reminderTime !== 'none' ? (
                  <div className="flex items-center gap-1 text-[10px] text-slate-400 font-bold">
                    <Clock size={11} />
                    <span>Alert: {habit.reminderTime}</span>
                  </div>
                ) : (
                  <div />
                )}

                <Button
                  onClick={() => toggleHabitCompletion(habit.id)}
                  variant={isDoneToday ? 'secondary' : 'primary'}
                  size="sm"
                  className="px-4 font-bold flex items-center gap-1.5"
                >
                  {isDoneToday ? (
                    <>
                      <Check size={14} />
                      <span>Done today</span>
                    </>
                  ) : (
                    <span>Check-In</span>
                  )}
                </Button>
              </div>
            </Card>
          )
        })}
      </div>

      {/* Habit Details Dialog Modal */}
      <Dialog
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalMode === 'create' ? 'Create Habit Trigger ⏰' : 'Edit Habit Preferences ✏️'}
        footer={
          <div className="flex justify-between w-full">
            {modalMode === 'edit' ? (
              <Button
                variant="danger"
                onClick={() => selectedHabitId && handleDeleteHabit(selectedHabitId)}
              >
                Delete Habit
              </Button>
            ) : (
              <div />
            )}
            <div className="flex gap-2">
              <Button variant="ghost" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveHabit} variant="primary">
                {modalMode === 'create' ? 'Create Habit' : 'Save Changes'}
              </Button>
            </div>
          </div>
        }
      >
        <form onSubmit={handleSaveHabit} className="space-y-4">
          <Input
            label="Habit Name"
            placeholder="Exercise, read, meditate..."
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
          />

          <div className="grid grid-cols-3 gap-4">
            <Select
              label="Category"
              value={formCategory}
              onChange={(e) => setFormCategory(e.target.value as any)}
              options={[
                { value: 'health', label: 'Health' },
                { value: 'mind', label: 'Mind' },
                { value: 'work', label: 'Work' },
                { value: 'fitness', label: 'Fitness' },
                { value: 'social', label: 'Social' }
              ]}
            />

            <Select
              label="Frequency"
              value={formFrequency}
              onChange={(e) => setFormFrequency(e.target.value as any)}
              options={[
                { value: 'daily', label: 'Daily' },
                { value: 'weekly', label: 'Weekly' }
              ]}
            />

            <Select
              label="Reminder Time"
              value={formReminder}
              onChange={(e) => setFormReminder(e.target.value)}
              options={[
                { value: 'none', label: 'No Alerts' },
                { value: '07:00', label: '07:00 AM' },
                { value: '08:00', label: '08:00 AM' },
                { value: '12:00', label: '12:00 PM' },
                { value: '18:00', label: '06:00 PM' },
                { value: '21:00', label: '09:00 PM' }
              ]}
            />
          </div>
        </form>
      </Dialog>
    </div>
  )
}
