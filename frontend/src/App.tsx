import { useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useThemeStore } from './stores/themeStore'
import { useAuthStore } from './stores/authStore'
import { ProtectedRoute } from './components/ProtectedRoute'
import { Layout } from './components/Layout'
import { Auth } from './pages/Auth'
import { Dashboard } from './pages/Dashboard'
import { Calendar } from './pages/Calendar'
import { Goals } from './pages/Goals'
import { Habits } from './pages/Habits'
import { Notes } from './pages/Notes'
import { Journal } from './pages/Journal'
import { Finance } from './pages/Finance'
import { Study } from './pages/Study'
import { Reading } from './pages/Reading'
import { Fitness } from './pages/Fitness'
import { Pomodoro } from './pages/Pomodoro'
import { Analytics } from './pages/Analytics'
import { Settings } from './pages/Settings'
import { Tasks } from './pages/Tasks'
import { AiAssistant } from './pages/AiAssistant'
import { useToastStore } from './stores/toastStore'
import { ToastContainer } from './components/ui/Toast'


function App() {
  const theme = useThemeStore((state) => state.theme)
  const initializeAuth = useAuthStore((state) => state.initializeAuth)

  const addToast = useToastStore((state) => state.addToast)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    initializeAuth()
  }, [theme, initializeAuth])

  useEffect(() => {
    let lastFiredMin = ''

    const interval = setInterval(() => {
      const now = new Date()
      const timeStr = now.toTimeString().substring(0, 5) // "HH:MM"
      if (timeStr === lastFiredMin) return

      try {
        const stored = localStorage.getItem('sololifeos_alarms')
        if (stored) {
          const alarms = JSON.parse(stored) as { id: string; name: string; time: string; enabled: boolean }[]
          const activeAlarms = alarms.filter((a) => a.enabled && a.time === timeStr)

          activeAlarms.forEach((alarm) => {
            lastFiredMin = timeStr
            addToast(`⏰ Reminder: ${alarm.name}`, 'info')
            if ('Notification' in window && Notification.permission === 'granted') {
              new Notification('SoloLife OS Reminder', {
                body: alarm.name,
                icon: '/favicon.ico'
              })
            }
          })
        }
      } catch (e) {
        // Safeguard
      }
    }, 15000)

    return () => clearInterval(interval)
  }, [addToast])

  return (
    <>
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/auth" element={<Auth />} />

        {/* Protected Routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/calendar"
          element={
            <ProtectedRoute>
              <Layout>
                <Calendar />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/tasks"
          element={
            <ProtectedRoute>
              <Layout>
                <Tasks />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/goals"
          element={
            <ProtectedRoute>
              <Layout>
                <Goals />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/habits"
          element={
            <ProtectedRoute>
              <Layout>
                <Habits />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/notes"
          element={
            <ProtectedRoute>
              <Layout>
                <Notes />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/journal"
          element={
            <ProtectedRoute>
              <Layout>
                <Journal />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/finance"
          element={
            <ProtectedRoute>
              <Layout>
                <Finance />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/study"
          element={
            <ProtectedRoute>
              <Layout>
                <Study />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/reading"
          element={
            <ProtectedRoute>
              <Layout>
                <Reading />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/fitness"
          element={
            <ProtectedRoute>
              <Layout>
                <Fitness />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/pomodoro"
          element={
            <ProtectedRoute>
              <Layout>
                <Pomodoro />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/analytics"
          element={
            <ProtectedRoute>
              <Layout>
                <Analytics />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Layout>
                <Settings />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/ai-assistant"
          element={
            <ProtectedRoute>
              <Layout>
                <AiAssistant />
              </Layout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
    <ToastContainer />
    </>
  )
}

export default App

