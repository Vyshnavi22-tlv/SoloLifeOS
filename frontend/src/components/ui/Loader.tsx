import React from 'react'

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  color?: 'sky' | 'pink' | 'purple' | 'white'
}

export const Spinner: React.FC<SpinnerProps> = ({
  size = 'md',
  color = 'sky'
}) => {
  const sizes = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4'
  }

  const colors = {
    sky: 'border-sky-500 border-t-transparent',
    pink: 'border-pink-500 border-t-transparent',
    purple: 'border-purple-500 border-t-transparent',
    white: 'border-white border-t-transparent'
  }

  return (
    <div className={`rounded-full animate-spin ${sizes[size]} ${colors[color]}`} />
  )
}

interface SkeletonProps {
  className?: string
}

export const SkeletonLine: React.FC<SkeletonProps> = ({ className = '' }) => {
  return (
    <div className={`animate-pulse bg-slate-200/80 rounded-lg h-4 w-full ${className}`} />
  )
}

export const SkeletonCard: React.FC = () => {
  return (
    <div className="border border-slate-200/50 p-6 rounded-2xl space-y-4 animate-pulse bg-white">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-slate-200" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-slate-200 rounded-sm w-1/3" />
          <div className="h-3 bg-slate-200 rounded-sm w-1/2" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-3 bg-slate-200 rounded-sm" />
        <div className="h-3 bg-slate-200 rounded-sm" />
        <div className="h-3 bg-slate-200 rounded-sm w-3/4" />
      </div>
    </div>
  )
}

export const SkeletonTable: React.FC = () => {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-10 bg-slate-100 rounded-xl" />
      {[1, 2, 3].map((n) => (
        <div key={n} className="flex gap-4 items-center px-4 py-3 border-b border-slate-100">
          <div className="h-4 bg-slate-200 rounded-sm flex-1" />
          <div className="h-4 bg-slate-200 rounded-sm flex-1" />
          <div className="h-4 bg-slate-200 rounded-sm w-20" />
        </div>
      ))}
    </div>
  )
}
