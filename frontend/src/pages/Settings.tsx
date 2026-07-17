import React from 'react'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { useThemeStore } from '../stores/themeStore'
import type { ThemeType } from '../stores/themeStore'
import { useToastStore } from '../stores/toastStore'
import { useAuthStore } from '../stores/authStore'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { User, Palette, CheckCircle2 } from 'lucide-react'

const profileSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address')
})

type ProfileFormValues = z.infer<typeof profileSchema>

export const Settings: React.FC = () => {
  const { theme, setTheme } = useThemeStore()
  const { addToast } = useToastStore()
  const { user, setUser } = useAuthStore()

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: user?.full_name || 'Vyshnavi Lakshmi',
      email: user?.email || 'you@example.com'
    }
  })

  const handleProfileSubmit = (data: ProfileFormValues) => {
    if (user) {
      setUser({ ...user, full_name: data.fullName, email: data.email })
    }
    addToast('Profile updated successfully!', 'success')
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
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Settings ⚙️</h1>
        <p className="text-slate-500 mt-1">Manage your account profile and personalize dashboard visual layouts.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Profile Settings Card */}
        <Card variant="white" className="space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <User className="text-sky-500 w-5 h-5" />
            <h2 className="text-lg font-bold text-slate-800">Profile Details</h2>
          </div>

          <form onSubmit={handleSubmit(handleProfileSubmit)} className="space-y-4">
            <Input
              label="Full Name"
              placeholder="Your Name"
              {...register('fullName')}
              error={errors.fullName?.message}
            />

            <Input
              label="Email Address"
              type="email"
              placeholder="you@example.com"
              {...register('email')}
              error={errors.email?.message}
            />

            <Button type="submit" variant="primary" className="w-full">
              Save Profile Changes
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
      </div>
    </div>
  )
}
