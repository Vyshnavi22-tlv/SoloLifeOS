import React from 'react'

export const Calendar: React.FC = () => {
  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Calendar 📅</h1>
        <p className="text-slate-500 mt-1">Plan your daily, weekly, and monthly events.</p>
      </div>

      <div className="glass-card p-6 rounded-2xl flex items-center justify-center min-h-[300px]">
        <div className="text-center">
          <p className="text-slate-400">Calendar schedule content placeholder.</p>
          <span className="text-xs text-sky-500 font-semibold">Under Development</span>
        </div>
      </div>
    </div>
  )
}
