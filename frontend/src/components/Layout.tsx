import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  LayoutDashboard,
  Calendar,
  Target,
  CheckSquare,
  FileText,
  BookOpen,
  DollarSign,
  GraduationCap,
  Timer,
  BarChart2,
  Dumbbell,
  BookMarked,
  LogOut,
  Menu,
  X
} from 'lucide-react'
import { useAuthStore } from '../stores/authStore'

interface LayoutProps {
  children: React.ReactNode
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuthStore()
  const location = useLocation()
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/auth')
  }

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Calendar', path: '/calendar', icon: Calendar },
    { name: 'Goals', path: '/goals', icon: Target },
    { name: 'Habits', path: '/habits', icon: CheckSquare },
    { name: 'Notes', path: '/notes', icon: FileText },
    { name: 'Journal', path: '/journal', icon: BookOpen },
    { name: 'Finance', path: '/finance', icon: DollarSign },
    { name: 'Study Planner', path: '/study', icon: GraduationCap },
    { name: 'Reading Tracker', path: '/reading', icon: BookMarked },
    { name: 'Fitness', path: '/fitness', icon: Dumbbell },
    { name: 'Pomodoro', path: '/pomodoro', icon: Timer },
    { name: 'Analytics', path: '/analytics', icon: BarChart2 }
  ]

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/'
    }
    return location.pathname.startsWith(path)
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#fafafa]">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-64 glass-nav border-r border-slate-200/50 h-screen sticky top-0 z-30">
        <div className="p-6">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl font-bold bg-gradient-to-r from-sky-500 to-pink-500 bg-clip-text text-transparent">
              🌸 Solo Life OS
            </span>
          </Link>
        </div>

        <nav className="flex-1 px-4 py-2 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.path)
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  active
                    ? 'bg-gradient-to-r from-sky-100 to-pink-100 text-slate-800 font-semibold shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100/50 hover:text-slate-800'
                }`}
              >
                <Icon size={18} className={active ? 'text-sky-500' : 'text-slate-400'} />
                <span className="text-sm">{item.name}</span>
              </Link>
            )
          })}
        </nav>

        {/* User profile section in Sidebar */}
        <div className="p-4 border-t border-slate-200/50 flex flex-col gap-2">
          {user && (
            <div className="flex items-center gap-3 px-2 py-2">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-sky-300 to-pink-300 flex items-center justify-center text-white font-semibold">
                {user.full_name ? user.full_name[0].toUpperCase() : user.email[0].toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-slate-700 truncate">
                  {user.full_name || 'Solo User'}
                </p>
                <p className="text-[10px] text-slate-500 truncate">{user.email}</p>
              </div>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-slate-600 hover:bg-rose-50 hover:text-rose-600 transition-all duration-200 text-sm"
          >
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Header - Mobile */}
      <header className="md:hidden glass-nav h-16 sticky top-0 flex items-center justify-between px-6 z-30 w-full border-b border-slate-200/50">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-lg font-bold bg-gradient-to-r from-sky-500 to-pink-500 bg-clip-text text-transparent">
            🌸 Solo Life OS
          </span>
        </Link>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </header>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-16 bg-white/95 backdrop-blur-md z-20 flex flex-col transition-all duration-300">
          <nav className="flex-1 px-6 py-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon
              const active = isActive(item.path)
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-200 ${
                    active
                      ? 'bg-gradient-to-r from-sky-100 to-pink-100 text-slate-800 font-semibold'
                      : 'text-slate-600'
                  }`}
                >
                  <Icon size={20} className={active ? 'text-sky-500' : 'text-slate-400'} />
                  <span>{item.name}</span>
                </Link>
              )
            })}
          </nav>
          <div className="p-6 border-t border-slate-200/50 flex flex-col gap-3">
            {user && (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-sky-300 to-pink-300 flex items-center justify-center text-white font-semibold">
                  {user.full_name ? user.full_name[0].toUpperCase() : user.email[0].toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-700">
                    {user.full_name || 'Solo User'}
                  </p>
                  <p className="text-xs text-slate-500">{user.email}</p>
                </div>
              </div>
            )}
            <button
              onClick={() => {
                setMobileMenuOpen(false)
                handleLogout()
              }}
              className="flex items-center justify-center gap-3 w-full py-3 rounded-xl bg-rose-50 text-rose-600 font-medium hover:bg-rose-100 transition-colors"
            >
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto max-w-full">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.25, ease: 'easeInOut' }}
        >
          {children}
        </motion.div>
      </main>
    </div>
  )
}
