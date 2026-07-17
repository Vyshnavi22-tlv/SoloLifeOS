import React, { useState } from 'react'
import {
  TrendingUp,
  Calendar,
  CheckSquare,
  Target,
  GraduationCap,
  BookOpen,
  DollarSign,
  Smile,
  Activity,
  Award
} from 'lucide-react'
import { Card } from '../components/ui/Card'
import { BarChart, LineChart } from '../components/ui/Chart'

type ReportPeriod = 'weekly' | 'monthly' | 'yearly'

export const Analytics: React.FC = () => {
  const [period, setPeriod] = useState<ReportPeriod>('weekly')

  // Dynamic statistics mapping based on Period
  const periodData = {
    weekly: {
      productivityScore: 88,
      focusHours: 18.5,
      tasksDone: 14,
      habitsConsistency: 85,
      goalsProgress: 40,
      studyHours: 16,
      pagesRead: 145,
      netSavings: 2640,
      moodCounts: { '😄': 5, '😐': 2, '😞': 0 },
      studyBreakdown: [
        { label: 'CS', value: 8 },
        { label: 'Math', value: 5 },
        { label: 'Chem', value: 3 }
      ],
      cashflow: [
        { label: 'Income', value: 2850 },
        { label: 'Expense', value: 390 },
        { label: 'Net', value: 2460 }
      ]
    },
    monthly: {
      productivityScore: 82,
      focusHours: 72.0,
      tasksDone: 52,
      habitsConsistency: 78,
      goalsProgress: 55,
      studyHours: 64,
      pagesRead: 580,
      netSavings: 8400,
      moodCounts: { '😄': 18, '😐': 9, '😞': 3 },
      studyBreakdown: [
        { label: 'CS', value: 32 },
        { label: 'Math', value: 20 },
        { label: 'Chem', value: 12 }
      ],
      cashflow: [
        { label: 'Income', value: 11500 },
        { label: 'Expense', value: 1600 },
        { label: 'Net', value: 9900 }
      ]
    },
    yearly: {
      productivityScore: 85,
      focusHours: 850.5,
      tasksDone: 620,
      habitsConsistency: 81,
      goalsProgress: 75,
      studyHours: 710,
      pagesRead: 6400,
      netSavings: 96800,
      moodCounts: { '😄': 220, '😐': 115, '😞': 30 },
      studyBreakdown: [
        { label: 'CS', value: 350 },
        { label: 'Math', value: 240 },
        { label: 'Chem', value: 120 }
      ],
      cashflow: [
        { label: 'Income', value: 138000 },
        { label: 'Expense', value: 19200 },
        { label: 'Net', value: 118800 }
      ]
    }
  }

  const activeStats = periodData[period]

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
            OS Analytics Dashboard 📊
          </h1>
          <p className="text-slate-500 mt-1">Review aggregated reports on habits, finances, study plans, and goals.</p>
        </div>

        {/* Timeframe Switcher Tabs */}
        <div className="flex bg-slate-100 p-0.5 rounded-2xl w-full sm:w-auto">
          {(['weekly', 'monthly', 'yearly'] as ReportPeriod[]).map((t) => (
            <button
              key={t}
              onClick={() => setPeriod(t)}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all capitalize cursor-pointer ${
                period === t ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {t} Report
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Compound Productivity Score & Modules Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Productivity Compound Score Card */}
        <Card variant="glass" className="flex flex-col justify-between p-6 border border-slate-200/30 text-center space-y-6">
          <div className="space-y-2">
            <h3 className="font-extrabold text-slate-800 text-sm flex items-center justify-center gap-1.5">
              <Award className="text-sky-500" size={16} /> Productivity Score
            </h3>
            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Compound Performance Index</p>
          </div>

          <div className="relative flex items-center justify-center py-2">
            <div className="text-5xl font-black text-slate-850 tracking-tight">
              {activeStats.productivityScore}%
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center text-xs font-bold text-slate-700 pt-3 border-t border-slate-150/40">
            <div className="space-y-1">
              <p className="text-[9px] text-slate-400 font-semibold uppercase">Focus</p>
              <p className="font-black text-slate-800">{activeStats.focusHours.toFixed(0)}h</p>
            </div>
            <div className="space-y-1">
              <p className="text-[9px] text-slate-400 font-semibold uppercase">Tasks</p>
              <p className="font-black text-slate-800">+{activeStats.tasksDone}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[9px] text-slate-400 font-semibold uppercase">Consistency</p>
              <p className="font-black text-slate-800">{activeStats.habitsConsistency}%</p>
            </div>
          </div>
        </Card>

        {/* Modules stat widgets */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {[
            { label: 'Habits Consistency', value: `${activeStats.habitsConsistency}%`, details: 'Streak completions', icon: <CheckSquare className="text-emerald-500" size={16} /> },
            { label: 'Goals Milestones', value: `${activeStats.goalsProgress}%`, details: 'Progress met ratio', icon: <Target className="text-indigo-500" size={16} /> },
            { label: 'Study Volume', value: `${activeStats.studyHours}h`, details: 'Total focus hours log', icon: <GraduationCap className="text-sky-500" size={16} /> },
            { label: 'Reading Progress', value: `${activeStats.pagesRead} pages`, details: 'Pages finished', icon: <BookOpen className="text-pink-500" size={16} /> },
            { label: 'Finance Savings', value: `$${activeStats.netSavings}`, details: 'Net remaining cash', icon: <DollarSign className="text-emerald-500" size={16} /> },
            { label: 'Top Active Mood', value: '😄 Happy', details: `${activeStats.moodCounts['😄']} days logged`, icon: <Smile className="text-amber-500" size={16} /> }
          ].map((m, idx) => (
            <Card key={idx} variant="white" className="p-4 border border-slate-100 flex flex-col justify-between min-h-[110px]">
              <div className="flex justify-between items-start gap-4">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{m.label}</span>
                <span className="p-1 rounded-lg bg-slate-50 shrink-0">{m.icon}</span>
              </div>
              <div className="space-y-0.5">
                <h4 className="text-lg font-black text-slate-800">{m.value}</h4>
                <p className="text-[9px] text-slate-400 font-semibold">{m.details}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Visual Charts section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Study Hours breakdown */}
        <Card variant="white" className="space-y-4">
          <h3 className="font-bold text-slate-800 text-xs border-b border-slate-100 pb-2 flex items-center gap-1.5">
            <GraduationCap size={16} className="text-sky-500" /> Syllabus Study Hours distribution
          </h3>
          <BarChart height={140} data={activeStats.studyBreakdown} />
        </Card>

        {/* Finance Cashflow breakdown */}
        <Card variant="white" className="space-y-4">
          <h3 className="font-bold text-slate-800 text-xs border-b border-slate-100 pb-2 flex items-center gap-1.5">
            <DollarSign size={16} className="text-emerald-500" /> Cashflow Balance breakdown
          </h3>
          <LineChart height={140} data={activeStats.cashflow} />
        </Card>
      </div>

      {/* Mood breakdown & general notes summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Mood Distribution logs */}
        <Card variant="white" className="space-y-4">
          <h3 className="font-bold text-slate-800 text-xs border-b border-slate-100 pb-2 flex items-center gap-1.5">
            <Smile size={16} className="text-amber-500" /> Mood Log Count
          </h3>
          <div className="space-y-3">
            {Object.entries(activeStats.moodCounts).map(([mood, count]) => {
              const totalLogs = Object.values(activeStats.moodCounts).reduce((acc, c) => acc + c, 0) || 1
              const percent = Math.round((count / totalLogs) * 100)
              return (
                <div key={mood} className="space-y-1 text-xs">
                  <div className="flex justify-between font-bold text-slate-700">
                    <span>{mood} Frequency</span>
                    <span>{count} logs ({percent}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5">
                    <div
                      className="bg-amber-400 h-1.5 rounded-full"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </Card>

        {/* Aggregate Productivity summary */}
        <Card variant="white" className="lg:col-span-2 space-y-4">
          <h3 className="font-bold text-slate-800 text-xs border-b border-slate-100 pb-2 flex items-center gap-1.5">
            <Activity size={16} className="text-sky-500 animate-pulse" /> Periodic OS Summary Reports
          </h3>
          <div className="space-y-4 text-xs leading-relaxed text-slate-600 font-medium">
            <p>
              Your compound productivity score sits at <strong className="text-slate-800">{activeStats.productivityScore}%</strong>. Focus duration highlights consistent learning schedules with overall positive consistency across habits.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100 text-[10px] font-bold text-slate-500 uppercase tracking-wide">
              <div className="flex items-center gap-2">
                <Calendar size={14} className="text-sky-500" />
                <span>Period Timeframe: {period} report</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp size={14} className="text-emerald-500" />
                <span>Net Savings flow: positive flow</span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
export default Analytics
