import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Theme = 'light' | 'dark' | 'aurora' | 'futuristic'

interface ThemeStore {
  theme: Theme
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}

const themeOrder: Theme[] = ['light', 'dark', 'aurora', 'futuristic']

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set, get) => ({
      theme: 'light',
      
      setTheme: (theme) => {
        set({ theme })
        // Apply theme to document
        const root = document.documentElement
        root.className = theme
      },
      
      toggleTheme: () => {
        const currentTheme = get().theme
        const currentIndex = themeOrder.indexOf(currentTheme)
        const nextIndex = (currentIndex + 1) % themeOrder.length
        const nextTheme = themeOrder[nextIndex]
        get().setTheme(nextTheme)
      }
    }),
    {
      name: 'apratim-ai-theme-storage',
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Apply theme on hydration
          const root = document.documentElement
          root.className = state.theme
        }
      }
    }
  )
)