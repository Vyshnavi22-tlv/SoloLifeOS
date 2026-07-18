import React, { useState, useEffect } from 'react'
import {
  GraduationCap,
  Clock,
  Calendar,
  Trash2,
  CheckCircle,
  Circle,
  RotateCw,
  Check,
  Play,
  Pause,
  RotateCcw,
  BarChart2
} from 'lucide-react'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input, Select } from '../components/ui/Input'
import { Dialog } from '../components/ui/Dialog'
import { useToastStore } from '../stores/toastStore'
import { BarChart, LineChart } from '../components/ui/Chart'
import { saveUserData } from '../lib/persistence'

interface Assignment {
  id: string
  subject: string
  title: string
  deadline: string
  done: boolean
}

interface Exam {
  id: string
  subject: string
  title: string
  date: string
  targetGrade: string
}

interface Flashcard {
  id: string
  subject: string
  question: string
  answer: string
}

export const Study: React.FC = () => {
  const { addToast } = useToastStore()

  // Load study data from cache
  const cachedStudy = (() => {
    const cached = localStorage.getItem('sololifeos_study')
    if (cached) {
      try {
        return JSON.parse(cached)
      } catch {}
    }
    return null
  })()

  // Seed Data
  const [subjects] = useState<string[]>(['Computer Science', 'Mathematics', 'Chemistry'])

  const [assignments, setAssignments] = useState<Assignment[]>(() => {
    return cachedStudy?.assignments || [
      { id: 'a-1', subject: 'Computer Science', title: 'Write AST Parser in TS', deadline: '2026-07-20', done: false },
      { id: 'a-2', subject: 'Mathematics', title: 'Linear Algebra homework #3', deadline: '2026-07-22', done: true },
      { id: 'a-3', subject: 'Chemistry', title: 'Organic Chemistry Lab Report', deadline: '2026-07-25', done: false }
    ]
  })

  const [exams, setExams] = useState<Exam[]>(() => {
    return cachedStudy?.exams || [
      { id: 'e-1', subject: 'Computer Science', title: 'Data Structures midterm', date: '2026-08-05', targetGrade: 'A+' },
      { id: 'e-2', subject: 'Mathematics', title: 'Calculus Final Exam', date: '2026-08-12', targetGrade: 'A' }
    ]
  })

  const [flashcards, setFlashcards] = useState<Flashcard[]>(() => {
    return cachedStudy?.flashcards || [
      { id: 'f-1', subject: 'Computer Science', question: 'What is a closure in JS?', answer: 'A closure is the combination of a function bundled together with references to its surrounding state.' },
      { id: 'f-2', subject: 'Mathematics', question: 'State Euler\'s identity formula.', answer: 'e^(i*pi) + 1 = 0' },
      { id: 'f-3', subject: 'Chemistry', question: 'What is the molecular weight of H2O?', answer: '18.015 g/mol' }
    ]
  })

  const [studyHours, setStudyHours] = useState<Record<string, number>>(() => {
    return cachedStudy?.studyHours || {
      'Computer Science': 8,
      'Mathematics': 5,
      'Chemistry': 3
    }
  })

  React.useEffect(() => {
    saveUserData('study', { assignments, exams, flashcards, studyHours })
  }, [assignments, exams, flashcards, studyHours])

  // Navigation Tabs
  const [activeTab, setActiveTab] = useState<'overview' | 'timer' | 'flashcards' | 'analytics'>('overview')

  // Modals state
  const [isAsgModalOpen, setIsAsgModalOpen] = useState(false)
  const [isExamModalOpen, setIsExamModalOpen] = useState(false)
  const [isFcModalOpen, setIsFcModalOpen] = useState(false)

  // Assignment Form fields
  const [asgSubject, setAsgSubject] = useState('Computer Science')
  const [asgTitle, setAsgTitle] = useState('')
  const [asgDeadline, setAsgDeadline] = useState('')

  // Exam Form fields
  const [examSubject, setExamSubject] = useState('Computer Science')
  const [examTitle, setExamTitle] = useState('')
  const [examDate, setExamDate] = useState('')
  const [examGrade, setExamGrade] = useState('A')

  // Flashcard Form fields
  const [fcSubject, setFcSubject] = useState('Computer Science')
  const [fcQuestion, setFcQuestion] = useState('')
  const [fcAnswer, setFcAnswer] = useState('')

  // Timer State
  const [timerSubject, setTimerSubject] = useState('Computer Science')
  const [timerRemaining, setTimerRemaining] = useState(1500) // 25 mins
  const [isTimerRunning, setIsTimerRunning] = useState(false)

  // Flashcard deck active index
  const [activeFcIdx, setActiveFcIdx] = useState(0)
  const [fcFlipped, setFcFlipped] = useState(false)
  const [fcScore, setFcScore] = useState(0)

  // Timer Tick
  useEffect(() => {
    let interval: any = null
    if (isTimerRunning && timerRemaining > 0) {
      interval = setInterval(() => {
        setTimerRemaining((prev) => prev - 1)
      }, 1000)
    } else if (timerRemaining === 0) {
      setIsTimerRunning(false)
      setTimerRemaining(1500)
      // Add study hours
      setStudyHours((prev) => ({
        ...prev,
        [timerSubject]: (prev[timerSubject] || 0) + 25 / 60
      }))
      addToast(`Focus session completed! Logged 25 mins for ${timerSubject}.`, 'success')
    }
    return () => clearInterval(interval)
  }, [isTimerRunning, timerRemaining, timerSubject, addToast])

  // Timer Handlers
  const toggleTimer = () => {
    setIsTimerRunning(!isTimerRunning)
    addToast(isTimerRunning ? 'Study timer paused' : 'Study timer started! Focus on learning.', 'info')
  }

  const resetTimer = () => {
    setIsTimerRunning(false)
    setTimerRemaining(1500)
  }

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60)
    const s = secs % 60
    return `${m}:${s < 10 ? '0' : ''}${s}`
  }

  // Flashcard score helpers
  const handleScore = (correct: boolean) => {
    if (correct) {
      setFcScore((prev) => prev + 1)
      addToast('Keep it up! Marked correct.', 'success')
    }
    setFcFlipped(false)
    // Next card
    setTimeout(() => {
      setActiveFcIdx((prev) => (prev + 1) % flashcards.length)
    }, 200)
  }

  // Create Handlers
  const handleSaveAssignment = (e: React.FormEvent) => {
    e.preventDefault()
    if (!asgTitle.trim()) {
      addToast('Assignment title is required', 'warning')
      return
    }
    const newAsg: Assignment = {
      id: `a-${Math.random().toString(36).substr(2, 9)}`,
      subject: asgSubject,
      title: asgTitle,
      deadline: asgDeadline || new Date().toISOString().split('T')[0],
      done: false
    }
    setAssignments([...assignments, newAsg])
    addToast('Assignment scheduled!', 'success')
    setIsAsgModalOpen(false)
    setAsgTitle('')
  }

  const handleSaveExam = (e: React.FormEvent) => {
    e.preventDefault()
    if (!examTitle.trim()) {
      addToast('Exam title is required', 'warning')
      return
    }
    const newExam: Exam = {
      id: `e-${Math.random().toString(36).substr(2, 9)}`,
      subject: examSubject,
      title: examTitle,
      date: examDate || new Date().toISOString().split('T')[0],
      targetGrade: examGrade
    }
    setExams([...exams, newExam])
    addToast('Exam target registered!', 'success')
    setIsExamModalOpen(false)
    setExamTitle('')
  }

  const handleSaveFlashcard = (e: React.FormEvent) => {
    e.preventDefault()
    if (!fcQuestion.trim() || !fcAnswer.trim()) {
      addToast('Question and Answer are required', 'warning')
      return
    }
    const newFc: Flashcard = {
      id: `f-${Math.random().toString(36).substr(2, 9)}`,
      subject: fcSubject,
      question: fcQuestion,
      answer: fcAnswer
    }
    setFlashcards([...flashcards, newFc])
    addToast('Flashcard deck extended!', 'success')
    setIsFcModalOpen(false)
    setFcQuestion('')
    setFcAnswer('')
  }

  // Checkbox toggle directly
  const toggleAssignment = (id: string) => {
    setAssignments(
      assignments.map((a) => (a.id === id ? { ...a, done: !a.done } : a))
    )
    addToast('Assignment status updated', 'success')
  }

  const deleteAssignment = (id: string) => {
    setAssignments(assignments.filter((a) => a.id !== id))
    addToast('Assignment removed', 'error')
  }

  const deleteExam = (id: string) => {
    setExams(exams.filter((ex) => ex.id !== id))
    addToast('Exam removed', 'error')
  }

  const totalStudyHrs = Object.values(studyHours).reduce((acc, h) => acc + h, 0)
  const completedAssignmentsCount = assignments.filter((a) => a.done).length

  // Category specific CSS color badges
  const subjectColors = {
    'Computer Science': 'bg-indigo-50 text-indigo-700 border-indigo-200',
    'Mathematics': 'bg-sky-50 text-sky-700 border-sky-200',
    'Chemistry': 'bg-pink-50 text-pink-700 border-pink-200'
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
            Study Planner 🎓
          </h1>
          <p className="text-slate-500 mt-1">Organize courses, track assignments, and study flashcards.</p>
        </div>
        <div className="flex gap-2">
          {activeTab === 'overview' && (
            <>
              <Button onClick={() => setIsAsgModalOpen(true)} variant="secondary" size="sm">
                + Assignment
              </Button>
              <Button onClick={() => setIsExamModalOpen(true)} variant="secondary" size="sm">
                + Exam Date
              </Button>
            </>
          )}
          {activeTab === 'flashcards' && (
            <Button onClick={() => setIsFcModalOpen(true)} size="sm">
              + Add Card
            </Button>
          )}
        </div>
      </div>

      {/* Analytics Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Study Time', value: `${totalStudyHrs.toFixed(1)}h`, icon: <Clock className="text-indigo-500" size={16} /> },
          { label: 'Completed Assignments', value: `${completedAssignmentsCount}/${assignments.length}`, icon: <CheckCircle className="text-emerald-500" size={16} /> },
          { label: 'Upcoming Exams', value: exams.length, icon: <Calendar className="text-sky-500" size={16} /> },
          { label: 'Flashcards Decks', value: flashcards.length, icon: <GraduationCap className="text-pink-500" size={16} /> }
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

      {/* Tabs Selection switcher */}
      <div className="flex bg-slate-100 p-1 rounded-2xl max-w-md">
        {['overview', 'timer', 'flashcards', 'analytics'].map((t) => (
          <button
            key={t}
            onClick={() => setActiveTab(t as any)}
            className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all capitalize cursor-pointer ${
              activeTab === t ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {t === 'overview' ? 'Syllabus Planner' : t}
          </button>
        ))}
      </div>

      {/* Tab Contents View */}
      <div className="transition-all duration-300">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* Assignments checklist column */}
            <Card variant="white" className="lg:col-span-2 space-y-4">
              <h3 className="font-bold text-slate-800 text-sm border-b border-slate-100 pb-2">Assignments Syllabus</h3>
              <div className="divide-y divide-slate-100">
                {assignments.length === 0 ? (
                  <p className="text-xs text-slate-400 py-6 text-center italic">No assignments set.</p>
                ) : (
                  assignments.map((a) => (
                    <div
                      key={a.id}
                      onClick={() => toggleAssignment(a.id)}
                      className="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/10 px-2 rounded-xl transition-colors"
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        <button className="mt-0.5 shrink-0 cursor-pointer">
                          {a.done ? (
                            <CheckCircle size={16} className="text-emerald-500" />
                          ) : (
                            <Circle size={16} className="text-slate-300 hover:text-sky-500" />
                          )}
                        </button>
                        <div className="space-y-1 min-w-0">
                          <h4 className={`text-xs font-bold truncate ${a.done ? 'line-through text-slate-400' : 'text-slate-700'}`}>
                            {a.title}
                          </h4>
                          <div className="flex items-center gap-2 text-[9px] font-semibold text-slate-400">
                            <span className={`px-2 py-0.5 rounded-sm border uppercase font-extrabold ${subjectColors[a.subject as keyof typeof subjectColors]}`}>
                              {a.subject}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar size={10} /> Due: {a.deadline}
                            </span>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={(e) => { e.stopPropagation(); deleteAssignment(a.id) }}
                        className="p-1 text-slate-300 hover:text-rose-500 transition-colors cursor-pointer shrink-0"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </Card>

            {/* Exams list Column */}
            <Card variant="white" className="space-y-4">
              <h3 className="font-bold text-slate-800 text-sm border-b border-slate-100 pb-2">Upcoming Exam dates</h3>
              <div className="space-y-4">
                {exams.length === 0 ? (
                  <p className="text-xs text-slate-400 py-6 text-center italic">No upcoming exams.</p>
                ) : (
                  exams.map((ex) => (
                    <div key={ex.id} className="p-3 bg-slate-50/50 border border-slate-150 rounded-2xl flex justify-between items-start gap-3">
                      <div className="space-y-1">
                        <span className={`px-1.5 py-0.5 rounded-sm text-[8px] font-extrabold uppercase border ${subjectColors[ex.subject as keyof typeof subjectColors]}`}>
                          {ex.subject}
                        </span>
                        <h4 className="text-xs font-bold text-slate-800 leading-snug">{ex.title}</h4>
                        <p className="text-[9px] text-slate-400 font-semibold">Date: {ex.date}</p>
                      </div>
                      <div className="flex flex-col items-end justify-between min-h-[50px] shrink-0">
                        <span className="text-[10px] font-extrabold bg-sky-50 text-sky-700 px-2 py-0.5 rounded-sm">
                          Target: {ex.targetGrade}
                        </span>
                        <button
                          onClick={() => deleteExam(ex.id)}
                          className="text-slate-300 hover:text-rose-500 transition-colors cursor-pointer"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>
        )}

        {/* Study countdown timer tab */}
        {activeTab === 'timer' && (
          <Card variant="glass" className="max-w-md mx-auto p-8 flex flex-col items-center justify-center gap-6 border border-slate-200/40 relative">
            <h3 className="text-base font-extrabold text-slate-800 tracking-tight flex items-center gap-1.5 uppercase">
              <Clock size={16} className="text-sky-500 animate-pulse" /> Syllabus Study Focus
            </h3>

            <div className="w-56">
              <Select
                label="Select Subject to Study"
                value={timerSubject}
                onChange={(e) => setTimerSubject(e.target.value)}
                options={subjects.map((s) => ({ value: s, label: s }))}
              />
            </div>

            <div className="text-5xl font-black text-slate-850 tracking-widest my-2 select-none">
              {formatTime(timerRemaining)}
            </div>

            <div className="flex gap-3 w-full max-w-xs">
              <Button onClick={toggleTimer} variant={isTimerRunning ? 'outline' : 'primary'} className="flex-1 font-bold">
                {isTimerRunning ? <Pause size={14} className="mr-1" /> : <Play size={14} className="mr-1" />}
                {isTimerRunning ? 'Pause Session' : 'Start Focus'}
              </Button>
              <Button onClick={resetTimer} variant="ghost" className="px-3">
                <RotateCcw size={14} />
              </Button>
            </div>
            <p className="text-[10px] text-slate-400 font-semibold text-center leading-relaxed">
              Completing a 25-minute study focus interval logs 0.4h study statistics to the analytics dashboard automatically.
            </p>
          </Card>
        )}

        {/* Flashcards flip study deck tab */}
        {activeTab === 'flashcards' && (
          <div className="max-w-xl mx-auto space-y-6">
            {flashcards.length === 0 ? (
              <Card variant="white" className="p-8 text-center text-slate-400 italic">No flashcards deck configured.</Card>
            ) : (
              <div className="space-y-6">
                <div className="flex justify-between items-center text-xs font-semibold text-slate-500">
                  <span>Card {activeFcIdx + 1} of {flashcards.length}</span>
                  <span className="bg-sky-50 text-sky-700 px-2 py-0.5 rounded-sm font-bold">Current Score: {fcScore}</span>
                </div>

                {/* Flip Card with custom CSS transform transitions */}
                <div
                  onClick={() => setFcFlipped(!fcFlipped)}
                  className="h-64 cursor-pointer relative perspective-[1000px] w-full"
                >
                  <div
                    className={`absolute inset-0 transition-transform duration-500 preserve-3d w-full h-full ${
                      fcFlipped ? 'rotate-y-180' : ''
                    }`}
                  >
                    {/* Front Question Face */}
                    <Card
                      variant="white"
                      className="absolute inset-0 backface-hidden flex flex-col justify-between p-6 border border-slate-200/50 hover:shadow-xs transition-shadow"
                    >
                      <span className={`px-2 py-0.5 rounded-sm text-[8px] font-extrabold uppercase border self-start ${subjectColors[flashcards[activeFcIdx].subject as keyof typeof subjectColors]}`}>
                        {flashcards[activeFcIdx].subject}
                      </span>
                      <div className="text-center py-6 text-slate-800 font-bold text-sm leading-relaxed">
                        {flashcards[activeFcIdx].question}
                      </div>
                      <p className="text-[9px] text-slate-400 text-center font-bold uppercase tracking-wider">
                        Click card to reveal answer
                      </p>
                    </Card>

                    {/* Back Answer Face */}
                    <Card
                      variant="glass-blue"
                      className="absolute inset-0 backface-hidden rotate-y-180 flex flex-col justify-between p-6 border border-sky-200/30"
                    >
                      <span className="px-2 py-0.5 rounded-sm text-[8px] font-extrabold uppercase border bg-emerald-50 text-emerald-700 border-emerald-100 self-start">
                        ANSWER
                      </span>
                      <div className="text-center py-4 text-slate-700 font-medium text-xs leading-relaxed">
                        {flashcards[activeFcIdx].answer}
                      </div>
                      <p className="text-[9px] text-emerald-600 text-center font-bold uppercase tracking-wider">
                        Flip card back or record score below
                      </p>
                    </Card>
                  </div>
                </div>

                {/* Score Controls */}
                {fcFlipped && (
                  <div className="flex gap-3 justify-center">
                    <Button onClick={() => handleScore(false)} variant="secondary" size="sm" className="flex items-center gap-1 text-[10px]">
                      <RotateCw size={10} /> Try Again
                    </Button>
                    <Button onClick={() => handleScore(true)} size="sm" className="flex items-center gap-1 text-[10px]">
                      <Check size={10} /> Got it Right!
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Analytics charts tab */}
        {activeTab === 'analytics' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card variant="white" className="space-y-4">
              <h3 className="font-bold text-slate-800 text-xs border-b border-slate-100 pb-2 flex items-center gap-1.5">
                <BarChart2 size={16} className="text-indigo-500" /> Study Hours distribution (Hours)
              </h3>
              <BarChart
                height={130}
                data={subjects.map((s) => ({
                  label: s,
                  value: Math.round(studyHours[s] || 0)
                }))}
              />
            </Card>

            <Card variant="white" className="space-y-4">
              <h3 className="font-bold text-slate-800 text-xs border-b border-slate-100 pb-2 flex items-center gap-1.5">
                <BarChart2 size={16} className="text-pink-500" /> Completed Assignments per Subject
              </h3>
              <LineChart
                height={130}
                data={subjects.map((s) => ({
                  label: s.substring(0, 8),
                  value: assignments.filter((a) => a.subject === s && a.done).length
                }))}
              />
            </Card>
          </div>
        )}
      </div>

      {/* Assignment Modal */}
      <Dialog
        isOpen={isAsgModalOpen}
        onClose={() => setIsAsgModalOpen(false)}
        title="Schedule Assignment 📝"
        footer={
          <div className="flex gap-2 justify-end w-full">
            <Button variant="ghost" onClick={() => setIsAsgModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveAssignment} variant="primary">Schedule</Button>
          </div>
        }
      >
        <form onSubmit={handleSaveAssignment} className="space-y-4">
          <Input
            label="Assignment Title"
            placeholder="Write lab report, solve page 12..."
            value={asgTitle}
            onChange={(e) => setAsgTitle(e.target.value)}
          />
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Course Subject"
              value={asgSubject}
              onChange={(e) => setAsgSubject(e.target.value)}
              options={subjects.map((s) => ({ value: s, label: s }))}
            />
            <Input
              label="Deadline Date"
              type="date"
              value={asgDeadline}
              onChange={(e) => setAsgDeadline(e.target.value)}
            />
          </div>
        </form>
      </Dialog>

      {/* Exam Modal */}
      <Dialog
        isOpen={isExamModalOpen}
        onClose={() => setIsExamModalOpen(false)}
        title="Register Upcoming Exam 📅"
        footer={
          <div className="flex gap-2 justify-end w-full">
            <Button variant="ghost" onClick={() => setIsExamModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveExam} variant="primary">Register Exam</Button>
          </div>
        }
      >
        <form onSubmit={handleSaveExam} className="space-y-4">
          <Input
            label="Exam Title"
            placeholder="Midterm, Finals, Chapter quiz..."
            value={examTitle}
            onChange={(e) => setExamTitle(e.target.value)}
          />
          <div className="grid grid-cols-3 gap-4">
            <Select
              label="Course Subject"
              value={examSubject}
              onChange={(e) => setExamSubject(e.target.value)}
              options={subjects.map((s) => ({ value: s, label: s }))}
            />
            <Input
              label="Exam Date"
              type="date"
              value={examDate}
              onChange={(e) => setExamDate(e.target.value)}
            />
            <Select
              label="Target Grade"
              value={examGrade}
              onChange={(e) => setExamGrade(e.target.value)}
              options={[
                { value: 'A+', label: 'A+' },
                { value: 'A', label: 'A' },
                { value: 'B', label: 'B' },
                { value: 'C', label: 'C' }
              ]}
            />
          </div>
        </form>
      </Dialog>

      {/* Flashcard Modal */}
      <Dialog
        isOpen={isFcModalOpen}
        onClose={() => setIsFcModalOpen(false)}
        title="Extend Flashcard Deck 🧠"
        footer={
          <div className="flex gap-2 justify-end w-full">
            <Button variant="ghost" onClick={() => setIsFcModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveFlashcard} variant="primary">Add Card</Button>
          </div>
        }
      >
        <form onSubmit={handleSaveFlashcard} className="space-y-4">
          <Select
            label="Course Subject"
            value={fcSubject}
            onChange={(e) => setFcSubject(e.target.value)}
            options={subjects.map((s) => ({ value: s, label: s }))}
          />
          <Input
            label="Question (Front)"
            placeholder="What is Euler's constant value?"
            value={fcQuestion}
            onChange={(e) => setFcQuestion(e.target.value)}
          />
          <Input
            label="Answer (Back)"
            placeholder="Approx. 2.718"
            value={fcAnswer}
            onChange={(e) => setFcAnswer(e.target.value)}
          />
        </form>
      </Dialog>
    </div>
  )
}
