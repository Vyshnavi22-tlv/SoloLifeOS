import React from 'react'

export const Pomodoro: React.FC = () => {
  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Pomodoro Timer ⏱️</h1>
        <p className="text-slate-500 mt-1">Focus on tasks using custom focus and break session timers.</p>
      </div>

      <div className="glass-card p-6 rounded-2xl flex items-center justify-center min-h-[300px]">
        <div className="text-center">
          <p className="text-slate-400">Pomodoro circular focus countdown timer placeholder.</p>
          <span className="text-xs text-purple-500 font-semibold">Under Development</span>
        </div>
      </div>
    </div>
  )
}
