'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Send, 
  StopCircle, 
  RotateCcw, 
  Copy, 
  ThumbsUp, 
  ThumbsDown,
  MoreVertical,
  Download,
  Share
} from 'lucide-react'
import { useChatStore } from '@/store/chat-store'
import { useThemeStore } from '@/store/theme-store'
import { MessageBubble } from './message-bubble'
import { cn } from '@/lib/utils'

export function ChatInterface() {
  const [input, setInput] = useState('')
  const [isComposing, setIsComposing] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  
  const { 
    chats, 
    currentChatId, 
    sendMessage, 
    regenerateResponse, 
    stopGeneration, 
    isStreaming,
    addMessage 
  } = useChatStore()
  const { theme } = useThemeStore()

  const currentChat = chats.find(chat => chat.id === currentChatId)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [currentChat?.messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isStreaming) return

    const message = input.trim()
    setInput('')
    
    // Add user message immediately
    addMessage(currentChatId!, {
      content: message,
      role: 'user'
    })

    // Send to AI
    await sendMessage(message)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  const handleRegenerate = (messageId: string) => {
    regenerateResponse(messageId)
  }

  const handleStop = () => {
    stopGeneration()
  }

  if (!currentChat) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-500 mb-2">No chat selected</h2>
          <p className="text-gray-400">Select a chat from the sidebar or create a new one</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        <div className="max-w-4xl mx-auto p-6 space-y-6">
          <AnimatePresence>
            {currentChat.messages.map((message, index) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="message-enter"
              >
                <MessageBubble
                  message={message}
                  onRegenerate={() => handleRegenerate(message.id)}
                  onCopy={() => navigator.clipboard.writeText(message.content)}
                />
              </motion.div>
            ))}
          </AnimatePresence>
          
          {/* Typing Indicator */}
          {isStreaming && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-3"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-sm">A</span>
              </div>
              <div className="flex-1">
                <div className={cn(
                  'p-4 rounded-2xl max-w-2xl',
                  theme === 'dark' ? 'bg-dark-700' :
                  theme === 'aurora' ? 'bg-white/10 backdrop-blur-md' :
                  'bg-gray-100'
                )}>
                  <div className="flex items-center gap-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                    <span className="text-sm text-gray-500">APRATIM'S AI is thinking...</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className={cn(
        'border-t p-6',
        theme === 'dark' ? 'bg-dark-800/50 border-dark-700 backdrop-blur-md' :
        theme === 'aurora' ? 'bg-white/10 border-white/20 backdrop-blur-md' :
        'bg-white/80 border-gray-200 backdrop-blur-md'
      )}>
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSubmit} className="relative">
            <div className="relative">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                onCompositionStart={() => setIsComposing(true)}
                onCompositionEnd={() => setIsComposing(false)}
                placeholder="Ask APRATIM'S AI anything..."
                className={cn(
                  'w-full px-6 py-4 pr-16 rounded-2xl border resize-none transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500/20',
                  theme === 'dark' ? 'bg-dark-700 border-dark-600 text-white placeholder-gray-400' :
                  theme === 'aurora' ? 'bg-white/20 border-white/30 text-white placeholder-white/60 backdrop-blur-md' :
                  'bg-white border-gray-200 text-gray-900 placeholder-gray-500',
                  isStreaming ? 'opacity-50 cursor-not-allowed' : ''
                )}
                rows={1}
                style={{
                  minHeight: '56px',
                  maxHeight: '200px',
                  height: 'auto'
                }}
                disabled={isStreaming}
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement
                  target.style.height = 'auto'
                  target.style.height = `${Math.min(target.scrollHeight, 200)}px`
                }}
              />
              
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                {isStreaming ? (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleStop}
                    className="p-2 rounded-lg bg-red-500 hover:bg-red-600 text-white transition-colors"
                    title="Stop generation"
                  >
                    <StopCircle className="w-5 h-5" />
                  </motion.button>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="submit"
                    disabled={!input.trim() || isComposing}
                    className={cn(
                      'p-2 rounded-lg transition-all duration-200',
                      input.trim() ? (
                        theme === 'dark' ? 'bg-primary-600 hover:bg-primary-700 text-white' :
                        theme === 'aurora' ? 'bg-white/20 hover:bg-white/30 text-white' :
                        'bg-primary-500 hover:bg-primary-600 text-white'
                      ) : (
                        'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                      )
                    )}
                    title="Send message"
                  >
                    <Send className="w-5 h-5" />
                  </motion.button>
                )}
              </div>
            </div>
            
            {/* Input Footer */}
            <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
              <div className="flex items-center gap-4">
                <span>Press Enter to send, Shift+Enter for new line</span>
              </div>
              <div className="flex items-center gap-2">
                <span>APRATIM'S AI 2.0</span>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}