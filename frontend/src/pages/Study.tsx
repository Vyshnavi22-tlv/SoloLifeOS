import React from 'react'

export const Study: React.FC = () => {
  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Study Planner 🎓</h1>
        <p className="text-slate-500 mt-1">Organize subjects, assignments, exams, and revision planners.</p>
      </div>

      <div className="glass-card p-6 rounded-2xl flex items-center justify-center min-h-[300px]">
        <div className="text-center">
          <p className="text-slate-400">Study planner agenda and exam tracker placeholder.</p>
          <span className="text-xs text-indigo-500 font-semibold">Under Development</span>
        </div>
      </div>
    </div>
  )
}
