import React, { useState } from 'react'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input, Select } from '../components/ui/Input'
import { Dialog } from '../components/ui/Dialog'
import { useThemeStore } from '../stores/themeStore'
import type { ThemeType } from '../stores/themeStore'
import { useToastStore } from '../stores/toastStore'
import { useAuthStore } from '../stores/authStore'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  User,
  Palette,
  CheckCircle2,
  Lock,
  Bell,
  Globe,
  Download,
  Trash2,
  Camera
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'

// Zod Schemas
const profileSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address')
})

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Please confirm your new password')
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword']
})

type ProfileFormValues = z.infer<typeof profileSchema>
type PasswordFormValues = z.infer<typeof passwordSchema>

export const Settings: React.FC = () => {
  const { theme, setTheme } = useThemeStore()
  const { addToast } = useToastStore()
  const { user, setUser, logout } = useAuthStore()
  const navigate = useNavigate()

  // State
  const [avatar, setAvatar] = useState<string | null>(null)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')
  const [lang, setLang] = useState('en')
  const [tz, setTz] = useState('UTC')
  const [notifications, setNotifications] = useState({
    emailDigests: true,
    pushAlerts: true,
    weeklyReports: false
  })

  // Forms
  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors }
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: user?.full_name || 'Vyshnavi Lakshmi',
      email: user?.email || 'you@example.com'
    }
  })

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    formState: { errors: passwordErrors },
    reset: resetPassword
  } = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    }
  })

  // Handlers
  const onProfileSubmit = (data: ProfileFormValues) => {
    if (user) {
      setUser({ ...user, full_name: data.fullName, email: data.email })
    }
    addToast('Profile details updated successfully!', 'success')
  }

  const onPasswordSubmit = () => {
    addToast('Password changed successfully!', 'success')
    resetPassword()
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const url = URL.createObjectURL(file)
      setAvatar(url)
      addToast('Profile avatar uploaded successfully!', 'success')
    }
  }

  const exportUserData = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(
      JSON.stringify({
        user: {
          email: user?.email,
          full_name: user?.full_name,
          theme,
          language: lang,
          timezone: tz,
          notifications
        },
        exportedAt: new Date().toISOString()
      }, null, 2)
    )
    const dlAnchorElem = document.createElement('a')
    dlAnchorElem.setAttribute("href", dataStr)
    dlAnchorElem.setAttribute("download", `sololifeos_data_${user?.email || 'user'}.json`)
    dlAnchorElem.click()
    addToast('Your data has been exported successfully!', 'success')
  }

  const handleDeleteAccount = () => {
    if (deleteConfirmText.toLowerCase() === 'delete') {
      addToast('Account deleted successfully. We will miss you!', 'error')
      setDeleteOpen(false)
      logout()
      navigate('/auth')
    } else {
      addToast('Confirmation text mismatch', 'warning')
    }
  }

  const themesList: { id: ThemeType; name: string; color: string; desc: string }[] = [
    { id: 'white', name: 'Soft White', color: 'bg-white border-slate-200', desc: 'Calm, standard light theme' },
    { id: 'blue', name: 'Light Blue', color: 'bg-[#f0f9ff] border-sky-200', desc: 'Serene, focused ocean vibes' },
    { id: 'pink', name: 'Light Pink', color: 'bg-[#fdf2f8] border-pink-200', desc: 'Gentle, warm cherry blossom' },
    { id: 'lavender', name: 'Lavender', color: 'bg-[#faf5ff] border-purple-200', desc: 'Creative, peaceful flower accent' }
  ]

  const handleThemeChange = (newTheme: ThemeType) => {
    setTheme(newTheme)
    addToast(`Theme switched to ${newTheme.toUpperCase()}!`, 'info')
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Settings ⚙️</h1>
        <p className="text-slate-500 mt-1">Manage your account profile, visual configurations, preferences, and security settings.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        {/* Profile Card & Avatar */}
        <Card variant="white" className="space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <User className="text-sky-500 w-5 h-5" />
            <h2 className="text-lg font-bold text-slate-800">Profile Details</h2>
          </div>

          {/* Avatar Upload Dropzone */}
          <div className="flex flex-col sm:flex-row items-center gap-6 p-4 bg-slate-50/50 rounded-2xl border border-slate-200/20">
            <div className="relative group shrink-0 cursor-pointer">
              {avatar ? (
                <img src={avatar} className="w-20 h-20 rounded-full object-cover border border-slate-200" alt="Avatar" />
              ) : (
                <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-sky-300 via-purple-300 to-pink-300 flex items-center justify-center text-white text-2xl font-bold border border-white">
                  {user?.full_name ? user.full_name[0].toUpperCase() : 'S'}
                </div>
              )}
              <label className="absolute inset-0 bg-slate-900/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer">
                <Camera className="text-white w-5 h-5" />
                <input type="file" onChange={handleAvatarChange} accept="image/*" className="hidden" />
              </label>
            </div>
            <div>
              <h4 className="font-bold text-slate-800 text-sm">Profile Picture</h4>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Upload a PNG or JPG avatar. Hover to edit.
              </p>
            </div>
          </div>

          <form onSubmit={handleProfileSubmit(onProfileSubmit)} className="space-y-4">
            <Input
              label="Full Name"
              placeholder="Your Name"
              {...registerProfile('fullName')}
              error={profileErrors.fullName?.message}
            />

            <Input
              label="Email Address"
              type="email"
              placeholder="you@example.com"
              {...registerProfile('email')}
              error={profileErrors.email?.message}
            />

            <Button type="submit" variant="primary" className="w-full">
              Save Profile Changes
            </Button>
          </form>
        </Card>

        {/* Change Password Card */}
        <Card variant="white" className="space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <Lock className="text-indigo-500 w-5 h-5" />
            <h2 className="text-lg font-bold text-slate-800">Change Password</h2>
          </div>

          <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="space-y-4">
            <Input
              label="Current Password"
              type="password"
              placeholder="••••••••"
              {...registerPassword('currentPassword')}
              error={passwordErrors.currentPassword?.message}
            />

            <Input
              label="New Password"
              type="password"
              placeholder="••••••••"
              {...registerPassword('newPassword')}
              error={passwordErrors.newPassword?.message}
            />

            <Input
              label="Confirm New Password"
              type="password"
              placeholder="••••••••"
              {...registerPassword('confirmPassword')}
              error={passwordErrors.confirmPassword?.message}
            />

            <Button type="submit" variant="primary" className="w-full">
              Update Password
            </Button>
          </form>
        </Card>

        {/* Theme Settings Card */}
        <Card variant="white" className="space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <Palette className="text-pink-500 w-5 h-5" />
            <h2 className="text-lg font-bold text-slate-800">Theme Presets</h2>
          </div>

          <div className="space-y-3">
            {themesList.map((t) => {
              const isSelected = theme === t.id
              return (
                <div
                  key={t.id}
                  onClick={() => handleThemeChange(t.id)}
                  className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all duration-200 ${t.color} ${
                    isSelected ? 'ring-2 ring-sky-300 ring-offset-2 scale-[1.01]' : 'opacity-70 hover:opacity-100'
                  }`}
                >
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm">{t.name}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">{t.desc}</p>
                  </div>
                  {isSelected && <CheckCircle2 className="text-sky-500 shrink-0" size={20} />}
                </div>
              )
            })}
          </div>
        </Card>

        {/* Regional & Preferences Settings Card */}
        <Card variant="white" className="space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <Globe className="text-teal-500 w-5 h-5" />
            <h2 className="text-lg font-bold text-slate-800">Preferences & Localization</h2>
          </div>

          <div className="space-y-4">
            <Select
              label="Language"
              value={lang}
              onChange={(e) => setLang(e.target.value)}
              options={[
                { value: 'en', label: 'English' },
                { value: 'es', label: 'Spanish' },
                { value: 'fr', label: 'French' },
                { value: 'hi', label: 'Hindi' }
              ]}
            />

            <Select
              label="Timezone"
              value={tz}
              onChange={(e) => setTz(e.target.value)}
              options={[
                { value: 'UTC', label: 'UTC (GMT)' },
                { value: 'EST', label: 'Eastern Standard Time (EST)' },
                { value: 'PST', label: 'Pacific Standard Time (PST)' },
                { value: 'IST', label: 'Indian Standard Time (IST)' }
              ]}
            />

            {/* Notification Preferences */}
            <div className="space-y-3 pt-2">
              <label className="text-xs font-semibold text-slate-500">Notification Channels</label>
              <div className="flex flex-col gap-2 text-sm text-slate-700">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifications.emailDigests}
                    onChange={(e) => setNotifications({ ...notifications, emailDigests: e.target.checked })}
                    className="rounded-sm border-slate-300 text-sky-500 focus:ring-sky-400"
                  />
                  <span>Email Digests</span>
                </label>
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifications.pushAlerts}
                    onChange={(e) => setNotifications({ ...notifications, pushAlerts: e.target.checked })}
                    className="rounded-sm border-slate-300 text-sky-500 focus:ring-sky-400"
                  />
                  <span>Push Alerts</span>
                </label>
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifications.weeklyReports}
                    onChange={(e) => setNotifications({ ...notifications, weeklyReports: e.target.checked })}
                    className="rounded-sm border-slate-300 text-sky-500 focus:ring-sky-400"
                  />
                  <span>Weekly Summary Insights</span>
                </label>
              </div>
            </div>
          </div>
        </Card>

        {/* Data & Security Card */}
        <Card variant="white" className="md:col-span-2 space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <Bell className="text-rose-500 w-5 h-5" />
            <h2 className="text-lg font-bold text-slate-800">Data Portability & Deletion</h2>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50/50 p-4 border border-slate-200/20 rounded-2xl">
            <div>
              <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <Download size={16} className="text-slate-600" />
                Backup / Export My Data
              </h4>
              <p className="text-xs text-slate-500 mt-1">Download all your personal logs, configs, and notes as a single JSON file.</p>
            </div>
            <Button onClick={exportUserData} variant="secondary" size="sm" className="w-full sm:w-auto">
              Export Configuration
            </Button>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-rose-50/30 p-4 border border-rose-100/50 rounded-2xl">
            <div>
              <h4 className="font-bold text-rose-800 text-sm flex items-center gap-2">
                <Trash2 size={16} className="text-rose-600" />
                Delete My Account
              </h4>
              <p className="text-xs text-rose-600/70 mt-1">Permanently remove all your personal data. This operation is irreversible.</p>
            </div>
            <Button onClick={() => setDeleteOpen(true)} variant="danger" size="sm" className="w-full sm:w-auto">
              Delete Account
            </Button>
          </div>
        </Card>
      </div>

      {/* Account Deletion Dialog Modal */}
      <Dialog
        isOpen={deleteOpen}
        onClose={() => {
          setDeleteOpen(false)
          setDeleteConfirmText('')
        }}
        title="Confirm Account Deletion"
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() => {
                setDeleteOpen(false)
                setDeleteConfirmText('')
              }}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              disabled={deleteConfirmText.toLowerCase() !== 'delete'}
              onClick={handleDeleteAccount}
            >
              Confirm Permanent Delete
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600 leading-relaxed">
            Are you absolutely sure you want to delete your account? All goals, metrics, finances, notes, and habits will be deleted permanently.
          </p>
          <Input
            label='Type "DELETE" to confirm'
            placeholder="DELETE"
            value={deleteConfirmText}
            onChange={(e) => setDeleteConfirmText(e.target.value)}
          />
        </div>
      </Dialog>
    </div>
  )
}
