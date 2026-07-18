import React, { useState } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar as CalendarIcon,
  Search,
  Clock,
  RefreshCw,
  Bell,
  Trash2,
  Filter
} from 'lucide-react'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input, Select } from '../components/ui/Input'
import { Dialog } from '../components/ui/Dialog'
import { useToastStore } from '../stores/toastStore'
import { saveUserData } from '../lib/persistence'

interface CalendarEvent {
  id: string
  title: string
  description?: string
  date: string // YYYY-MM-DD
  time?: string // HH:MM
  category: 'work' | 'personal' | 'study' | 'fitness' | 'social'
  recurrence: 'none' | 'daily' | 'weekly' | 'monthly'
  reminder: 'none' | '5m' | '15m' | '1h' | '1d'
}

export const Calendar: React.FC = () => {
  const { addToast } = useToastStore()

  // Initial Seed Events
  const [events, setEvents] = useState<CalendarEvent[]>(() => {
    const cached = localStorage.getItem('sololifeos_calendar')
    if (cached) {
      try {
        return JSON.parse(cached)
      } catch {}
    }
    return [
      {
        id: '1',
        title: 'Scaffolding Project Checkpoint',
        description: 'Review database schemas and frontend routing config.',
        date: new Date().toISOString().split('T')[0],
        time: '10:00',
        category: 'work',
        recurrence: 'none',
        reminder: '15m'
      },
      {
        id: '2',
        title: 'Daily Evening Jog',
        description: 'Run 5km in the local park.',
        date: new Date().toISOString().split('T')[0],
        time: '18:00',
        category: 'fitness',
        recurrence: 'daily',
        reminder: '5m'
      },
      {
        id: '3',
        title: 'React Study Group',
        description: 'Learn hooks and virtual DOM mechanics.',
        date: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Tomorrow
        time: '14:30',
        category: 'study',
        recurrence: 'weekly',
        reminder: '1h'
      },
      {
        id: '4',
        title: 'Dinner with Parents',
        description: 'Family gathering at restaurant.',
        date: new Date(Date.now() + 172800000).toISOString().split('T')[0], // Day after tomorrow
        time: '19:00',
        category: 'personal',
        recurrence: 'none',
        reminder: '1d'
      }
    ]
  })

  React.useEffect(() => {
    saveUserData('calendar', events)
  }, [events])

  // View States
  const [currentView, setCurrentView] = useState<'month' | 'week' | 'day' | 'agenda'>('month')
  const [currentDate, setCurrentDate] = useState<Date>(new Date())
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all')

  // Form Modal States
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null)

  // Event Form Values
  const [formTitle, setFormTitle] = useState('')
  const [formDesc, setFormDesc] = useState('')
  const [formDate, setFormDate] = useState('')
  const [formTime, setFormTime] = useState('12:00')
  const [formCategory, setFormCategory] = useState<'work' | 'personal' | 'study' | 'fitness' | 'social'>('work')
  const [formRecurrence, setFormRecurrence] = useState<'none' | 'daily' | 'weekly' | 'monthly'>('none')
  const [formReminder, setFormReminder] = useState<'none' | '5m' | '15m' | '1h' | '1d'>('none')

  // Helper formatting dates
  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  // Generate Month Days
  const getDaysInMonth = (y: number, m: number) => {
    const date = new Date(y, m, 1)
    const days = []
    // Add prefix empty padding slots for start day alignment
    const startDayIndex = date.getDay() // 0 = Sunday
    for (let i = 0; i < startDayIndex; i++) {
      days.push(null)
    }
    // Add month days
    while (date.getMonth() === m) {
      days.push(new Date(date))
      date.setDate(date.getDate() + 1)
    }
    return days
  }

  const daysArr = getDaysInMonth(year, month)

  // Navigate dates
  const handlePrev = () => {
    if (currentView === 'month') {
      setCurrentDate(new Date(year, month - 1, 1))
    } else if (currentView === 'week') {
      setCurrentDate(new Date(currentDate.getTime() - 7 * 86400000))
    } else {
      setCurrentDate(new Date(currentDate.getTime() - 86400000))
    }
  }

  const handleNext = () => {
    if (currentView === 'month') {
      setCurrentDate(new Date(year, month + 1, 1))
    } else if (currentView === 'week') {
      setCurrentDate(new Date(currentDate.getTime() + 7 * 86400000))
    } else {
      setCurrentDate(new Date(currentDate.getTime() + 86400000))
    }
  }

  const handleToday = () => {
    setCurrentDate(new Date())
  }

  // Filter and Search Events
  const filteredEvents = events.filter((e) => {
    const matchesSearch = e.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (e.description && e.description.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesCategory = selectedCategoryFilter === 'all' || e.category === selectedCategoryFilter
    return matchesSearch && matchesCategory
  })

  // CRUD Operations
  const openCreateModal = (initDate?: string) => {
    setModalMode('create')
    setSelectedEventId(null)
    setFormTitle('')
    setFormDesc('')
    setFormDate(initDate || new Date().toISOString().split('T')[0])
    setFormTime('12:00')
    setFormCategory('work')
    setFormRecurrence('none')
    setFormReminder('none')
    setIsModalOpen(true)
  }

  const openEditModal = (event: CalendarEvent) => {
    setModalMode('edit')
    setSelectedEventId(event.id)
    setFormTitle(event.title)
    setFormDesc(event.description || '')
    setFormDate(event.date)
    setFormTime(event.time || '12:00')
    setFormCategory(event.category)
    setFormRecurrence(event.recurrence)
    setFormReminder(event.reminder)
    setIsModalOpen(true)
  }

  const handleSaveEvent = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formTitle.trim()) {
      addToast('Please enter an event title', 'warning')
      return
    }

    if (modalMode === 'create') {
      const newEvent: CalendarEvent = {
        id: Math.random().toString(36).substr(2, 9),
        title: formTitle,
        description: formDesc,
        date: formDate,
        time: formTime,
        category: formCategory,
        recurrence: formRecurrence,
        reminder: formReminder
      }
      setEvents([...events, newEvent])
      addToast('Event created successfully!', 'success')
      if (formReminder !== 'none') {
        // Mock notification timer
        setTimeout(() => {
          addToast(`[REMINDER]: ${formTitle} starts soon!`, 'info')
        }, 3000)
      }
    } else if (modalMode === 'edit' && selectedEventId) {
      setEvents(
        events.map((ev) =>
          ev.id === selectedEventId
            ? {
                ...ev,
                title: formTitle,
                description: formDesc,
                date: formDate,
                time: formTime,
                category: formCategory,
                recurrence: formRecurrence,
                reminder: formReminder
              }
            : ev
        )
      )
      addToast('Event updated successfully!', 'success')
    }

    setIsModalOpen(false)
  }

  const handleDeleteEvent = (id: string) => {
    setEvents(events.filter((ev) => ev.id !== id))
    addToast('Event removed', 'error')
    setIsModalOpen(false)
  }

  // HTML5 Drag and Drop logic
  const handleDragStart = (e: React.DragEvent, eventId: string) => {
    e.dataTransfer.setData('eventId', eventId)
  }

  const handleDrop = (e: React.DragEvent, targetDateStr: string) => {
    e.preventDefault()
    const eventId = e.dataTransfer.getData('eventId')
    if (eventId) {
      setEvents(
        events.map((ev) => (ev.id === eventId ? { ...ev, date: targetDateStr } : ev))
      )
      const movedEvent = events.find((ev) => ev.id === eventId)
      if (movedEvent) {
        addToast(`Rescheduled: "${movedEvent.title}" moved to ${targetDateStr}`, 'success')
      }
    }
  }

  // Category Color Map
  const categoryColors = {
    work: 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100',
    personal: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100',
    study: 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100',
    fitness: 'bg-sky-50 text-sky-700 border-sky-200 hover:bg-sky-100',
    social: 'bg-pink-50 text-pink-700 border-pink-200 hover:bg-pink-100'
  }

  const viewMonthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })

  // Render Month grid helper
  const renderMonthView = () => {
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    return (
      <div className="border border-slate-100 rounded-3xl overflow-hidden bg-white/60 backdrop-blur-md">
        {/* Header Days */}
        <div className="grid grid-cols-7 bg-slate-50 border-b border-slate-100">
          {daysOfWeek.map((day) => (
            <div key={day} className="py-3 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">
              {day}
            </div>
          ))}
        </div>

        {/* Days Slots */}
        <div className="grid grid-cols-7 grid-rows-5 auto-rows-fr">
          {daysArr.map((date, idx) => {
            if (!date) {
              return <div key={`empty-${idx}`} className="min-h-[100px] border-b border-r border-slate-100 bg-slate-50/20" />
            }
            const dateStr = date.toISOString().split('T')[0]
            const dayEvents = filteredEvents.filter((e) => e.date === dateStr)
            const isToday = new Date().toISOString().split('T')[0] === dateStr

            return (
              <div
                key={dateStr}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => handleDrop(e, dateStr)}
                onClick={() => openCreateModal(dateStr)}
                className={`min-h-[110px] p-2 border-b border-r border-slate-100 hover:bg-slate-50/40 transition-colors flex flex-col justify-between group relative cursor-pointer ${
                  isToday ? 'bg-sky-50/10' : ''
                }`}
              >
                <div className="flex justify-between items-center mb-1">
                  <span
                    className={`text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center ${
                      isToday ? 'bg-sky-500 text-white shadow-xs' : 'text-slate-600'
                    }`}
                  >
                    {date.getDate()}
                  </span>
                  <span className="text-[10px] text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    + Add
                  </span>
                </div>

                <div className="flex-1 space-y-1 overflow-y-auto max-h-[75px] scrollbar-thin">
                  {dayEvents.map((e) => (
                    <div
                      key={e.id}
                      draggable
                      onDragStart={(evt) => handleDragStart(evt, e.id)}
                      onClick={(evt) => {
                        evt.stopPropagation()
                        openEditModal(e)
                      }}
                      className={`text-[10px] px-2 py-1 rounded-md border font-semibold truncate transition-all ${
                        categoryColors[e.category]
                      }`}
                      title={e.title}
                    >
                      {e.time ? `${e.time} ` : ''}
                      {e.title}
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  // Render Week view helper
  const renderWeekView = () => {
    // Get array of 7 dates representing the current week window
    const getWeekDays = (srcDate: Date) => {
      const currentDay = srcDate.getDay() // 0-6
      const startOfWeek = new Date(srcDate.getTime() - currentDay * 86400000)
      const week = []
      for (let i = 0; i < 7; i++) {
        week.push(new Date(startOfWeek.getTime() + i * 86400000))
      }
      return week
    }

    const weekDays = getWeekDays(currentDate)

    return (
      <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
        {weekDays.map((date) => {
          const dateStr = date.toISOString().split('T')[0]
          const dayEvents = filteredEvents.filter((e) => e.date === dateStr)
          const isToday = new Date().toISOString().split('T')[0] === dateStr

          return (
            <Card
              key={dateStr}
              variant={isToday ? 'glass-blue' : 'white'}
              className="min-h-[220px] flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-center border-b border-slate-100/50 pb-2 mb-3">
                  <span className="text-xs font-black text-slate-500 uppercase tracking-widest">
                    {date.toLocaleDateString('default', { weekday: 'short' })}
                  </span>
                  <span
                    className={`text-xs font-black w-6 h-6 rounded-full flex items-center justify-center ${
                      isToday ? 'bg-sky-500 text-white' : 'text-slate-600 bg-slate-100'
                    }`}
                  >
                    {date.getDate()}
                  </span>
                </div>

                <div className="space-y-2 overflow-y-auto max-h-[220px] scrollbar-thin">
                  {dayEvents.length === 0 ? (
                    <p className="text-[10px] text-slate-400 italic py-4 text-center">No events</p>
                  ) : (
                    dayEvents.map((e) => (
                      <div
                        key={e.id}
                        onClick={() => openEditModal(e)}
                        className={`text-[10px] p-2 rounded-lg border font-bold flex flex-col gap-1 transition-all cursor-pointer ${
                          categoryColors[e.category]
                        }`}
                      >
                        <span className="truncate">{e.title}</span>
                        {e.time && (
                          <span className="text-[9px] flex items-center gap-1 opacity-70">
                            <Clock size={8} /> {e.time}
                          </span>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>

              <Button onClick={() => openCreateModal(dateStr)} variant="secondary" size="sm" className="w-full mt-3 text-[10px] py-1">
                + Add Event
              </Button>
            </Card>
          )
        })}
      </div>
    )
  }

  // Render Day View helper
  const renderDayView = () => {
    const dateStr = currentDate.toISOString().split('T')[0]
    const dayEvents = filteredEvents.filter((e) => e.date === dateStr)

    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        {/* Day Column */}
        <Card variant="white" className="md:col-span-2 space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <CalendarIcon size={16} className="text-sky-500" />
              {currentDate.toLocaleDateString('default', { weekday: 'long', month: 'long', day: 'numeric' })}
            </h2>
            <Button onClick={() => openCreateModal(dateStr)} size="sm">
              <Plus size={14} className="mr-1" /> Add Event
            </Button>
          </div>

          <div className="space-y-3">
            {dayEvents.length === 0 ? (
              <div className="text-center py-12 text-slate-400 space-y-2">
                <p className="text-sm">No scheduled events for today.</p>
                <Button variant="ghost" onClick={() => openCreateModal(dateStr)} size="sm">
                  Create One Now
                </Button>
              </div>
            ) : (
              dayEvents.map((e) => (
                <div
                  key={e.id}
                  onClick={() => openEditModal(e)}
                  className={`p-4 rounded-2xl border font-bold flex flex-col gap-1 transition-all cursor-pointer ${
                    categoryColors[e.category]
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="text-sm">{e.title}</span>
                    <span className="text-[10px] uppercase font-black tracking-widest opacity-80">
                      {e.category}
                    </span>
                  </div>
                  {e.description && (
                    <p className="text-xs font-normal opacity-90 mt-1">{e.description}</p>
                  )}
                  <div className="flex gap-4 mt-2 text-[10px] opacity-75 font-medium">
                    {e.time && (
                      <span className="flex items-center gap-1">
                        <Clock size={10} /> {e.time}
                      </span>
                    )}
                    {e.recurrence !== 'none' && (
                      <span className="flex items-center gap-1">
                        <RefreshCw size={10} /> Recur: {e.recurrence}
                      </span>
                    )}
                    {e.reminder !== 'none' && (
                      <span className="flex items-center gap-1">
                        <Bell size={10} /> Alert: {e.reminder}
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Categories helper */}
        <Card variant="white" className="space-y-4">
          <h3 className="font-bold text-slate-800 text-sm border-b border-slate-100 pb-2">Calendar Categories</h3>
          <div className="space-y-2.5">
            {Object.keys(categoryColors).map((cat) => (
              <div
                key={cat}
                onClick={() => setSelectedCategoryFilter(selectedCategoryFilter === cat ? 'all' : cat)}
                className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                  categoryColors[cat as keyof typeof categoryColors]
                } ${selectedCategoryFilter === cat ? 'ring-2 ring-slate-400 ring-offset-1 scale-[1.01]' : 'opacity-85'}`}
              >
                <span className="text-xs uppercase font-extrabold tracking-wider">{cat}</span>
                <span className="text-[10px] font-bold bg-white/60 px-2 py-0.5 rounded-sm">
                  {events.filter((ev) => ev.category === cat).length}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    )
  }

  // Render Agenda View helper
  const renderAgendaView = () => {
    return (
      <Card variant="white" className="space-y-4">
        <h2 className="text-base font-bold text-slate-800 border-b border-slate-100 pb-3">Agenda Checklist</h2>
        <div className="divide-y divide-slate-100">
          {filteredEvents.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-12">No upcoming items match query.</p>
          ) : (
            filteredEvents
              .sort((a, b) => a.date.localeCompare(b.date) || (a.time || '').localeCompare(b.time || ''))
              .map((e) => (
                <div
                  key={e.id}
                  onClick={() => openEditModal(e)}
                  className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 cursor-pointer hover:bg-slate-50/30 px-2 rounded-xl transition-colors"
                >
                  <div className="space-y-1">
                    <h4 className="font-bold text-slate-800 text-sm">{e.title}</h4>
                    {e.description && <p className="text-xs text-slate-500">{e.description}</p>}
                    <div className="flex flex-wrap gap-3 text-[10px] text-slate-400 font-semibold pt-1">
                      <span className="text-slate-500 bg-slate-100 px-2 py-0.5 rounded-sm">{e.date}</span>
                      {e.time && (
                        <span className="flex items-center gap-1">
                          <Clock size={10} /> {e.time}
                        </span>
                      )}
                      <span className="capitalize">{e.category}</span>
                      {e.recurrence !== 'none' && (
                        <span className="flex items-center gap-1">
                          <RefreshCw size={10} /> {e.recurrence}
                        </span>
                      )}
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={(evt) => { evt.stopPropagation(); handleDeleteEvent(e.id) }}>
                    <Trash2 size={12} className="text-rose-500" />
                  </Button>
                </div>
              ))
          )}
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      {/* Search and Filters Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/60 backdrop-blur-md p-4 rounded-3xl border border-slate-100">
        <div className="flex items-center gap-3">
          <CalendarIcon className="text-sky-500 w-8 h-8 shrink-0" />
          <div>
            <h1 className="text-xl font-extrabold text-slate-800 leading-tight">Calendar 📅</h1>
            <p className="text-[10px] text-slate-500">Track events, build schedules, and trigger notifications.</p>
          </div>
        </div>

        {/* Filter / Search controls */}
        <div className="flex flex-col sm:flex-row gap-3 flex-1 max-w-xl md:justify-end">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search event logs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50/50 border border-slate-200/50 rounded-2xl text-xs focus:outline-hidden focus:ring-2 focus:ring-sky-300 focus:border-sky-300 transition-all text-slate-800"
            />
          </div>

          <div className="relative">
            <select
              value={selectedCategoryFilter}
              onChange={(e) => setSelectedCategoryFilter(e.target.value)}
              className="w-full pl-8 pr-8 py-2 bg-slate-50/50 border border-slate-200/50 rounded-2xl text-xs focus:outline-hidden focus:ring-2 focus:ring-sky-300 focus:border-sky-300 transition-all text-slate-800 appearance-none cursor-pointer"
            >
              <option value="all">All Categories</option>
              <option value="work">Work</option>
              <option value="personal">Personal</option>
              <option value="study">Study</option>
              <option value="fitness">Fitness</option>
              <option value="social">Social</option>
            </select>
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Main Navigation Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        {/* Previous, Next, Current Date Label */}
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-black text-slate-800 min-w-[150px] uppercase tracking-wide">
            {currentView === 'month' ? viewMonthName : currentDate.toLocaleDateString('default', { month: 'short', day: 'numeric', year: 'numeric' })}
          </h2>
          <div className="flex gap-1.5">
            <button
              onClick={handlePrev}
              className="p-2 rounded-xl bg-white border border-slate-100 hover:bg-slate-50/80 transition-colors shadow-xs cursor-pointer"
            >
              <ChevronLeft size={14} className="text-slate-600" />
            </button>
            <button
              onClick={handleToday}
              className="px-3 py-1 text-xs font-bold rounded-xl bg-white border border-slate-100 hover:bg-slate-50/80 transition-colors shadow-xs cursor-pointer"
            >
              Today
            </button>
            <button
              onClick={handleNext}
              className="p-2 rounded-xl bg-white border border-slate-100 hover:bg-slate-50/80 transition-colors shadow-xs cursor-pointer"
            >
              <ChevronRight size={14} className="text-slate-600" />
            </button>
          </div>
        </div>

        {/* View Selection & Add Event */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* View Toggles */}
          <div className="flex bg-slate-100 p-1 rounded-2xl relative w-full sm:w-auto">
            {['month', 'week', 'day', 'agenda'].map((v) => (
              <button
                key={v}
                onClick={() => {
                  setCurrentView(v as any)
                  setCurrentDate(new Date())
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer ${
                  currentView === v ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {v}
              </button>
            ))}
          </div>

          <Button onClick={() => openCreateModal()} className="shrink-0">
            <Plus size={14} className="mr-1" /> Add Event
          </Button>
        </div>
      </div>

      {/* Main Views Container */}
      <div className="transition-all duration-300">
        {currentView === 'month' && renderMonthView()}
        {currentView === 'week' && renderWeekView()}
        {currentView === 'day' && renderDayView()}
        {currentView === 'agenda' && renderAgendaView()}
      </div>

      {/* Event Details dialog Modal */}
      <Dialog
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalMode === 'create' ? 'Create Calendar Event 📌' : 'Edit Calendar Event ✏️'}
        footer={
          <div className="flex justify-between w-full">
            {modalMode === 'edit' ? (
              <Button
                variant="danger"
                onClick={() => selectedEventId && handleDeleteEvent(selectedEventId)}
              >
                Delete Event
              </Button>
            ) : (
              <div />
            )}
            <div className="flex gap-2">
              <Button variant="ghost" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveEvent} variant="primary">
                {modalMode === 'create' ? 'Create Event' : 'Save Changes'}
              </Button>
            </div>
          </div>
        }
      >
        <form onSubmit={handleSaveEvent} className="space-y-4">
          <Input
            label="Event Title"
            placeholder="Go to gym, React study, meeting..."
            value={formTitle}
            onChange={(e) => setFormTitle(e.target.value)}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Date"
              type="date"
              value={formDate}
              onChange={(e) => setFormDate(e.target.value)}
            />
            <Input
              label="Time"
              type="time"
              value={formTime}
              onChange={(e) => setFormTime(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <Select
              label="Category"
              value={formCategory}
              onChange={(e) => setFormCategory(e.target.value as any)}
              options={[
                { value: 'work', label: 'Work' },
                { value: 'personal', label: 'Personal' },
                { value: 'study', label: 'Study' },
                { value: 'fitness', label: 'Fitness' },
                { value: 'social', label: 'Social' }
              ]}
            />

            <Select
              label="Recurrence"
              value={formRecurrence}
              onChange={(e) => setFormRecurrence(e.target.value as any)}
              options={[
                { value: 'none', label: 'None' },
                { value: 'daily', label: 'Daily' },
                { value: 'weekly', label: 'Weekly' },
                { value: 'monthly', label: 'Monthly' }
              ]}
            />

            <Select
              label="Reminder Alert"
              value={formReminder}
              onChange={(e) => setFormReminder(e.target.value as any)}
              options={[
                { value: 'none', label: 'None' },
                { value: '5m', label: '5 minutes before' },
                { value: '15m', label: '15 minutes before' },
                { value: '1h', label: '1 hour before' },
                { value: '1d', label: '1 day before' }
              ]}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Description (Optional)</label>
            <textarea
              placeholder="Add details, links, or notes..."
              value={formDesc}
              onChange={(e) => setFormDesc(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm focus:outline-hidden focus:ring-2 focus:ring-sky-300 focus:border-sky-300 transition-all text-slate-800 h-24 resize-none"
            />
          </div>
        </form>
      </Dialog>
    </div>
  )
}
