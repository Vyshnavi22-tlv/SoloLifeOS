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
  Settings as SettingsIcon
} from 'lucide-react'
import { useAuthStore } from '../stores/authStore'
import { useToastStore } from '../stores/toastStore'

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

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      addToast(`Searching for "${searchQuery}"...`, 'info')
      setSearchQuery('')
    }
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
            <form onSubmit={handleSearchSubmit} className="hidden sm:flex items-center relative">
              <Search className="absolute left-3 text-slate-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search notes, goals..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-48 lg:w-64 pl-9 pr-4 py-1.5 bg-slate-100/80 hover:bg-slate-100 focus:bg-white border border-transparent focus:border-slate-200 rounded-xl text-xs focus:outline-hidden transition-all text-slate-700"
              />
            </form>

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
    </div>
  )
}
