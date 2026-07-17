import React from 'react'

export const Goals: React.FC = () => {
  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Goals 🎯</h1>
        <p className="text-slate-500 mt-1">Track your long-term and short-term achievements.</p>
      </div>

      <div className="glass-card-pink p-6 rounded-2xl flex items-center justify-center min-h-[300px]">
        <div className="text-center">
          <p className="text-slate-400">Goals and progress content placeholder.</p>
          <span className="text-xs text-pink-500 font-semibold">Under Development</span>
        </div>
      </div>
    </div>
  )
}
