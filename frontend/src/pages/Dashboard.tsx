import React from 'react'
import { Sparkles, Calendar, CheckSquare, TrendingUp, BrainCircuit } from 'lucide-react'
import { useAuthStore } from '../stores/authStore'

export const Dashboard: React.FC = () => {
  const { user } = useAuthStore()

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
            Welcome back, {user?.full_name || 'friend'} 🌸
          </h1>
          <p className="text-slate-500 mt-1">Here's an overview of your life today. Let's make it beautiful.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-gradient-pink-blue text-slate-800 font-semibold shadow-xs">
          <Sparkles size={16} className="text-pink-600 animate-pulse" />
          <span>Productivity Score: 92%</span>
        </div>
      </div>

      {/* Grid of Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* AI Insight Card - Lavender */}
        <div className="md:col-span-3 glass-card p-6 border-l-4 border-purple-400 rounded-2xl">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-purple-100 text-purple-700">
              <BrainCircuit size={20} />
            </div>
            <h3 className="font-bold text-slate-800 text-lg">AI Suggestions & Daily Planning</h3>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed">
            "You completed 80% of your habits yesterday. Today, prioritize studying for your exam and logging your expenses. You're doing great! Keep up the Pomodoro sessions to maintain focus."
          </p>
        </div>

        {/* Today's Tasks - Pink Theme */}
        <div className="glass-card-pink p-6 rounded-2xl">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <CheckSquare size={18} className="text-pink-600" />
              Today's Schedule
            </h3>
            <span className="text-xs font-semibold px-2 py-0.5 bg-pink-100 text-pink-700 rounded-full">3 left</span>
          </div>
          <div className="space-y-3">
            {[
              { id: 1, text: 'Complete Chapter 4 revision', done: false },
              { id: 2, text: 'Run 5km & Drink 3L water', done: true },
              { id: 3, text: 'Weekly finance review', done: false }
            ].map(task => (
              <div key={task.id} className="flex items-center gap-3 text-sm">
                <input
                  type="checkbox"
                  checked={task.done}
                  readOnly
                  className="rounded-sm border-pink-300 text-pink-500 focus:ring-pink-500"
                />
                <span className={task.done ? 'line-through text-slate-400' : 'text-slate-700'}>{task.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Habit Streaks - Blue Theme */}
        <div className="glass-card-blue p-6 rounded-2xl">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <Calendar size={18} className="text-sky-600" />
              Habits Streak
            </h3>
            <span className="text-xs font-semibold px-2 py-0.5 bg-sky-100 text-sky-700 rounded-full">5 Active</span>
          </div>
          <div className="space-y-3">
            {[
              { id: 1, name: 'Read 20 pages', streak: '12 days' },
              { id: 2, name: 'No sugar', streak: '5 days' },
              { id: 3, name: 'Morning meditation', streak: '8 days' }
            ].map(habit => (
              <div key={habit.id} className="flex justify-between items-center text-sm">
                <span className="text-slate-700 font-medium">{habit.name}</span>
                <span className="text-xs px-2 py-1 bg-sky-50 text-sky-700 rounded-lg font-bold">{habit.streak} 🔥</span>
              </div>
            ))}
          </div>
        </div>

        {/* Finance & Reading Tracker Widget - Combined Gray */}
        <div className="glass-card p-6 rounded-2xl">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <TrendingUp size={18} className="text-slate-600" />
              Overview
            </h3>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-600">Finance Budget (July)</span>
              <span className="font-bold text-emerald-600">$450.00 / $1000.00</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-1.5">
              <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: '45%' }}></div>
            </div>
            <div className="flex justify-between items-center text-sm mt-2">
              <span className="text-slate-600">Reading Progress</span>
              <span className="font-bold text-slate-700">Atomic Habits (65%)</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-1.5">
              <div className="bg-sky-400 h-1.5 rounded-full" style={{ width: '65%' }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
