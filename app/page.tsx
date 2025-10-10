'use client'

import { useEffect } from 'react'
import { useChatStore } from '@/store/chat-store'
import { useThemeStore } from '@/store/theme-store'
import ChatInterface from '@/components/chat-interface'
import Sidebar from '@/components/sidebar'
import Header from '@/components/header'
import WelcomeScreen from '@/components/welcome-screen'
import { motion, AnimatePresence } from 'framer-motion'

export default function Home() {
  const { currentChat, isLoading } = useChatStore()
  const { theme } = useThemeStore()

  useEffect(() => {
    // Initialize theme
    const savedTheme = localStorage.getItem('apratim-ai-theme')
    if (savedTheme) {
      useThemeStore.getState().setTheme(savedTheme as any)
    }
  }, [])

  return (
    <div className={`min-h-screen transition-all duration-500 ${
      theme === 'light' ? 'bg-gradient-to-br from-gray-50 to-gray-100' :
      theme === 'dark' ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-black' :
      theme === 'aurora' ? 'bg-gradient-to-br from-aurora-50 via-aurora-100 to-aurora-200' :
      'bg-gradient-to-br from-futuristic-50 via-futuristic-100 to-futuristic-200'
    }`}>
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar */}
        <Sidebar />
        
        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          <Header />
          
          <main className="flex-1 overflow-hidden relative">
            <AnimatePresence mode="wait">
              {currentChat && currentChat.messages.length > 0 ? (
                <motion.div
                  key="chat"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="h-full"
                >
                  <ChatInterface />
                </motion.div>
              ) : (
                <motion.div
                  key="welcome"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4 }}
                  className="h-full"
                >
                  <WelcomeScreen />
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* Loading Overlay */}
            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50"
              >
                <div className="flex flex-col items-center space-y-4">
                  <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-white font-medium">APRATIM'S AI is thinking...</p>
                </div>
              </motion.div>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}