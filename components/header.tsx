'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Menu, 
  Sun, 
  Moon, 
  Zap, 
  Palette,
  Settings,
  User,
  LogOut
} from 'lucide-react'
import { useThemeStore } from '@/store/theme-store'
import { useChatStore } from '@/store/chat-store'
import { cn } from '@/lib/utils'

export function Header() {
  const [showSettings, setShowSettings] = useState(false)
  const { theme, setTheme, toggleTheme } = useThemeStore()
  const { currentChatId, chats } = useChatStore()

  const currentChat = chats.find(chat => chat.id === currentChatId)

  const themeIcons = {
    light: Sun,
    dark: Moon,
    aurora: Zap,
    futuristic: Palette
  }

  const ThemeIcon = themeIcons[theme] || Sun

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className={cn(
        'h-16 border-b flex items-center justify-between px-6',
        theme === 'dark' ? 'bg-dark-800/50 border-dark-700 backdrop-blur-md' :
        theme === 'aurora' ? 'bg-white/10 border-white/20 backdrop-blur-md' :
        'bg-white/80 border-gray-200 backdrop-blur-md'
      )}
    >
      {/* Left Section */}
      <div className="flex items-center gap-4">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </motion.button>
        
        <div className="flex items-center gap-2">
          <motion.div
            className="w-8 h-8 rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 flex items-center justify-center"
            animate={{ 
              rotate: [0, 360],
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <span className="text-white font-bold text-sm">A</span>
          </motion.div>
          <div>
            <h1 className="text-lg font-bold gradient-text">
              APRATIM'S AI 2.0
            </h1>
            {currentChat && (
              <p className="text-sm text-gray-500 truncate max-w-xs">
                {currentChat.title}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-2">
        {/* Theme Toggle */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={toggleTheme}
          className={cn(
            'p-2 rounded-lg transition-all duration-200',
            theme === 'dark' ? 'bg-dark-700 hover:bg-dark-600 text-white' :
            theme === 'aurora' ? 'bg-white/20 hover:bg-white/30 text-white' :
            'bg-gray-100 hover:bg-gray-200 text-gray-700'
          )}
          title={`Current theme: ${theme}`}
        >
          <ThemeIcon className="w-5 h-5" />
        </motion.button>

        {/* Settings */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowSettings(!showSettings)}
          className={cn(
            'p-2 rounded-lg transition-all duration-200',
            theme === 'dark' ? 'hover:bg-dark-700 text-gray-300' :
            theme === 'aurora' ? 'hover:bg-white/10 text-white/80' :
            'hover:bg-gray-100 text-gray-600'
          )}
        >
          <Settings className="w-5 h-5" />
        </motion.button>

        {/* User Menu */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={cn(
            'p-2 rounded-lg transition-all duration-200',
            theme === 'dark' ? 'hover:bg-dark-700 text-gray-300' :
            theme === 'aurora' ? 'hover:bg-white/10 text-white/80' :
            'hover:bg-gray-100 text-gray-600'
          )}
        >
          <User className="w-5 h-5" />
        </motion.button>
      </div>

      {/* Settings Dropdown */}
      {showSettings && (
        <motion.div
          initial={{ opacity: 0, y: -10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.95 }}
          className={cn(
            'absolute top-16 right-6 w-64 p-4 rounded-xl shadow-lg border z-50',
            theme === 'dark' ? 'bg-dark-800 border-dark-700' :
            theme === 'aurora' ? 'bg-white/20 border-white/30 backdrop-blur-md' :
            'bg-white border-gray-200'
          )}
        >
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Settings
            </h3>
            
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                Theme
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(['light', 'dark', 'aurora', 'futuristic'] as const).map((themeOption) => {
                  const Icon = themeIcons[themeOption]
                  return (
                    <button
                      key={themeOption}
                      onClick={() => setTheme(themeOption)}
                      className={cn(
                        'flex items-center gap-2 p-2 rounded-lg text-sm transition-all duration-200',
                        theme === themeOption ? (
                          theme === 'dark' ? 'bg-primary-600 text-white' :
                          theme === 'aurora' ? 'bg-white/30 text-white' :
                          'bg-primary-100 text-primary-700'
                        ) : (
                          theme === 'dark' ? 'hover:bg-dark-700 text-gray-300' :
                          theme === 'aurora' ? 'hover:bg-white/10 text-white/80' :
                          'hover:bg-gray-100 text-gray-600'
                        )
                      )}
                    >
                      <Icon className="w-4 h-4" />
                      {themeOption.charAt(0).toUpperCase() + themeOption.slice(1)}
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <button className="flex items-center gap-2 w-full p-2 rounded-lg text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </motion.header>
  )
}