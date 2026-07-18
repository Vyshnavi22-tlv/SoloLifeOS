import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Eye, EyeOff, KeyRound, ArrowLeft } from 'lucide-react'
import { EnvelopeIcon, LockClosedIcon, UserIcon } from '@heroicons/react/24/outline'
import { useAuthStore } from '../stores/authStore'
import { useToastStore } from '../stores/toastStore'
import { fetchAndRestoreUserData } from '../lib/persistence'

// Zod Validation Schema with optional fields to support multiple auth modes
const authSchema = z.object({
  email: z.string().email('Please enter a valid email address').or(z.literal('')),
  password: z.string().min(6, 'Password must be at least 6 characters').or(z.literal('')),
  fullName: z.string().optional(),
  rememberMe: z.boolean().default(false),
  token: z.string().optional()
})

export const Auth: React.FC = () => {
  const [mode, setMode] = useState<'login' | 'register' | 'forgot' | 'reset'>('login')
  const [showPassword, setShowPassword] = useState(false)
  const [localLoading, setLocalLoading] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)

  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { login } = useAuthStore()
  const { addToast } = useToastStore()

  // Detect reset token in URL params on mount
  useEffect(() => {
    const token = searchParams.get('token')
    if (token) {
      setMode('reset')
    }
  }, [searchParams])

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue
  } = useForm({
    resolver: zodResolver(authSchema),
    defaultValues: {
      email: '',
      password: '',
      fullName: '',
      rememberMe: false,
      token: searchParams.get('token') || ''
    }
  })

  // Ensure token input gets updated if URL param loaded
  useEffect(() => {
    const token = searchParams.get('token')
    if (token) {
      setValue('token', token)
    }
  }, [searchParams, setValue])

  const onSubmit = async (data: any) => {
    setLocalLoading(true)
    setLocalError(null)

    // Manual validations based on active mode
    if (mode === 'register' && !data.fullName?.trim()) {
      setLocalError('Full Name is required')
      setLocalLoading(false)
      return
    }
    if (mode !== 'reset' && !data.email) {
      setLocalError('Email is required')
      setLocalLoading(false)
      return
    }
    if (mode !== 'forgot' && !data.password) {
      setLocalError('Password is required')
      setLocalLoading(false)
      return
    }
    if (mode === 'reset' && !data.token) {
      setLocalError('Reset Token is required')
      setLocalLoading(false)
      return
    }

    try {
      if (mode === 'forgot') {
        // Simulating Forgot Password
        setTimeout(() => {
          setLocalLoading(false)
          addToast('Password reset link generated. Check console for details.', 'success')
          // Simulate console token output for local testing
          console.log(`[RESET TOKEN]: token-simulated-xyz-for-${data.email}`)
          setMode('login')
        }, 800)
      } else if (mode === 'reset') {
        // Simulating Reset Password
        setTimeout(() => {
          setLocalLoading(false)
          addToast('Password updated successfully! Please login.', 'success')
          setMode('login')
        }, 800)
      } else {
        // Simulating Login/Register Auth
        setTimeout(async () => {
          const mockUser = {
            id: 1,
            email: data.email,
            full_name: data.fullName || 'Solo Life User',
            is_active: true,
            is_superuser: false,
            created_at: new Date().toISOString()
          }
          const mockToken = 'mock-access-token-xyz'
          const mockRefreshToken = 'mock-refresh-token-abc'
          
          login(mockToken, mockRefreshToken, mockUser, !!data.rememberMe)
          await fetchAndRestoreUserData()
          setLocalLoading(false)
          addToast(mode === 'login' ? 'Welcome back!' : 'Account registered successfully!', 'success')
          navigate('/')
        }, 800)
      }
    } catch (err: any) {
      setLocalError(err.message || 'Authentication failed')
      setLocalLoading(false)
    }
  }

  const changeMode = (newMode: typeof mode) => {
    setMode(newMode)
    setLocalError(null)
    reset()
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-pink-blue p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md glass-card rounded-3xl p-8 flex flex-col gap-6"
      >
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center gap-2">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-400 to-pink-400 flex items-center justify-center text-white text-2xl font-bold shadow-md cursor-pointer"
          >
            🌸
          </motion.div>
          <h2 className="text-2xl font-extrabold text-slate-800 mt-2">Solo Life OS</h2>
          <p className="text-sm text-slate-500">Your AI-powered personal dashboard</p>
        </div>

        {/* Back navigation for forgot/reset */}
        {['forgot', 'reset'].includes(mode) && (
          <button
            onClick={() => changeMode('login')}
            className="flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-700 transition-colors self-start cursor-pointer"
          >
            <ArrowLeft size={14} />
            <span>Back to Login</span>
          </button>
        )}

        {/* Auth Toggle (Only visible for Login / Register) */}
        {['login', 'register'].includes(mode) && (
          <div className="flex bg-slate-100/80 p-1.5 rounded-2xl relative">
            <button
              onClick={() => changeMode('login')}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 z-10 ${
                mode === 'login' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Login
            </button>
            <button
              onClick={() => changeMode('register')}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 z-10 ${
                mode === 'register' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Register
            </button>
          </div>
        )}

        {/* Error Message */}
        <AnimatePresence mode="wait">
          {localError && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="p-3 bg-rose-50 text-rose-600 rounded-xl text-xs font-semibold text-center border border-rose-100 overflow-hidden"
            >
              {localError}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form Title for recovery options */}
        {mode === 'forgot' && <h3 className="text-base font-bold text-slate-700">Forgot Password</h3>}
        {mode === 'reset' && <h3 className="text-base font-bold text-slate-700">Reset Password</h3>}

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <AnimatePresence mode="popLayout">
            {mode === 'register' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="relative overflow-hidden"
              >
                <label className="block text-xs font-semibold text-slate-500 mb-1">Full Name</label>
                <div className="relative">
                  <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Vyshnavi Lakshmi"
                    {...register('fullName')}
                    className="w-full pl-11 pr-4 py-3 bg-white/80 border border-slate-200/50 rounded-2xl text-sm focus:outline-hidden focus:ring-2 focus:ring-sky-300 focus:border-sky-300 transition-all text-slate-800"
                  />
                </div>
                {errors.fullName && (
                  <p className="text-xs text-rose-500 mt-1 font-medium">{errors.fullName.message}</p>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Reset Token field */}
          {mode === 'reset' && (
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Reset Token</label>
              <div className="relative">
                <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Paste token from console / email"
                  {...register('token')}
                  className="w-full pl-11 pr-4 py-3 bg-white/80 border border-slate-200/50 rounded-2xl text-sm focus:outline-hidden focus:ring-2 focus:ring-sky-300 focus:border-sky-300 transition-all text-slate-800"
                />
              </div>
              {errors.token && (
                <p className="text-xs text-rose-500 mt-1 font-medium">{errors.token.message}</p>
              )}
            </div>
          )}

          {/* Email field (hidden in Reset Password mode) */}
          {mode !== 'reset' && (
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Email Address</label>
              <div className="relative">
                <EnvelopeIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type="email"
                  placeholder="you@example.com"
                  {...register('email')}
                  className="w-full pl-11 pr-4 py-3 bg-white/80 border border-slate-200/50 rounded-2xl text-sm focus:outline-hidden focus:ring-2 focus:ring-sky-300 focus:border-sky-300 transition-all text-slate-800"
                />
              </div>
              {errors.email && (
                <p className="text-xs text-rose-500 mt-1 font-medium">{errors.email.message}</p>
              )}
            </div>
          )}

          {/* Password field (hidden in Forgot Password mode) */}
          {mode !== 'forgot' && (
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">
                {mode === 'reset' ? 'New Password' : 'Password'}
              </label>
              <div className="relative">
                <LockClosedIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  {...register('password')}
                  className="w-full pl-11 pr-12 py-3 bg-white/80 border border-slate-200/50 rounded-2xl text-sm focus:outline-hidden focus:ring-2 focus:ring-sky-300 focus:border-sky-300 transition-all text-slate-800"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-rose-500 mt-1 font-medium">{errors.password.message}</p>
              )}
            </div>
          )}

          {/* Remember Me and Forgot Password Trigger (Only in Login mode) */}
          {mode === 'login' && (
            <div className="flex items-center justify-between py-1 text-xs">
              <label className="flex items-center gap-2 font-semibold text-slate-500 cursor-pointer">
                <input
                  type="checkbox"
                  {...register('rememberMe')}
                  className="rounded-sm border-slate-300 text-sky-500 focus:ring-sky-400"
                />
                <span>Remember Me</span>
              </label>
              <button
                type="button"
                onClick={() => changeMode('forgot')}
                className="font-bold text-sky-500 hover:text-sky-600 transition-colors cursor-pointer"
              >
                Forgot Password?
              </button>
            </div>
          )}

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={localLoading}
            className="w-full py-3.5 mt-2 bg-gradient-to-r from-sky-500 to-pink-500 text-white font-bold rounded-2xl shadow-md hover:from-sky-600 hover:to-pink-600 focus:outline-hidden focus:ring-2 focus:ring-sky-300 focus:ring-offset-2 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            {localLoading ? (
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <>
                <Sparkles size={16} />
                <span>
                  {mode === 'login' && 'Login to Dashboard'}
                  {mode === 'register' && 'Create Account'}
                  {mode === 'forgot' && 'Reset My Password'}
                  {mode === 'reset' && 'Confirm New Password'}
                </span>
              </>
            )}
          </motion.button>
        </form>
      </motion.div>
    </div>
  )
}
