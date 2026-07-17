import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sparkles, Mail, Lock, User, Eye, EyeOff } from 'lucide-react'
import { useAuthStore } from '../stores/authStore'

export const Auth: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [localLoading, setLocalLoading] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)

  const navigate = useNavigate()
  const { login } = useAuthStore()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLocalLoading(true)
    setLocalError(null)

    if (!email || !password) {
      setLocalError('Please fill in all fields')
      setLocalLoading(false)
      return
    }

    try {
      // Mocking architectural authentication endpoint
      // This allows the UI to build and run without needing database migrations up front
      setTimeout(() => {
        const mockUser = {
          id: 1,
          email: email,
          full_name: fullName || 'Solo Life User',
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-pink-blue p-6">
      <div className="w-full max-w-md glass-card rounded-3xl p-8 flex flex-col gap-6">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center gap-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-400 to-pink-400 flex items-center justify-center text-white text-2xl font-bold shadow-md">
            🌸
          </div>
          <h2 className="text-2xl font-extrabold text-slate-800 mt-2">Solo Life OS</h2>
          <p className="text-sm text-slate-500">Your AI-powered personal dashboard</p>
        </div>

        {/* Auth Toggle */}
        <div className="flex bg-slate-100/80 p-1.5 rounded-2xl">
          <button
            onClick={() => {
              setIsLogin(true)
              setLocalError(null)
            }}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
              isLogin ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Login
          </button>
          <button
            onClick={() => {
              setIsLogin(false)
              setLocalError(null)
            }}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
              !isLogin ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Register
          </button>
        </div>

        {/* Error Message */}
        {localError && (
          <div className="p-3 bg-rose-50 text-rose-600 rounded-xl text-xs font-semibold text-center border border-rose-100">
            {localError}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div className="relative">
              <label className="block text-xs font-semibold text-slate-500 mb-1">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type="text"
                  placeholder="Vyshnavi Lakshmi"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-white/80 border border-slate-200/50 rounded-2xl text-sm focus:outline-hidden focus:ring-2 focus:ring-sky-300 focus:border-sky-300 transition-all text-slate-800"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-white/80 border border-slate-200/50 rounded-2xl text-sm focus:outline-hidden focus:ring-2 focus:ring-sky-300 focus:border-sky-300 transition-all text-slate-800"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-11 pr-12 py-3 bg-white/80 border border-slate-200/50 rounded-2xl text-sm focus:outline-hidden focus:ring-2 focus:ring-sky-300 focus:border-sky-300 transition-all text-slate-800"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
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
          </button>
        </form>
      </div>
    </div>
  )
}
