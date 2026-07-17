import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Eye, EyeOff } from 'lucide-react'
import { EnvelopeIcon, LockClosedIcon, UserIcon } from '@heroicons/react/24/outline'
import { useAuthStore } from '../stores/authStore'

// Zod Validation Schemas
const authSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  fullName: z.string().optional()
})

type AuthFormValues = z.infer<typeof authSchema>

export const Auth: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [localLoading, setLocalLoading] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)

  const navigate = useNavigate()
  const { login } = useAuthStore()

  // Form setup with React Hook Form & Zod Resolver
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<AuthFormValues>({
    resolver: zodResolver(
      isLogin
        ? authSchema
        : authSchema.refine((data) => !!data.fullName, {
            message: 'Full name is required for registration',
            path: ['fullName']
          })
    ),
    defaultValues: {
      email: '',
      password: '',
      fullName: ''
    }
  })

  const onSubmit = async (data: AuthFormValues) => {
    setLocalLoading(true)
    setLocalError(null)

    try {
      // Mock auth simulation
      setTimeout(() => {
        const mockUser = {
          id: 1,
          email: data.email,
          full_name: data.fullName || 'Solo Life User',
          is_active: true,
          is_superuser: false,
          created_at: new Date().toISOString()
        }
        const mockToken = 'mock-jwt-token-xyz'
        login(mockToken, mockUser)
        setLocalLoading(false)
        navigate('/')
      }, 800)
    } catch (err: any) {
      setLocalError(err.message || 'Authentication failed')
      setLocalLoading(false)
    }
  }

  const toggleAuthMode = () => {
    setIsLogin(!isLogin)
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

        {/* Auth Toggle */}
        <div className="flex bg-slate-100/80 p-1.5 rounded-2xl relative">
          <button
            onClick={toggleAuthMode}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 z-10 ${
              isLogin ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Login
          </button>
          <button
            onClick={toggleAuthMode}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 z-10 ${
              !isLogin ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Register
          </button>
        </div>

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

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <AnimatePresence mode="popLayout">
            {!isLogin && (
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

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Password</label>
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
                <span>{isLogin ? 'Login to Dashboard' : 'Create Account'}</span>
              </>
            )}
          </motion.button>
        </form>
      </motion.div>
    </div>
  )
}
