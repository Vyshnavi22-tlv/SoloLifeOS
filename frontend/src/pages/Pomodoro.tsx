import React, { useState, useEffect } from 'react'
import {
  Play,
  Pause,
  RotateCcw,
  Coffee,
  Brain,
  Settings,
  CheckCircle,
  Volume2,
  VolumeX
} from 'lucide-react'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Dialog } from '../components/ui/Dialog'
import { useToastStore } from '../stores/toastStore'

interface SessionLog {
  timestamp: string
  mode: 'focus' | 'short_break' | 'long_break'
  duration: number // minutes
}

export const Pomodoro: React.FC = () => {
  const { addToast } = useToastStore()

  // Durations (in seconds)
  const [focusDur, setFocusDur] = useState(1500) // 25 mins
  const [shortDur, setShortDur] = useState(300)   // 5 mins
  const [longDur, setLongDur] = useState(900)   // 15 mins

  // Mode state
  const [mode, setMode] = useState<'focus' | 'short_break' | 'long_break'>('focus')
  const [timeLeft, setTimeLeft] = useState(focusDur)
  const [isRunning, setIsRunning] = useState(false)

  // Audio state
  const [soundEnabled, setSoundEnabled] = useState(true)

  // Auto-start preferences
  const [autoStartBreak, setAutoStartBreak] = useState(false)
  const [autoStartFocus, setAutoStartFocus] = useState(false)

  // Statistics
  const [sessionLogs, setSessionLogs] = useState<SessionLog[]>([
    { timestamp: new Date(Date.now() - 3600000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), mode: 'focus', duration: 25 },
    { timestamp: new Date(Date.now() - 3300000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), mode: 'short_break', duration: 5 }
  ])

  // Custom durations modal
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [tempFocus, setTempFocus] = useState('25')
  const [tempShort, setTempShort] = useState('5')
  const [tempLong, setTempLong] = useState('15')

  // Synthesize alarm beep using Web Audio API (so it works offline without assets)
  const playBeep = () => {
    if (!soundEnabled) return
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)()
      const oscillator = audioCtx.createOscillator()
      const gainNode = audioCtx.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioCtx.destination)

      oscillator.type = 'sine'
      oscillator.frequency.value = 880 // A5 pitch
      gainNode.gain.setValueAtTime(0.5, audioCtx.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 1.2)

      oscillator.start()
      oscillator.stop(audioCtx.currentTime + 1.2)
    } catch {
      // Audio context block safeguard
    }
  }

  // Handle timer completion
  const handleTimerExpiry = () => {
    setIsRunning(false)
    playBeep()

    const durationMins = Math.round((mode === 'focus' ? focusDur : mode === 'short_break' ? shortDur : longDur) / 60)
    const logItem: SessionLog = {
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      mode,
      duration: durationMins
    }
    setSessionLogs([logItem, ...sessionLogs])

    if (mode === 'focus') {
      addToast('🍅 Focus Interval Completed! Time for a break.', 'success')
      // Switch mode
      const nextMode = sessionLogs.filter((s) => s.mode === 'focus').length % 4 === 3 ? 'long_break' : 'short_break'
      setMode(nextMode)
      setTimeLeft(nextMode === 'short_break' ? shortDur : longDur)
      if (autoStartBreak) {
        setTimeout(() => setIsRunning(true), 200)
      }
    } else {
      addToast('☕ Break over! Let\'s focus.', 'success')
      setMode('focus')
      setTimeLeft(focusDur)
      if (autoStartFocus) {
        setTimeout(() => setIsRunning(true), 200)
      }
    }
  }

  // Timer Tick
  useEffect(() => {
    let interval: any = null
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1)
      }, 1000)
    } else if (timeLeft === 0) {
      handleTimerExpiry()
    }
    return () => clearInterval(interval)
  }, [isRunning, timeLeft])

  // Change mode manual reset
  const handleModeChange = (newMode: typeof mode) => {
    setIsRunning(false)
    setMode(newMode)
    setTimeLeft(newMode === 'focus' ? focusDur : newMode === 'short_break' ? shortDur : longDur)
  }

  const toggleTimer = () => {
    setIsRunning(!isRunning)
    addToast(isRunning ? 'Timer paused' : 'Timer started! Stay focused.', 'info')
  }

  const resetTimer = () => {
    setIsRunning(false)
    setTimeLeft(mode === 'focus' ? focusDur : mode === 'short_break' ? shortDur : longDur)
    addToast('Timer reset', 'info')
  }

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60)
    const s = secs % 60
    return `${m}:${s < 10 ? '0' : ''}${s}`
  }

  const applyCustomSettings = (e: React.FormEvent) => {
    e.preventDefault()
    const fMins = parseInt(tempFocus)
    const sMins = parseInt(tempShort)
    const lMins = parseInt(tempLong)

    if (isNaN(fMins) || isNaN(sMins) || isNaN(lMins) || fMins <= 0 || sMins <= 0 || lMins <= 0) {
      addToast('Please enter valid numeric minutes', 'warning')
      return
    }

    setFocusDur(fMins * 60)
    setShortDur(sMins * 60)
    setLongDur(lMins * 60)

    // Apply to current mode if not running
    if (!isRunning) {
      setTimeLeft(mode === 'focus' ? fMins * 60 : mode === 'short_break' ? sMins * 60 : lMins * 60)
    }

    setIsSettingsOpen(false)
    addToast('Pomodoro durations customized!', 'success')
  }

  // Stats sums
  const totalFocusMins = sessionLogs
    .filter((s) => s.mode === 'focus')
    .reduce((acc, s) => acc + s.duration, 0)

  const completedCycles = sessionLogs.filter((s) => s.mode === 'focus').length

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
            Pomodoro Focus 🍅
          </h1>
          <p className="text-slate-500 mt-1">Use focus intervals and breaks to optimize work efficiency.</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="flex items-center gap-1.5"
          >
            {soundEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
            <span>{soundEnabled ? 'Sound On' : 'Muted'}</span>
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsSettingsOpen(true)}
            className="flex items-center gap-1.5"
          >
            <Settings size={14} />
            <span>Customize</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Main circular countdown clock block */}
        <div className="lg:col-span-2 space-y-6">
          <Card
            variant={mode === 'focus' ? 'white' : 'glass-blue'}
            className="p-12 flex flex-col items-center justify-center gap-8 border border-slate-150 relative overflow-hidden"
          >
            {/* Mode selection buttons */}
            <div className="flex bg-slate-100/80 p-0.5 rounded-2xl max-w-xs w-full">
              {[
                { label: 'Focus', val: 'focus', icon: <Brain size={12} /> },
                { label: 'Short Break', val: 'short_break', icon: <Coffee size={12} /> },
                { label: 'Long Break', val: 'long_break', icon: <Coffee size={12} /> }
              ].map((m) => (
                <button
                  key={m.val}
                  onClick={() => handleModeChange(m.val as any)}
                  className={`flex-1 py-1.5 rounded-xl text-[10px] font-extrabold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                    mode === m.val ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {m.icon}
                  {m.label}
                </button>
              ))}
            </div>

            {/* Time representation display */}
            <div className="flex flex-col items-center justify-center space-y-2">
              <span className="text-6xl font-black text-slate-850 tracking-widest leading-none select-none">
                {formatTime(timeLeft)}
              </span>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                {mode === 'focus' ? '🍅 focus interval' : '☕ break session'}
              </span>
            </div>

            {/* Controls */}
            <div className="flex gap-4 max-w-xs w-full">
              <Button onClick={toggleTimer} className="flex-1 font-black">
                {isRunning ? <Pause size={14} className="mr-1" /> : <Play size={14} className="mr-1" />}
                {isRunning ? 'Pause' : 'Start Focus'}
              </Button>
              <Button onClick={resetTimer} variant="ghost" className="px-4 border border-slate-200">
                <RotateCcw size={14} />
              </Button>
            </div>

            {/* Auto Start Toggles */}
            <div className="flex gap-6 border-t border-slate-100 pt-6 mt-2 w-full justify-center text-xs font-semibold text-slate-500">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={autoStartBreak}
                  onChange={(e) => setAutoStartBreak(e.target.checked)}
                  className="rounded-sm accent-sky-500 cursor-pointer"
                />
                <span>Auto-start Breaks</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={autoStartFocus}
                  onChange={(e) => setAutoStartFocus(e.target.checked)}
                  className="rounded-sm accent-sky-500 cursor-pointer"
                />
                <span>Auto-start Focus</span>
              </label>
            </div>
          </Card>
        </div>

        {/* Sidebar logs stats */}
        <div className="space-y-6">
          {/* Daily cycle stats */}
          <Card variant="white" className="space-y-4">
            <h3 className="font-bold text-slate-800 text-xs border-b border-slate-100 pb-2">Focus Analytics</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-slate-50 border border-slate-150 rounded-2xl text-center space-y-1">
                <p className="text-xl font-black text-slate-850">{completedCycles}</p>
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Completed Cycles</p>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-150 rounded-2xl text-center space-y-1">
                <p className="text-xl font-black text-slate-850">{totalFocusMins}m</p>
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Total Focus Time</p>
              </div>
            </div>
          </Card>

          {/* Session history ledger logs */}
          <Card variant="white" className="space-y-4">
            <h3 className="font-bold text-slate-800 text-xs border-b border-slate-100 pb-2 flex items-center gap-1.5">
              <CheckCircle size={14} className="text-emerald-500" /> Focus Session History
            </h3>
            <div className="space-y-3 max-h-56 overflow-y-auto scrollbar-thin">
              {sessionLogs.length === 0 ? (
                <p className="text-[10px] text-slate-450 italic text-center py-6">No focus cycles logged today.</p>
              ) : (
                sessionLogs.map((log, idx) => (
                  <div key={idx} className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl flex justify-between items-center text-xs font-semibold text-slate-600">
                    <div className="flex items-center gap-2">
                      <span className="text-xs">
                        {log.mode === 'focus' ? '🍅' : '☕'}
                      </span>
                      <div>
                        <p className="text-[10px] font-bold text-slate-700 uppercase">
                          {log.mode.replace('_', ' ')}
                        </p>
                        <p className="text-[8px] text-slate-400 font-medium">{log.timestamp}</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-black text-slate-800">{log.duration} mins</span>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Customize Durations Dialog Settings */}
      <Dialog
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        title="Customize Pomodoro Durations ⚙️"
        footer={
          <div className="flex gap-2 justify-end w-full">
            <Button variant="ghost" onClick={() => setIsSettingsOpen(false)}>Cancel</Button>
            <Button onClick={applyCustomSettings} variant="primary">Apply Durations</Button>
          </div>
        }
      >
        <form onSubmit={applyCustomSettings} className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-500">Focus (Mins)</label>
              <input
                type="number"
                value={tempFocus}
                onChange={(e) => setTempFocus(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-hidden text-slate-850 font-bold"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-500">Short Break (Mins)</label>
              <input
                type="number"
                value={tempShort}
                onChange={(e) => setTempShort(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-hidden text-slate-850 font-bold"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-500">Long Break (Mins)</label>
              <input
                type="number"
                value={tempLong}
                onChange={(e) => setTempLong(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-hidden text-slate-850 font-bold"
              />
            </div>
          </div>
        </form>
      </Dialog>
    </div>
  )
}
