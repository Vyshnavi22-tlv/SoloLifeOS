import React, { useState, useRef, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
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
  X,
  Search,
  Bell,
  ChevronRight,
  ListTodo,
  Sparkles,
  Settings as SettingsIcon
} from 'lucide-react'
import { useAuthStore } from '../stores/authStore'
import { useToastStore } from '../stores/toastStore'
import { Button } from './ui/Button'

interface LayoutProps {
  children: React.ReactNode
}

interface NotificationItem {
  id: string
  title: string
  time: string
  unread: boolean
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuthStore()
  const { addToast } = useToastStore()
  const location = useLocation()
  const navigate = useNavigate()

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  // Global Command Palette & Quick Add States
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false)
  const [quickAddType, setQuickAddType] = useState<'none' | 'task' | 'note' | 'expense' | 'habit'>('none')
  const [quickInputVal1, setQuickInputVal1] = useState('')
  const [quickInputVal2, setQuickInputVal2] = useState('')

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setCommandPaletteOpen(prev => !prev)
        setQuickAddType('none')
        setQuickInputVal1('')
        setQuickInputVal2('')
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const handleQuickAddTask = (e: React.FormEvent) => {
    e.preventDefault()
    if (!quickInputVal1.trim()) return
    const newTask = {
      id: `task-${Math.random().toString(36).substr(2, 9)}`,
      title: quickInputVal1.trim(),
      status: 'todo',
      project: 'Inbox',
      priority: 'medium',
      subtasks: [],
      recurrence: 'none'
    }
    const current = JSON.parse(localStorage.getItem('sololifeos_quick_tasks') || '[]')
    localStorage.setItem('sololifeos_quick_tasks', JSON.stringify([...current, newTask]))
    addToast(`Task "${newTask.title}" queued for import!`, 'success')
    setQuickInputVal1('')
    setQuickAddType('none')
    setCommandPaletteOpen(false)
  }

  const handleQuickAddNote = (e: React.FormEvent) => {
    e.preventDefault()
    if (!quickInputVal1.trim()) return
    const newNote = {
      id: `note-${Math.random().toString(36).substr(2, 9)}`,
      title: quickInputVal1.trim(),
      content: quickInputVal2.trim() || 'No content.',
      folder: 'Personal',
      tags: ['Quick'],
      pinned: false,
      updatedAt: new Date().toLocaleString(),
      versions: []
    }
    const current = JSON.parse(localStorage.getItem('sololifeos_quick_notes') || '[]')
    localStorage.setItem('sololifeos_quick_notes', JSON.stringify([...current, newNote]))
    addToast(`Note "${newNote.title}" queued for import!`, 'success')
    setQuickInputVal1('')
    setQuickInputVal2('')
    setQuickAddType('none')
    setCommandPaletteOpen(false)
  }

  const handleQuickAddExpense = (e: React.FormEvent) => {
    e.preventDefault()
    const amt = parseFloat(quickInputVal1)
    if (isNaN(amt) || amt <= 0) {
      addToast('Please enter a valid amount', 'warning')
      return
    }
    const newTx = {
      id: `t-${Math.random().toString(36).substr(2, 9)}`,
      date: new Date().toISOString().split('T')[0],
      description: quickInputVal2.trim() || 'Quick Expense',
      type: 'expense',
      category: 'Food',
      amount: amt
    }
    const current = JSON.parse(localStorage.getItem('sololifeos_quick_expenses') || '[]')
    localStorage.setItem('sololifeos_quick_expenses', JSON.stringify([...current, newTx]))
    addToast(`Expense of $${amt} logged successfully!`, 'success')
    setQuickInputVal1('')
    setQuickInputVal2('')
    setQuickAddType('none')
    setCommandPaletteOpen(false)
  }

  const handleQuickAddHabit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!quickInputVal1.trim()) return
    const newHabit = {
      id: `h-${Math.random().toString(36).substr(2, 9)}`,
      name: quickInputVal1.trim(),
      category: 'health',
      frequency: 'daily',
      streak: 0,
      bestStreak: 0,
      reminderTime: 'none',
      completions: [],
      missedYesterday: false
    }
    const current = JSON.parse(localStorage.getItem('sololifeos_quick_habits') || '[]')
    localStorage.setItem('sololifeos_quick_habits', JSON.stringify([...current, newHabit]))
    addToast(`Habit "${newHabit.name}" logged successfully!`, 'success')
    setQuickInputVal1('')
    setQuickAddType('none')
    setCommandPaletteOpen(false)
  }

  // Refs for closing dropdowns on click outside
  const profileRef = useRef<HTMLDivElement>(null)
  const notificationsRef = useRef<HTMLDivElement>(null)

  const [notifications, setNotifications] = useState<NotificationItem[]>([
    { id: '1', title: '🌸 Time for morning meditation!', time: '10m ago', unread: true },
    { id: '2', title: '🏋️ Workout log: Drink 3L water today', time: '1h ago', unread: true },
    { id: '3', title: '💵 Monthly budget check reminder', time: '5h ago', unread: false }
  ])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false)
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/auth')
  }

  const markAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, unread: false })))
    addToast('All notifications marked as read', 'success')
  }

  const clearNotification = (id: string) => {
    setNotifications(notifications.filter(n => n.id !== id))
  }

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Calendar', path: '/calendar', icon: Calendar },
    { name: 'Tasks', path: '/tasks', icon: ListTodo },
    { name: 'Goals', path: '/goals', icon: Target },
    { name: 'Habits', path: '/habits', icon: CheckSquare },
    { name: 'Notes', path: '/notes', icon: FileText },
    { name: 'Journal', path: '/journal', icon: BookOpen },
    { name: 'Finance', path: '/finance', icon: DollarSign },
    { name: 'Study Planner', path: '/study', icon: GraduationCap },
    { name: 'Reading Tracker', path: '/reading', icon: BookMarked },
    { name: 'Fitness', path: '/fitness', icon: Dumbbell },
    { name: 'Pomodoro', path: '/pomodoro', icon: Timer },
    { name: 'Analytics', path: '/analytics', icon: BarChart2 },
    { name: 'AI Assistant', path: '/ai-assistant', icon: Sparkles },
    { name: 'Settings', path: '/settings', icon: SettingsIcon }
  ]

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/'
    }
    return location.pathname.startsWith(path)
  }

  // Dynamic Breadcrumb computation
  const getBreadcrumbs = () => {
    const paths = location.pathname.split('/').filter(p => p)
    if (paths.length === 0) return [{ name: 'Home', path: '/' }, { name: 'Dashboard', path: '/' }]
    
    const crumbs = [{ name: 'Home', path: '/' }]
    let currentPath = ''
    paths.forEach((p) => {
      currentPath += `/${p}`
      const navItem = navItems.find(item => item.path === currentPath)
      crumbs.push({
        name: navItem ? navItem.name : p.charAt(0).toUpperCase() + p.slice(1),
        path: currentPath
      })
    })
    return crumbs
  }

  const breadcrumbs = getBreadcrumbs()
  const unreadCount = notifications.filter(n => n.unread).length

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#fafafa]">
      {/* Sidebar - Desktop / Tablet */}
      <aside className="hidden md:flex flex-col w-64 glass-nav border-r border-slate-200/50 h-screen sticky top-0 z-30 shrink-0">
        <div className="p-6">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl font-bold bg-gradient-to-r from-sky-500 via-purple-400 to-pink-500 bg-clip-text text-transparent">
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

        {/* Quick User Avatar footer in Sidebar */}
        <div className="p-4 border-t border-slate-200/50">
          <Link
            to="/settings"
            className="flex items-center gap-3 px-2 py-2 hover:bg-slate-100/50 rounded-xl transition-colors"
          >
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-sky-300 to-pink-300 flex items-center justify-center text-white font-semibold shrink-0">
              {user?.full_name ? user.full_name[0].toUpperCase() : 'S'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-700 truncate">
                {user?.full_name || 'Solo User'}
              </p>
              <p className="text-[10px] text-slate-500 truncate">{user?.email}</p>
            </div>
          </Link>
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navigation / Header */}
        <header className="glass-nav h-16 sticky top-0 flex items-center justify-between px-6 z-40 w-full border-b border-slate-200/50">
          {/* Left: Breadcrumbs or mobile brand */}
          <div className="flex items-center gap-3">
            {/* Hamburger for mobile */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            {/* Breadcrumb path for desktop/tablet */}
            <nav className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-slate-500">
              {breadcrumbs.map((crumb, idx) => (
                <React.Fragment key={crumb.path + idx}>
                  {idx > 0 && <ChevronRight size={12} className="text-slate-300" />}
                  {idx === breadcrumbs.length - 1 ? (
                    <span className="text-slate-800">{crumb.name}</span>
                  ) : (
                    <Link to={crumb.path} className="hover:text-slate-700 transition-colors">
                      {crumb.name}
                    </Link>
                  )}
                </React.Fragment>
              ))}
            </nav>

            <span className="sm:hidden font-bold text-slate-800 text-sm">
              {breadcrumbs[breadcrumbs.length - 1]?.name}
            </span>
          </div>

          {/* Right: Search + Notifications + Profile */}
          <div className="flex items-center gap-3">
            {/* Search Input Bar */}
            <div className="hidden sm:flex items-center relative">
              <Search className="absolute left-3 text-slate-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Global Search (Ctrl + K)..."
                readOnly
                onClick={() => setCommandPaletteOpen(true)}
                className="w-48 lg:w-64 pl-9 pr-4 py-1.5 bg-slate-100/80 hover:bg-slate-100 border border-transparent focus:border-slate-200 rounded-xl text-xs focus:outline-hidden transition-all text-slate-700 cursor-pointer"
              />
            </div>

            {/* Notifications Menu */}
            <div className="relative" ref={notificationsRef}>
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="p-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors relative cursor-pointer"
              >
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full animate-pulse" />
                )}
              </button>

              <AnimatePresence>
                {notificationsOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-80 bg-white border border-slate-200/50 rounded-2xl shadow-xl p-4 flex flex-col gap-3 z-50"
                  >
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <h4 className="font-bold text-slate-800 text-sm">Notifications</h4>
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllRead}
                          className="text-[10px] font-bold text-sky-500 hover:text-sky-600 cursor-pointer"
                        >
                          Mark all read
                        </button>
                      )}
                    </div>

                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <p className="text-center text-xs text-slate-400 py-6">No notifications</p>
                      ) : (
                        notifications.map((item) => (
                          <div
                            key={item.id}
                            className={`flex justify-between items-start gap-2 p-2.5 rounded-xl border text-xs transition-colors ${
                              item.unread
                                ? 'bg-sky-50/20 border-sky-100/50'
                                : 'bg-slate-50/50 border-slate-100/50'
                            }`}
                          >
                            <div className="flex-1">
                              <p className="font-medium text-slate-700">{item.title}</p>
                              <span className="text-[10px] text-slate-400 mt-1 block">{item.time}</span>
                            </div>
                            <button
                              onClick={() => clearNotification(item.id)}
                              className="text-slate-400 hover:text-slate-600 cursor-pointer"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Profile Dropdown */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="w-8 h-8 rounded-full bg-gradient-to-tr from-sky-300 to-pink-300 flex items-center justify-center text-white font-semibold text-sm cursor-pointer shadow-xs border border-white"
              >
                {user?.full_name ? user.full_name[0].toUpperCase() : 'S'}
              </button>

              <AnimatePresence>
                {profileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-56 bg-white border border-slate-200/50 rounded-2xl shadow-xl p-4 flex flex-col gap-2 z-50"
                  >
                    <div className="border-b border-slate-100 pb-3">
                      <p className="font-bold text-slate-800 text-sm truncate">
                        {user?.full_name || 'Solo User'}
                      </p>
                      <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                    </div>

                    <Link
                      to="/settings"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2 p-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
                    >
                      <SettingsIcon size={14} />
                      <span>Account Settings</span>
                    </Link>

                    <button
                      onClick={() => {
                        setProfileOpen(false)
                        handleLogout()
                      }}
                      className="flex items-center gap-2 p-2 w-full text-left text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                    >
                      <LogOut size={14} />
                      <span>Logout</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Mobile Navigation Drawer Overlay */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <>
              {/* Overlay Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.3 }}
                exit={{ opacity: 0 }}
                onClick={() => setMobileMenuOpen(false)}
                className="md:hidden fixed inset-0 bg-slate-900 z-40"
              />

              {/* Drawer Container */}
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'tween', duration: 0.25 }}
                className="md:hidden fixed inset-y-0 left-0 w-64 bg-white/95 backdrop-blur-md border-r border-slate-200/50 z-50 flex flex-col h-full"
              >
                <div className="p-6 flex items-center justify-between border-b border-slate-100">
                  <span className="text-lg font-bold bg-gradient-to-r from-sky-500 via-purple-400 to-pink-500 bg-clip-text text-transparent">
                    🌸 Solo Life OS
                  </span>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 rounded-lg transition-colors cursor-pointer"
                  >
                    <X size={20} />
                  </button>
                </div>

                <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
                  {navItems.map((item) => {
                    const Icon = item.icon
                    const active = isActive(item.path)
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 ${
                          active
                            ? 'bg-gradient-to-r from-sky-100 to-pink-100 text-slate-800 font-semibold'
                            : 'text-slate-600 hover:bg-slate-100/50 hover:text-slate-800'
                        }`}
                      >
                        <Icon size={20} className={active ? 'text-sky-500' : 'text-slate-400'} />
                        <span className="text-sm">{item.name}</span>
                      </Link>
                    );
                  })}
                </nav>

                <div className="p-4 border-t border-slate-200/50 flex flex-col gap-3">
                  {user && (
                    <div className="flex items-center gap-3 px-2 py-1">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-sky-300 to-pink-300 flex items-center justify-center text-white font-semibold">
                        {user.full_name ? user.full_name[0].toUpperCase() : user.email[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-700">
                          {user.full_name || 'Solo User'}
                        </p>
                        <p className="text-[10px] text-slate-500">{user.email}</p>
                      </div>
                    </div>
                  )}
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false)
                      handleLogout()
                    }}
                    className="flex items-center justify-center gap-3 w-full py-3 rounded-xl bg-rose-50 text-rose-600 font-medium hover:bg-rose-100 transition-colors cursor-pointer text-sm"
                  >
                    <LogOut size={16} />
                    <span>Logout</span>
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

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

      {/* Global Command Palette Overlay */}
      <AnimatePresence>
        {commandPaletteOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setCommandPaletteOpen(false)
                setQuickAddType('none')
              }}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50"
            />

            {/* Palette Container */}
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className="fixed top-24 left-1/2 -translate-x-1/2 w-full max-w-lg bg-white/90 backdrop-blur-md border border-slate-200/50 rounded-3xl shadow-2xl z-50 overflow-hidden"
            >
              {quickAddType === 'none' ? (
                <div className="p-4 space-y-4">
                  {/* Search Bar */}
                  <div className="relative flex items-center">
                    <Search className="absolute left-4 text-slate-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Type a command or module name..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      autoFocus
                      className="w-full pl-12 pr-4 py-3 bg-slate-100/50 hover:bg-slate-100/80 rounded-2xl text-sm focus:outline-hidden text-slate-800 font-medium"
                    />
                  </div>

                  {/* Actions & Modules */}
                  <div className="space-y-2">
                    <h5 className="text-[10px] uppercase font-bold tracking-wider text-slate-400 px-2">Quick Actions</h5>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => { setQuickAddType('task'); setQuickInputVal1(''); }}
                        className="p-3 bg-slate-50 hover:bg-sky-50/50 border border-slate-100 rounded-2xl text-left cursor-pointer transition-colors"
                      >
                        <div className="font-bold text-slate-800 text-xs">📝 Quick Add Task</div>
                        <div className="text-[9px] text-slate-400 mt-0.5">Add task to your checklist</div>
                      </button>
                      <button
                        onClick={() => { setQuickAddType('note'); setQuickInputVal1(''); setQuickInputVal2(''); }}
                        className="p-3 bg-slate-50 hover:bg-pink-50/50 border border-slate-100 rounded-2xl text-left cursor-pointer transition-colors"
                      >
                        <div className="font-bold text-slate-800 text-xs">📄 Quick Add Note</div>
                        <div className="text-[9px] text-slate-400 mt-0.5">Write a quick thoughts card</div>
                      </button>
                      <button
                        onClick={() => { setQuickAddType('expense'); setQuickInputVal1(''); setQuickInputVal2(''); }}
                        className="p-3 bg-slate-50 hover:bg-amber-50/50 border border-slate-100 rounded-2xl text-left cursor-pointer transition-colors"
                      >
                        <div className="font-bold text-slate-800 text-xs">💰 Log Expense</div>
                        <div className="text-[9px] text-slate-400 mt-0.5">Track today cash purchases</div>
                      </button>
                      <button
                        onClick={() => { setQuickAddType('habit'); setQuickInputVal1(''); }}
                        className="p-3 bg-slate-50 hover:bg-indigo-50/50 border border-slate-100 rounded-2xl text-left cursor-pointer transition-colors"
                      >
                        <div className="font-bold text-slate-800 text-xs">✨ Track Habit</div>
                        <div className="text-[9px] text-slate-400 mt-0.5">Add new daily checkbox habit</div>
                      </button>
                    </div>
                  </div>

                  {/* Modules Jumps */}
                  <div className="space-y-1">
                    <h5 className="text-[10px] uppercase font-bold tracking-wider text-slate-400 px-2 mb-2">Jump to Modules</h5>
                    <div className="max-h-48 overflow-y-auto space-y-1 scrollbar-thin">
                      {navItems
                        .filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()))
                        .map(item => {
                          const Icon = item.icon
                          return (
                            <button
                              key={item.path}
                              onClick={() => {
                                navigate(item.path)
                                setCommandPaletteOpen(false)
                              }}
                              className="w-full flex items-center gap-3 p-2 hover:bg-slate-50 rounded-xl text-left text-xs font-semibold text-slate-700 cursor-pointer transition-colors"
                            >
                              <Icon size={16} className="text-slate-400" />
                              <span>{item.name}</span>
                            </button>
                          )
                        })}
                    </div>
                  </div>

                  {/* Footer metadata info */}
                  <div className="text-[10px] text-slate-400 flex justify-between border-t border-slate-100 pt-3 px-2">
                    <span>Press <kbd className="px-1 py-0.5 bg-slate-100 rounded-sm font-black">Esc</kbd> to exit</span>
                    <span>Use <kbd className="px-1 py-0.5 bg-slate-100 rounded-sm font-black">Ctrl + K</kbd> anywhere</span>
                  </div>
                </div>
              ) : (
                <div className="p-5 space-y-4">
                  {quickAddType === 'task' && (
                    <form onSubmit={handleQuickAddTask} className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h4 className="font-extrabold text-slate-800 text-sm">📝 Create Task</h4>
                        <button type="button" onClick={() => setQuickAddType('none')} className="text-slate-400 hover:text-slate-600 text-xs">Back</button>
                      </div>
                      <input
                        type="text"
                        placeholder="What needs to be done?"
                        value={quickInputVal1}
                        onChange={(e) => setQuickInputVal1(e.target.value)}
                        autoFocus
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-hidden text-slate-800"
                      />
                      <Button type="submit" size="sm" className="w-full">
                        Queue Task
                      </Button>
                    </form>
                  )}

                  {quickAddType === 'note' && (
                    <form onSubmit={handleQuickAddNote} className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h4 className="font-extrabold text-slate-800 text-sm">📄 Quick Note</h4>
                        <button type="button" onClick={() => setQuickAddType('none')} className="text-slate-400 hover:text-slate-600 text-xs">Back</button>
                      </div>
                      <input
                        type="text"
                        placeholder="Note Title..."
                        value={quickInputVal1}
                        onChange={(e) => setQuickInputVal1(e.target.value)}
                        autoFocus
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-hidden text-slate-800 font-bold"
                      />
                      <textarea
                        placeholder="Write down ideas, checklists, markdown content..."
                        value={quickInputVal2}
                        onChange={(e) => setQuickInputVal2(e.target.value)}
                        rows={3}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-hidden text-slate-800 resize-none"
                      />
                      <Button type="submit" size="sm" className="w-full">
                        Queue Note
                      </Button>
                    </form>
                  )}

                  {quickAddType === 'expense' && (
                    <form onSubmit={handleQuickAddExpense} className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h4 className="font-extrabold text-slate-800 text-sm">💰 Log Expense</h4>
                        <button type="button" onClick={() => setQuickAddType('none')} className="text-slate-400 hover:text-slate-600 text-xs">Back</button>
                      </div>
                      <input
                        type="number"
                        placeholder="Amount ($)..."
                        value={quickInputVal1}
                        onChange={(e) => setQuickInputVal1(e.target.value)}
                        autoFocus
                        step="0.01"
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-hidden text-slate-800 font-black"
                      />
                      <input
                        type="text"
                        placeholder="Expense Description (e.g. Lunch)..."
                        value={quickInputVal2}
                        onChange={(e) => setQuickInputVal2(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-hidden text-slate-800"
                      />
                      <Button type="submit" size="sm" className="w-full">
                        Queue Expense
                      </Button>
                    </form>
                  )}

                  {quickAddType === 'habit' && (
                    <form onSubmit={handleQuickAddHabit} className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h4 className="font-extrabold text-slate-800 text-sm">✨ Track Habit</h4>
                        <button type="button" onClick={() => setQuickAddType('none')} className="text-slate-400 hover:text-slate-600 text-xs">Back</button>
                      </div>
                      <input
                        type="text"
                        placeholder="Habit description (e.g. Read books)..."
                        value={quickInputVal1}
                        onChange={(e) => setQuickInputVal1(e.target.value)}
                        autoFocus
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-hidden text-slate-800"
                      />
                      <Button type="submit" size="sm" className="w-full">
                        Queue Habit
                      </Button>
                    </form>
                  )}
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
