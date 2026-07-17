import React, { useState, useEffect } from 'react'
import {
  Calendar,
  CheckSquare,
  Target,
  TrendingUp,
  BookOpen,
  GraduationCap,
  BarChart2,
  Smile,
  Clock,
  BrainCircuit,
  GripVertical,
  RotateCcw
} from 'lucide-react'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { useToastStore } from '../stores/toastStore'
import { BarChart, LineChart } from '../components/ui/Chart'

interface Widget {
  id: string
  title: string
  icon: React.ReactNode
  size: 'full' | 'half' | 'third'
  theme: 'white' | 'blue' | 'pink' | 'lavender'
}

export const Dashboard: React.FC = () => {
  const { addToast } = useToastStore()

  // Persistent Widget Order State
  const defaultOrder = [
    'overview',
    'ai',
    'tasks',
    'habits',
    'calendar',
    'goals',
    'finance',
    'reading',
    'study',
    'mood',
    'focus'
  ]

  const [widgetOrder, setWidgetOrder] = useState<string[]>(() => {
    const saved = localStorage.getItem('dashboard_widget_order')
    return saved ? JSON.parse(saved) : defaultOrder
  })

  // State values for widget interactivity
  const [tasks, setTasks] = useState([
    { id: 1, text: 'Revise chemistry notes', done: false },
    { id: 2, text: 'Run 5km & drink water', done: true },
    { id: 3, text: 'Review finance budget', done: false }
  ])

  const [habits, setHabits] = useState([
    { id: 1, name: 'Read 20 pages', streak: 12, done: false },
    { id: 2, name: 'Meditation', streak: 5, done: true },
    { id: 3, name: 'No Sugar', streak: 8, done: false }
  ])

  const [mood, setMood] = useState<string | null>(null)
  const [focusTime, setFocusTime] = useState(45) // Mock cumulative minutes
  const [isFocusing, setIsFocusing] = useState(false)
  const [focusRemaining, setFocusRemaining] = useState(1500) // 25 mins in seconds

  // Handle Focus Timer tick
  useEffect(() => {
    let interval: any = null
    if (isFocusing && focusRemaining > 0) {
      interval = setInterval(() => {
        setFocusRemaining((prev) => prev - 1)
      }, 1000)
    } else if (focusRemaining === 0) {
      setIsFocusing(false)
      setFocusRemaining(1500)
      setFocusTime((prev) => prev + 25)
      addToast('Focus session completed! Great job.', 'success')
    }
    return () => clearInterval(interval)
  }, [isFocusing, focusRemaining, addToast])

  const toggleFocus = () => {
    setIsFocusing(!isFocusing)
    addToast(isFocusing ? 'Focus timer paused' : 'Focus session started!', 'info')
  }

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60)
    const s = secs % 60
    return `${m}:${s < 10 ? '0' : ''}${s}`
  }

  // Persist order on change
  const saveOrder = (newOrder: string[]) => {
    setWidgetOrder(newOrder)
    localStorage.setItem('dashboard_widget_order', JSON.stringify(newOrder))
  }

  const resetLayout = () => {
    saveOrder(defaultOrder)
    addToast('Dashboard layout reset to default!', 'info')
  }

  // Drag and Drop Handlers
  const [draggedWidgetId, setDraggedWidgetId] = useState<string | null>(null)

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedWidgetId(id)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault()
    if (!draggedWidgetId || draggedWidgetId === targetId) return

    const draggedIndex = widgetOrder.indexOf(draggedWidgetId)
    const targetIndex = widgetOrder.indexOf(targetId)

    const updatedOrder = [...widgetOrder]
    updatedOrder.splice(draggedIndex, 1)
    updatedOrder.splice(targetIndex, 0, draggedWidgetId)

    saveOrder(updatedOrder)
    setDraggedWidgetId(null)
  }

  // Interactive callbacks
  const toggleTask = (id: number) => {
    setTasks(
      tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t))
    )
    addToast('Task status updated', 'success')
  }

  const toggleHabit = (id: number) => {
    setHabits(
      habits.map((h) => {
        if (h.id === id) {
          const newDone = !h.done
          return {
            ...h,
            done: newDone,
            streak: newDone ? h.streak + 1 : Math.max(0, h.streak - 1)
          }
        }
        return h
      })
    )
    addToast('Habit streak updated', 'success')
  }

  const selectMood = (selectedMood: string) => {
    setMood(selectedMood)
    addToast(`Mood recorded: ${selectedMood}`, 'success')
  }

  // Widget Metadata
  const widgetsData: Record<string, Widget> = {
    overview: {
      id: 'overview',
      title: 'Daily Overview',
      icon: <BarChart2 size={18} className="text-sky-500" />,
      size: 'full',
      theme: 'white'
    },
    ai: {
      id: 'ai',
      title: 'AI Recommendations',
      icon: <BrainCircuit size={18} className="text-purple-500" />,
      size: 'full',
      theme: 'lavender'
    },
    tasks: {
      id: 'tasks',
      title: "Today's Tasks",
      icon: <CheckSquare size={18} className="text-pink-500" />,
      size: 'third',
      theme: 'pink'
    },
    habits: {
      id: 'habits',
      title: 'Habit Progress',
      icon: <CheckSquare size={18} className="text-sky-500" />,
      size: 'third',
      theme: 'blue'
    },
    calendar: {
      id: 'calendar',
      title: 'Calendar Summary',
      icon: <Calendar size={18} className="text-purple-500" />,
      size: 'third',
      theme: 'white'
    },
    goals: {
      id: 'goals',
      title: 'Goals',
      icon: <Target size={18} className="text-pink-500" />,
      size: 'half',
      theme: 'pink'
    },
    finance: {
      id: 'finance',
      title: 'Finance Summary',
      icon: <TrendingUp size={18} className="text-sky-500" />,
      size: 'half',
      theme: 'blue'
    },
    reading: {
      id: 'reading',
      title: 'Reading Progress',
      icon: <BookOpen size={18} className="text-slate-600" />,
      size: 'third',
      theme: 'white'
    },
    study: {
      id: 'study',
      title: 'Study Statistics',
      icon: <GraduationCap size={18} className="text-purple-500" />,
      size: 'third',
      theme: 'white'
    },
    mood: {
      id: 'mood',
      title: 'Mood Tracker',
      icon: <Smile size={18} className="text-pink-500" />,
      size: 'third',
      theme: 'pink'
    },
    focus: {
      id: 'focus',
      title: 'Focus Time',
      icon: <Clock size={18} className="text-sky-500" />,
      size: 'third',
      theme: 'blue'
    }
  }

  // Render Widget Contents dynamically
  const renderWidgetContent = (id: string) => {
    switch (id) {
      case 'overview':
        return (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-2">
            {[
              { label: 'Tasks Left', value: tasks.filter((t) => !t.done).length, desc: 'due today' },
              { label: 'Habits Done', value: habits.filter((h) => h.done).length, desc: 'out of 3' },
              { label: 'Focus Score', value: '88%', desc: 'Productive' },
              { label: 'Spent Today', value: '$24.50', desc: 'Under budget' }
            ].map((stat, i) => (
              <div key={i} className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100 flex flex-col justify-between">
                <span className="text-xs text-slate-500 font-semibold">{stat.label}</span>
                <span className="text-2xl font-extrabold text-slate-800 my-1">{stat.value}</span>
                <span className="text-[10px] text-slate-400 font-medium">{stat.desc}</span>
              </div>
            ))}
          </div>
        )
      case 'ai':
        return (
          <p className="text-sm text-slate-600 leading-relaxed mt-1">
            "Based on your recent study statistics and reading habits, mornings are your highest productivity window. We recommend scheduling 45 mins of Pomodoro focus time before 10 AM. Log your dinner expenses later to stay within budget."
          </p>
        )
      case 'tasks':
        return (
          <div className="space-y-3.5 mt-2">
            {tasks.map((task) => (
              <label key={task.id} className="flex items-center gap-3 text-xs text-slate-700 font-medium cursor-pointer">
                <input
                  type="checkbox"
                  checked={task.done}
                  onChange={() => toggleTask(task.id)}
                  className="rounded-sm border-pink-300 text-pink-500 focus:ring-pink-500"
                />
                <span className={task.done ? 'line-through text-slate-400' : 'text-slate-700'}>
                  {task.text}
                </span>
              </label>
            ))}
          </div>
        )
      case 'habits':
        return (
          <div className="space-y-3.5 mt-2">
            {habits.map((habit) => (
              <div key={habit.id} className="flex justify-between items-center text-xs">
                <label className="flex items-center gap-3 text-slate-700 font-medium cursor-pointer">
                  <input
                    type="checkbox"
                    checked={habit.done}
                    onChange={() => toggleHabit(habit.id)}
                    className="rounded-sm border-sky-300 text-sky-500 focus:ring-sky-500"
                  />
                  <span className={habit.done ? 'line-through text-slate-400' : 'text-slate-700'}>
                    {habit.name}
                  </span>
                </label>
                <span className="text-[10px] px-2 py-0.5 bg-sky-50 text-sky-700 rounded-sm font-bold">
                  {habit.streak}d 🔥
                </span>
              </div>
            ))}
          </div>
        )
      case 'calendar':
        return (
          <div className="space-y-3 mt-2">
            {[
              { time: '11:00 AM', title: 'React Study Session' },
              { time: '03:30 PM', title: 'Cardio Workout' },
              { time: '06:00 PM', title: 'Dinner with Team' }
            ].map((event, idx) => (
              <div key={idx} className="flex items-start gap-3 text-xs border-l-2 border-purple-300 pl-3">
                <div>
                  <p className="font-bold text-slate-800">{event.title}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{event.time}</p>
                </div>
              </div>
            ))}
          </div>
        )
      case 'goals':
        return (
          <div className="space-y-4 mt-2">
            {[
              { title: 'Complete SoloLife Scaffolding', percent: 90, color: 'bg-emerald-400' },
              { title: 'Read Atomic Habits', percent: 65, color: 'bg-sky-400' },
              { title: 'Save $1,500', percent: 45, color: 'bg-pink-400' }
            ].map((g, idx) => (
              <div key={idx} className="space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-600 font-medium">
                  <span>{g.title}</span>
                  <span className="font-bold">{g.percent}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div className={`h-2 rounded-full ${g.color}`} style={{ width: `${g.percent}%` }} />
                </div>
              </div>
            ))}
          </div>
        )
      case 'finance':
        return (
          <div className="mt-2">
            <BarChart
              height={120}
              data={[
                { label: 'Mon', value: 12 },
                { label: 'Tue', value: 45 },
                { label: 'Wed', value: 24 },
                { label: 'Thu', value: 78 },
                { label: 'Fri', value: 15 },
                { label: 'Sat', value: 62 },
                { label: 'Sun', value: 20 }
              ]}
            />
          </div>
        )
      case 'reading':
        return (
          <div className="space-y-3 mt-2 text-xs text-slate-600">
            <div>
              <p className="font-bold text-slate-800">The Lean Startup</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Author: Eric Ries</p>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between font-medium">
                <span>Page 145 / 320</span>
                <span>45%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-1.5">
                <div className="bg-slate-400 h-1.5 rounded-full" style={{ width: '45%' }} />
              </div>
            </div>
          </div>
        )
      case 'study':
        return (
          <div className="mt-2">
            <LineChart
              height={110}
              data={[
                { label: 'Mon', value: 2 },
                { label: 'Tue', value: 3.5 },
                { label: 'Wed', value: 5 },
                { label: 'Thu', value: 1.5 },
                { label: 'Fri', value: 4 },
                { label: 'Sat', value: 6 }
              ]}
            />
          </div>
        )
      case 'mood':
        return (
          <div className="space-y-4 mt-2">
            <div className="flex justify-between gap-1.5">
              {['😞', '😐', '🙂', '😄', '🤩'].map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => selectMood(emoji)}
                  className={`flex-1 py-2 rounded-xl text-lg hover:bg-pink-100/50 transition-colors border ${
                    mood === emoji ? 'border-pink-300 bg-pink-50' : 'border-slate-100'
                  } cursor-pointer`}
                >
                  {emoji}
                </button>
              ))}
            </div>
            <p className="text-[10px] text-slate-400 text-center font-medium">
              Daily check-ins map productivity insights.
            </p>
          </div>
        )
      case 'focus':
        return (
          <div className="flex flex-col items-center justify-center py-2 gap-3 mt-1">
            <div className="text-2xl font-black text-slate-800 tracking-wider">
              {formatTime(focusRemaining)}
            </div>
            <div className="flex gap-2 w-full">
              <Button onClick={toggleFocus} size="sm" variant={isFocusing ? 'outline' : 'primary'} className="flex-1">
                {isFocusing ? 'Pause' : 'Start Focus'}
              </Button>
              <Button
                onClick={() => {
                  setIsFocusing(false)
                  setFocusRemaining(1500)
                }}
                size="sm"
                variant="ghost"
                className="px-2"
              >
                <RotateCcw size={14} />
              </Button>
            </div>
            <span className="text-[10px] text-slate-400 font-semibold">Today's Focus: {focusTime}m</span>
          </div>
        )
      default:
        return null
    }
  }

  // Size grid mapping
  const sizeClasses = {
    full: 'col-span-1 md:col-span-3',
    half: 'col-span-1 md:col-span-2',
    third: 'col-span-1'
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
            Dashboard 🌸
          </h1>
          <p className="text-slate-500 mt-1">Drag and drop widgets to personalize your workspace.</p>
        </div>
        <Button onClick={resetLayout} variant="outline" size="sm" className="flex items-center gap-2 text-xs">
          <RotateCcw size={12} />
          <span>Reset Layout</span>
        </Button>
      </div>

      {/* Grid of Interactive Drag-and-Drop Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-max">
        {widgetOrder.map((widgetId) => {
          const widget = widgetsData[widgetId]
          if (!widget) return null

          let cardVariant: 'white' | 'glass-blue' | 'glass-pink' | 'glass' = 'white'
          if (widget.theme === 'blue') cardVariant = 'glass-blue'
          if (widget.theme === 'pink') cardVariant = 'glass-pink'
          if (widget.theme === 'lavender') cardVariant = 'glass'

          return (
            <div
              key={widget.id}
              className={`${sizeClasses[widget.size]} transition-all duration-300`}
              draggable
              onDragStart={(e) => handleDragStart(e, widget.id)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, widget.id)}
            >
              <Card variant={cardVariant} className="h-full flex flex-col justify-between group">
                <div>
                  {/* Widget Header with Drag Handle */}
                  <div className="flex items-center justify-between border-b border-slate-100/50 pb-3 mb-3 cursor-grab active:cursor-grabbing">
                    <div className="flex items-center gap-2.5">
                      {widget.icon}
                      <h3 className="font-bold text-slate-800 text-sm tracking-tight">{widget.title}</h3>
                    </div>
                    {/* Drag Handle Indicator */}
                    <div className="text-slate-300 group-hover:text-slate-500 transition-colors">
                      <GripVertical size={14} />
                    </div>
                  </div>

                  {/* Widget Content Body */}
                  <div>{renderWidgetContent(widget.id)}</div>
                </div>
              </Card>
            </div>
          )
        })}
      </div>
    </div>
  )
}
