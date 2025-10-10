'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Sun, Moon, Zap, Sparkles } from 'lucide-react'
import { useThemeStore } from '@/store/theme-store'

const themes = [
  { id: 'light', name: 'Light', icon: Sun, description: 'Clean and bright' },
  { id: 'dark', name: 'Dark', icon: Moon, description: 'Easy on the eyes' },
  { id: 'aurora', name: 'Aurora', icon: Zap, description: 'Vibrant and energetic' },
  { id: 'futuristic', name: 'Futuristic', icon: Sparkles, description: 'Next-gen vibes' },
] as const

export default function ThemeSelector() {
  const [isOpen, setIsOpen] = useState(false)
  const { theme, setTheme } = useThemeStore()

  const currentTheme = themes.find(t => t.id === theme) || themes[1]

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 rounded-xl glass hover:bg-white/20 transition-all duration-200"
      >
        <currentTheme.icon className="w-4 h-4" />
        <span className="text-sm font-medium">{currentTheme.name}</span>
        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 top-full mt-2 w-48 glass rounded-xl shadow-xl z-50"
          >
            <div className="p-2">
              {themes.map((themeOption) => (
                <motion.button
                  key={themeOption.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setTheme(themeOption.id as any)
                    setIsOpen(false)
                  }}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-200 ${
                    theme === themeOption.id
                      ? 'bg-primary-500/20 text-primary-400'
                      : 'hover:bg-white/10'
                  }`}
                >
                  <themeOption.icon className="w-4 h-4" />
                  <div className="flex-1 text-left">
                    <div className="font-medium text-sm">{themeOption.name}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {themeOption.description}
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}