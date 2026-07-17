import React from 'react'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'white' | 'blue' | 'pink' | 'lavender' | 'glass' | 'glass-blue' | 'glass-pink'
  hoverEffect?: boolean
  children: React.ReactNode
}

export const Card: React.FC<CardProps> = ({
  variant = 'white',
  hoverEffect = false,
  children,
  className = '',
  ...props
}) => {
  const baseStyles = 'rounded-2xl p-6 transition-all duration-300'

  const variants = {
    white: 'bg-white border border-slate-200/50 shadow-xs',
    blue: 'bg-sky-50/50 border border-sky-100/50 shadow-xs',
    pink: 'bg-pink-50/50 border border-pink-100/50 shadow-xs',
    lavender: 'bg-purple-50/50 border border-purple-100/50 shadow-xs',
    glass: 'glass-card',
    'glass-blue': 'glass-card-blue',
    'glass-pink': 'glass-card-pink'
  }

  const hoverStyle = hoverEffect
    ? 'hover:-translate-y-1 hover:shadow-md'
    : ''

  return (
    <div
      className={`${baseStyles} ${variants[variant]} ${hoverStyle} ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}
