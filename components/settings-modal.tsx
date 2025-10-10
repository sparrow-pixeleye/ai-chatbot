'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Settings, Palette, Globe, Mic, Volume2, Database, Trash2 } from 'lucide-react'
import { useThemeStore } from '@/store/theme-store'
import { useChatStore } from '@/store/chat-store'

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { theme, setTheme } = useThemeStore()
  const { clearAllChats } = useChatStore()
  const [activeTab, setActiveTab] = useState('appearance')

  const tabs = [
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'language', label: 'Language', icon: Globe },
    { id: 'audio', label: 'Audio', icon: Volume2 },
    { id: 'data', label: 'Data', icon: Database },
  ]

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'ja', name: '日本語', flag: '🇯🇵' },
    { code: 'ko', name: '한국어', flag: '🇰🇷' },
    { code: 'zh', name: '中文', flag: '🇨🇳' },
  ]

  const handleClearData = () => {
    if (confirm('Are you sure you want to clear all chat data? This action cannot be undone.')) {
      clearAllChats()
      onClose()
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="w-full max-w-2xl glass rounded-2xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <div className="flex items-center space-x-3">
                <Settings className="w-6 h-6 text-primary-400" />
                <h2 className="text-xl font-bold">Settings</h2>
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="p-2 rounded-xl hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </motion.button>
            </div>

            <div className="flex">
              {/* Sidebar */}
              <div className="w-48 p-4 border-r border-white/10">
                <nav className="space-y-2">
                  {tabs.map((tab) => (
                    <motion.button
                      key={tab.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center space-x-3 px-3 py-2 rounded-xl transition-all duration-200 ${
                        activeTab === tab.id
                          ? 'bg-primary-500/20 text-primary-400'
                          : 'hover:bg-white/10'
                      }`}
                    >
                      <tab.icon className="w-4 h-4" />
                      <span className="text-sm font-medium">{tab.label}</span>
                    </motion.button>
                  ))}
                </nav>
              </div>

              {/* Content */}
              <div className="flex-1 p-6">
                <AnimatePresence mode="wait">
                  {activeTab === 'appearance' && (
                    <motion.div
                      key="appearance"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      <h3 className="text-lg font-semibold">Appearance</h3>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium mb-3">Theme</label>
                          <div className="grid grid-cols-2 gap-3">
                            {[
                              { id: 'light', name: 'Light', desc: 'Clean and bright' },
                              { id: 'dark', name: 'Dark', desc: 'Easy on the eyes' },
                              { id: 'aurora', name: 'Aurora', desc: 'Vibrant colors' },
                              { id: 'futuristic', name: 'Futuristic', desc: 'Next-gen vibes' },
                            ].map((themeOption) => (
                              <motion.button
                                key={themeOption.id}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setTheme(themeOption.id as any)}
                                className={`p-3 rounded-xl border transition-all duration-200 ${
                                  theme === themeOption.id
                                    ? 'border-primary-500 bg-primary-500/20'
                                    : 'border-white/20 hover:border-white/40'
                                }`}
                              >
                                <div className="text-sm font-medium">{themeOption.name}</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                  {themeOption.desc}
                                </div>
                              </motion.button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {activeTab === 'language' && (
                    <motion.div
                      key="language"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      <h3 className="text-lg font-semibold">Language & Region</h3>
                      
                      <div className="space-y-3">
                        {languages.map((lang) => (
                          <motion.button
                            key={lang.code}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full flex items-center space-x-3 p-3 rounded-xl hover:bg-white/10 transition-all duration-200"
                          >
                            <span className="text-2xl">{lang.flag}</span>
                            <span className="text-sm font-medium">{lang.name}</span>
                          </motion.button>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {activeTab === 'audio' && (
                    <motion.div
                      key="audio"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      <h3 className="text-lg font-semibold">Audio Settings</h3>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">Voice Input</label>
                          <div className="flex items-center space-x-3">
                            <input type="checkbox" defaultChecked className="w-4 h-4 text-primary-500" />
                            <span className="text-sm">Enable voice input</span>
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium mb-2">Voice Output</label>
                          <div className="flex items-center space-x-3">
                            <input type="checkbox" defaultChecked className="w-4 h-4 text-primary-500" />
                            <span className="text-sm">Enable text-to-speech</span>
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium mb-2">Volume</label>
                          <input type="range" min="0" max="100" defaultValue="50" className="w-full" />
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {activeTab === 'data' && (
                    <motion.div
                      key="data"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      <h3 className="text-lg font-semibold">Data & Privacy</h3>
                      
                      <div className="space-y-4">
                        <div className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
                          <div className="flex items-center space-x-2 mb-2">
                            <Database className="w-4 h-4 text-yellow-500" />
                            <span className="text-sm font-medium text-yellow-500">Data Storage</span>
                          </div>
                          <p className="text-xs text-gray-600 dark:text-gray-300">
                            Your chat data is stored locally and encrypted. No data is sent to external servers.
                          </p>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium mb-2">Chat Memory</label>
                          <div className="flex items-center space-x-3">
                            <input type="checkbox" defaultChecked className="w-4 h-4 text-primary-500" />
                            <span className="text-sm">Remember conversations across sessions</span>
                          </div>
                        </div>
                        
                        <div className="pt-4 border-t border-white/10">
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleClearData}
                            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-400 transition-all duration-200"
                          >
                            <Trash2 className="w-4 h-4" />
                            <span className="text-sm font-medium">Clear All Data</span>
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}