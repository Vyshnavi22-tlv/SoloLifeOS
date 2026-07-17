import { create } from 'zustand'

export type ThemeType = 'white' | 'blue' | 'pink' | 'lavender'

interface ThemeState {
  theme: ThemeType
  setTheme: (theme: ThemeType) => void
}

export const useThemeStore = create<ThemeState>((set) => ({
  theme: (localStorage.getItem('theme') as ThemeType) || 'white',
  setTheme: (theme) => {
    localStorage.setItem('theme', theme)
    // Update class or attribute on document html tag
    document.documentElement.setAttribute('data-theme', theme)
    set({ theme })
  }
}))
