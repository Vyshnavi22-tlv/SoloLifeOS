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
import { ToastContainer } from './components/ui/Toast'


function App() {
  const theme = useThemeStore((state) => state.theme)
  const initializeAuth = useAuthStore((state) => state.initializeAuth)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    initializeAuth()
  }, [theme, initializeAuth])

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
      </Routes>
    </BrowserRouter>
    <ToastContainer />
    </>
  )
}

export default App

