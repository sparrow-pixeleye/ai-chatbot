'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Menu, Settings, Sun, Moon, Zap, Sparkles } from 'lucide-react'
import { useThemeStore } from '@/store/theme-store'
import { useChatStore } from '@/store/chat-store'
import ThemeSelector from './theme-selector'
import SettingsModal from './settings-modal'

export default function Header() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const { theme } = useThemeStore()
  const { createChat } = useChatStore()

  const handleNewChat = () => {
    createChat()
  }

  const getThemeIcon = () => {
    switch (theme) {
      case 'light':
        return <Sun className="w-5 h-5" />
      case 'dark':
        return <Moon className="w-5 h-5" />
      case 'aurora':
        return <Zap className="w-5 h-5" />
      case 'futuristic':
        return <Sparkles className="w-5 h-5" />
      default:
        return <Moon className="w-5 h-5" />
    }
  }

  return (
    <>
      <header className="h-16 border-b border-white/10 backdrop-blur-md bg-white/5 dark:bg-black/20 flex items-center justify-between px-6">
        <div className="flex items-center space-x-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleNewChat}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <Menu className="w-4 h-4" />
            <span>New Chat</span>
          </motion.button>
        </div>

        <div className="flex items-center space-x-4">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center space-x-2"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary-500 via-aurora-500 to-futuristic-500 flex items-center justify-center">
              <span className="text-white font-bold text-sm">A</span>
            </div>
            <div>
              <h1 className="text-xl font-bold gradient-text">
                APRATIM'S AI 2.0
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                The Ultimate AI Assistant
              </p>
            </div>
          </motion.div>
        </div>

        <div className="flex items-center space-x-2">
          <ThemeSelector />
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsSettingsOpen(true)}
            className="p-2 rounded-xl glass hover:bg-white/20 transition-all duration-200"
          >
            <Settings className="w-5 h-5" />
          </motion.button>
        </div>
      </header>

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </>
  )
}