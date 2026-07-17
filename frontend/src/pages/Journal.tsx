import React from 'react'

export const Journal: React.FC = () => {
  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Journal 📖</h1>
        <p className="text-slate-500 mt-1">Reflect on your day, track your mood, and save gratitude entries.</p>
      </div>

      <div className="glass-card-pink p-6 rounded-2xl flex items-center justify-center min-h-[300px]">
        <div className="text-center">
          <p className="text-slate-400">Journal entries and mood tracker placeholder.</p>
          <span className="text-xs text-pink-500 font-semibold">Under Development</span>
        </div>
      </div>
    </div>
  )
}
