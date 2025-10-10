'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChatInterface } from '@/components/chat-interface'
import { Sidebar } from '@/components/sidebar'
import { Header } from '@/components/header'
import { useChatStore } from '@/store/chat-store'
import { useThemeStore } from '@/store/theme-store'
import { WelcomeScreen } from '@/components/welcome-screen'

export default function Home() {
  const [isLoading, setIsLoading] = useState(true)
  const { currentChatId, chats } = useChatStore()
  const { theme } = useThemeStore()

  useEffect(() => {
    // Simulate loading time for smooth experience
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1500)

    return () => clearTimeout(timer)
  }, [])

  if (isLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        theme === 'dark' ? 'gradient-bg-dark' : 
        theme === 'aurora' ? 'aurora-bg' : 
        'gradient-bg'
      }`}>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <motion.div
            className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-primary-500 to-secondary-500"
            animate={{ 
              scale: [1, 1.1, 1],
              rotate: [0, 180, 360]
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.h1
            className="text-4xl font-bold gradient-text mb-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            APRATIM'S AI 2.0
          </motion.h1>
          <motion.p
            className="text-lg text-muted-foreground"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            Initializing God-level intelligence...
          </motion.p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen ${
      theme === 'dark' ? 'gradient-bg-dark' : 
      theme === 'aurora' ? 'aurora-bg' : 
      'gradient-bg'
    }`}>
      <div className="flex h-screen">
        {/* Sidebar */}
        <Sidebar />
        
        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          <Header />
          
          <main className="flex-1 flex flex-col overflow-hidden">
            <AnimatePresence mode="wait">
              {chats.length === 0 ? (
                <WelcomeScreen key="welcome" />
              ) : (
                <ChatInterface key="chat" />
              )}
            </AnimatePresence>
          </main>
        </div>
      </div>
    </div>
  )
}