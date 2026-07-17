import React from 'react'

export const Notes: React.FC = () => {
  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Notes 📝</h1>
        <p className="text-slate-500 mt-1">Rich-text notes with tags, markdown, and favorites support.</p>
      </div>

      <div className="glass-card p-6 rounded-2xl flex items-center justify-center min-h-[300px]">
        <div className="text-center">
          <p className="text-slate-400">Notes editor and search interface placeholder.</p>
          <span className="text-xs text-purple-500 font-semibold">Under Development</span>
        </div>
      </div>
    </div>
  )
}
