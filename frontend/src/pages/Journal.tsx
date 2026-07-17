import React, { useState } from 'react'
import {
  BookOpen,
  Calendar as CalendarIcon,
  Search,
  Plus,
  Sparkles,
  Smile,
  Trash2,
  Heart,
  ChevronLeft,
  Save,
  ArrowRight
} from 'lucide-react'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { useToastStore } from '../stores/toastStore'

interface JournalEntry {
  id: string
  date: string // YYYY-MM-DD
  title: string
  content: string
  mood: string
  gratitude: string[] // 3 items
  reflection: {
    whatWentWell: string
    whatToImprove: string
  }
  aiSummary?: string
}

export const Journal: React.FC = () => {
  const { addToast } = useToastStore()

  const todayStr = new Date().toISOString().split('T')[0]
  const getYesterdayStr = () => {
    const d = new Date()
    d.setDate(d.getDate() - 1)
    return d.toISOString().split('T')[0]
  }
  const yesterdayStr = getYesterdayStr()

  // Seed Entries
  const [entries, setEntries] = useState<JournalEntry[]>([
    {
      id: 'j-1',
      date: todayStr,
      title: 'Productive Friday Workspace Sprint',
      content: 'Finished scaffolding the core frontend pages. The calendar layout and sidebar look incredibly polished. Ready to build the journal modules next.',
      mood: '😄',
      gratitude: ['My coding assistant Antigravity', 'Hot hazelnut coffee', 'Solid design tokens'],
      reflection: {
        whatWentWell: 'Completed all target components without typescript errors.',
        whatToImprove: 'Take regular screen breaks to avoid eye fatigue.'
      },
      aiSummary: 'You had a highly productive, focused day. You show deep gratitude for progress and tools, maintaining a positive mood. Reflection points to solid work habits but highlights a need for screen break pacing.'
    },
    {
      id: 'j-2',
      date: yesterdayStr,
      title: 'Late Night Debugging Session',
      content: 'Faced a few issues with Vite PWA virtual modules on Windows but resolved them by editing the tsconfig client compilation paths.',
      mood: '😐',
      gratitude: ['Vite hot module reloading', 'Cozy desk light', 'Peaceful evening silence'],
      reflection: {
        whatWentWell: 'Framer motion animations load smoothly without layout shift.',
        whatToImprove: 'Set strict bedtime routines so I do not work past midnight.'
      },
      aiSummary: 'A neutral, technical day. You successfully navigated complex development issues. You find gratitude in subtle workstation details. Reflection suggests a focus on sleep schedule recovery.'
    }
  ])

  // Navigation States
  const [editorOpen, setEditorOpen] = useState(false)
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  // Form Fields
  const [formDate, setFormDate] = useState(todayStr)
  const [formTitle, setFormTitle] = useState('')
  const [formContent, setFormContent] = useState('')
  const [formMood, setFormMood] = useState('🙂')
  const [gratitude1, setGratitude1] = useState('')
  const [gratitude2, setGratitude2] = useState('')
  const [gratitude3, setGratitude3] = useState('')
  const [whatWentWell, setWhatWentWell] = useState('')
  const [whatToImprove, setWhatToImprove] = useState('')
  const [aiSummaryText, setAiSummaryText] = useState('')
  const [generatingAi, setGeneratingAi] = useState(false)

  // Filtered entries
  const filteredEntries = entries.filter((e) => {
    return e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
           e.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
           e.mood.includes(searchQuery)
  })

  // Open Editor
  const openCreateEntry = () => {
    setSelectedEntryId(null)
    setFormDate(new Date().toISOString().split('T')[0])
    setFormTitle('')
    setFormContent('')
    setFormMood('🙂')
    setGratitude1('')
    setGratitude2('')
    setGratitude3('')
    setWhatWentWell('')
    setWhatToImprove('')
    setAiSummaryText('')
    setEditorOpen(true)
  }

  const openEditEntry = (entry: JournalEntry) => {
    setSelectedEntryId(entry.id)
    setFormDate(entry.date)
    setFormTitle(entry.title)
    setFormContent(entry.content)
    setFormMood(entry.mood)
    setGratitude1(entry.gratitude[0] || '')
    setGratitude2(entry.gratitude[1] || '')
    setGratitude3(entry.gratitude[2] || '')
    setWhatWentWell(entry.reflection.whatWentWell)
    setWhatToImprove(entry.reflection.whatToImprove)
    setAiSummaryText(entry.aiSummary || '')
    setEditorOpen(true)
  }

  // AI Summary simulation
  const generateAiSummary = () => {
    if (!formContent.trim()) {
      addToast('Write some content first to generate a summary', 'warning')
      return
    }
    setGeneratingAi(true)
    setTimeout(() => {
      const summary = `Today seems like a "${formMood}" day. You expressed gratitude for: "${gratitude1 || 'your day'}". You are focusing on continuous learning, with positive reflections on what went well. Your improvement actions highlight self-awareness.`
      setAiSummaryText(summary)
      setGeneratingAi(false)
      addToast('AI Journal Summary generated!', 'success')
    }, 1200)
  }

  // Save Entry
  const handleSaveEntry = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formTitle.trim()) {
      addToast('Please enter an entry title', 'warning')
      return
    }

    const gratitude = [gratitude1, gratitude2, gratitude3].filter((g) => g.trim().length > 0)

    if (selectedEntryId === null) {
      // Create new
      const newEntry: JournalEntry = {
        id: `j-${Math.random().toString(36).substr(2, 9)}`,
        date: formDate,
        title: formTitle,
        content: formContent,
        mood: formMood,
        gratitude,
        reflection: {
          whatWentWell,
          whatToImprove
        },
        aiSummary: aiSummaryText || undefined
      }
      setEntries([newEntry, ...entries])
      addToast('Journal entry saved!', 'success')
    } else {
      // Edit existing
      setEntries(
        entries.map((ev) =>
          ev.id === selectedEntryId
            ? {
                ...ev,
                date: formDate,
                title: formTitle,
                content: formContent,
                mood: formMood,
                gratitude,
                reflection: {
                  whatWentWell,
                  whatToImprove
                },
                aiSummary: aiSummaryText || undefined
              }
            : ev
        )
      )
      addToast('Journal entry updated!', 'success')
    }
    setEditorOpen(false)
  }

  const handleDeleteEntry = (id: string) => {
    setEntries(entries.filter((ev) => ev.id !== id))
    addToast('Journal entry deleted', 'error')
    setEditorOpen(false)
  }

  // Calendar View helper (grid of the current month days showing entry checkmarks)
  const renderCalendarView = () => {
    const dates = []
    const today = new Date()
    const year = today.getFullYear()
    const month = today.getMonth()
    const daysInMonth = new Date(year, month + 1, 0).getDate()

    for (let i = 1; i <= daysInMonth; i++) {
      const d = new Date(year, month, i)
      dates.push(d.toISOString().split('T')[0])
    }

    return (
      <Card variant="white" className="space-y-4">
        <h3 className="font-bold text-slate-800 text-sm border-b border-slate-100 pb-2 flex items-center gap-1.5">
          <CalendarIcon size={16} className="text-sky-500" /> Journal Entry Logs
        </h3>
        <div className="grid grid-cols-7 gap-2">
          {dates.map((dateStr) => {
            const hasEntry = entries.some((e) => e.date === dateStr)
            const dayNum = new Date(dateStr).getDate()
            const isToday = todayStr === dateStr

            return (
              <div
                key={dateStr}
                onClick={() => {
                  const entry = entries.find((e) => e.date === dateStr)
                  if (entry) {
                    openEditEntry(entry)
                  } else {
                    openCreateEntry()
                    setFormDate(dateStr)
                  }
                }}
                className={`aspect-square flex flex-col items-center justify-center rounded-xl border text-[10px] cursor-pointer transition-all ${
                  hasEntry
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-700 font-extrabold shadow-xs hover:bg-emerald-100'
                    : isToday
                    ? 'border-sky-400 font-bold hover:bg-slate-50'
                    : 'border-slate-100 bg-slate-50/50 text-slate-400 hover:bg-slate-50'
                }`}
                title={hasEntry ? `${dateStr}: Completed` : `${dateStr}: Write entry`}
              >
                <span>{dayNum}</span>
                {hasEntry && <span className="text-[8px] mt-0.5">✅</span>}
              </div>
            )
          })}
        </div>
        <p className="text-[10px] text-slate-400 text-center font-medium">
          Days marked green contain journal checklogs.
        </p>
      </Card>
    )
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      {editorOpen ? (
        /* Journal Writer Editor Interface */
        <Card variant="white" className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-4">
            <button
              onClick={() => setEditorOpen(false)}
              className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-700 cursor-pointer"
            >
              <ChevronLeft size={16} />
              <span>Back to Journal Logs</span>
            </button>

            <div className="flex gap-2 w-full sm:w-auto justify-end">
              {selectedEntryId && (
                <Button variant="danger" size="sm" onClick={() => handleDeleteEntry(selectedEntryId)}>
                  <Trash2 size={12} className="mr-1" /> Delete
                </Button>
              )}
              <Button onClick={handleSaveEntry} size="sm">
                <Save size={12} className="mr-1" /> Save Entry
              </Button>
            </div>
          </div>

          <form onSubmit={handleSaveEntry} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Main entry textarea */}
            <div className="lg:col-span-2 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Entry Title"
                  placeholder="Today was a milestone sprint..."
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                />
                <Input
                  label="Date"
                  type="date"
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                />
              </div>

              {/* Mood emojis rows */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-500 flex items-center gap-1">
                  <Smile size={12} /> Today's Mood
                </label>
                <div className="flex gap-2">
                  {['😞', '😐', '🙂', '😄', '🤩'].map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setFormMood(emoji)}
                      className={`flex-1 py-2 rounded-xl text-lg hover:bg-slate-100 transition-colors border ${
                        formMood === emoji ? 'border-sky-300 bg-sky-50 shadow-xs' : 'border-slate-150 bg-slate-50/50'
                      } cursor-pointer`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Entry logs</label>
                <textarea
                  placeholder="Record your daily events, emotions, thoughts..."
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-xs focus:outline-hidden focus:ring-2 focus:ring-sky-300 focus:border-sky-300 transition-all text-slate-800 h-60 resize-none leading-relaxed"
                />
              </div>
            </div>

            {/* Right reflection, gratitude prompts & AI Summary */}
            <div className="space-y-6">
              {/* Gratitude prompts */}
              <Card variant="glass" className="space-y-3.5 p-4 border border-slate-200/20">
                <h3 className="font-bold text-slate-800 text-xs flex items-center gap-1.5 uppercase tracking-wider">
                  <Heart size={14} className="text-pink-500" /> Three Grateful Notes
                </h3>
                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="1. Grateful for..."
                    value={gratitude1}
                    onChange={(e) => setGratitude1(e.target.value)}
                    className="w-full px-3 py-2 bg-white/70 border border-slate-200/50 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-pink-200"
                  />
                  <input
                    type="text"
                    placeholder="2. Grateful for..."
                    value={gratitude2}
                    onChange={(e) => setGratitude2(e.target.value)}
                    className="w-full px-3 py-2 bg-white/70 border border-slate-200/50 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-pink-200"
                  />
                  <input
                    type="text"
                    placeholder="3. Grateful for..."
                    value={gratitude3}
                    onChange={(e) => setGratitude3(e.target.value)}
                    className="w-full px-3 py-2 bg-white/70 border border-slate-200/50 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-pink-200"
                  />
                </div>
              </Card>

              {/* Reflection Questions */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">What went well today?</label>
                  <textarea
                    placeholder="Reflect on key successes..."
                    value={whatWentWell}
                    onChange={(e) => setWhatWentWell(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-sky-300 transition-all text-slate-800 h-16 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">What could be improved?</label>
                  <textarea
                    placeholder="Reflect on areas to optimize..."
                    value={whatToImprove}
                    onChange={(e) => setWhatToImprove(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-sky-300 transition-all text-slate-800 h-16 resize-none"
                  />
                </div>
              </div>

              {/* AI Summary Block */}
              <div className="border-t border-slate-100 pt-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
                    <Sparkles size={14} className="text-purple-500 animate-pulse" /> AI Summary Analysis
                  </span>
                  <Button
                    type="button"
                    onClick={generateAiSummary}
                    disabled={generatingAi}
                    size="sm"
                    variant="secondary"
                    className="text-[10px] py-1"
                  >
                    {generatingAi ? 'Summarizing...' : 'Analyze'}
                  </Button>
                </div>
                {aiSummaryText && (
                  <p className="p-3 bg-slate-50 border border-slate-150 rounded-2xl text-[10px] text-slate-500 leading-relaxed font-semibold">
                    {aiSummaryText}
                  </p>
                )}
              </div>
            </div>
          </form>
        </Card>
      ) : (
        /* Journal Entries Grid / Calendar logs lists */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Main List Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header controls */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/60 backdrop-blur-md p-4 rounded-3xl border border-slate-100">
              <div className="relative flex-1 w-full max-w-sm">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search journal entries..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50/50 border border-slate-200/50 rounded-2xl text-xs focus:outline-hidden focus:ring-2 focus:ring-sky-300 focus:border-sky-300 transition-all text-slate-800"
                />
              </div>

              <Button onClick={openCreateEntry} className="shrink-0 w-full sm:w-auto">
                <Plus size={14} className="mr-1" /> New Entry
              </Button>
            </div>

            {/* List */}
            <div className="space-y-6">
              {filteredEntries.length === 0 ? (
                <div className="glass-card p-12 text-center rounded-3xl space-y-4 border border-slate-100 min-h-[300px] flex flex-col justify-center items-center">
                  <BookOpen className="text-slate-300 w-12 h-12" />
                  <div className="space-y-1">
                    <h3 className="font-bold text-slate-800 text-sm">No entries logged</h3>
                    <p className="text-xs text-slate-400">Record your thoughts, gratitude, and mood check-in.</p>
                  </div>
                  <Button onClick={openCreateEntry} size="sm">
                    Write First Entry
                  </Button>
                </div>
              ) : (
                filteredEntries.map((e) => (
                  <Card
                    key={e.id}
                    onClick={() => openEditEntry(e)}
                    variant="white"
                    className="cursor-pointer border border-slate-200/50 hover:shadow-xs transition-shadow space-y-4"
                  >
                    {/* Header */}
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <span className="text-[10px] text-slate-400 font-extrabold bg-slate-100 px-2 py-0.5 rounded-sm">
                          {e.date}
                        </span>
                        <h3 className="font-extrabold text-slate-850 text-sm tracking-tight mt-1 leading-snug">
                          {e.title}
                        </h3>
                      </div>
                      <span className="text-2xl shrink-0">{e.mood}</span>
                    </div>

                    <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed font-medium">
                      {e.content}
                    </p>

                    {/* Gratitude highlights */}
                    {e.gratitude.length > 0 && (
                      <div className="flex flex-wrap items-center gap-2 border-t border-slate-50 pt-3 text-[10px] font-semibold text-slate-500">
                        <span className="font-bold text-pink-600">Grateful for:</span>
                        {e.gratitude.map((gr, idx) => (
                          <span key={idx} className="bg-pink-50/50 px-2 py-0.5 rounded-sm">
                            {gr}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* AI Summaries Badge indicators */}
                    {e.aiSummary && (
                      <div className="bg-slate-50 p-3 rounded-2xl text-[10px] text-slate-500 border border-slate-100 flex items-start gap-2 leading-relaxed">
                        <Sparkles size={12} className="text-purple-500 shrink-0 mt-0.5" />
                        <p className="font-semibold">{e.aiSummary}</p>
                      </div>
                    )}

                    <div className="flex justify-end pt-1">
                      <span className="text-[9px] text-sky-500 font-bold flex items-center gap-1">
                        View Details <ArrowRight size={10} />
                      </span>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </div>

          {/* Sidebar Column Calendar View */}
          <div className="space-y-6">
            {renderCalendarView()}
          </div>
        </div>
      )}
    </div>
  )
}
