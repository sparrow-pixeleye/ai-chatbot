'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Mic, MicOff, Square } from 'lucide-react'
import { useChatStore } from '@/store/chat-store'
import { useSpeechRecognition } from 'react-speech-kit'
import MessageBubble from './message-bubble'
import TypingIndicator from './typing-indicator'

export default function ChatInterface() {
  const [input, setInput] = useState('')
  const [isListening, setIsListening] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  
  const { currentChat, addMessage, setLoading, isLoading } = useChatStore()

  const { listen, listening, stop } = useSpeechRecognition({
    onResult: (result) => {
      setInput(result)
    },
  })

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [currentChat?.messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || !currentChat) return

    const userMessage = input.trim()
    setInput('')

    // Add user message
    addMessage(currentChat.id, {
      content: userMessage,
      role: 'user',
    })

    // Add AI response
    setLoading(true)
    addMessage(currentChat.id, {
      content: '',
      role: 'assistant',
      isTyping: true,
    })

    try {
      // Simulate AI response (replace with actual API call)
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const aiResponse = generateAIResponse(userMessage)
      
      // Update the typing message with actual response
      const lastMessage = currentChat.messages[currentChat.messages.length - 1]
      if (lastMessage && lastMessage.role === 'assistant') {
        // This would be handled by the store's updateMessage method
        addMessage(currentChat.id, {
          content: aiResponse,
          role: 'assistant',
        })
      }
    } catch (error) {
      console.error('Error generating response:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateAIResponse = (userMessage: string): string => {
    // This is a placeholder - in a real implementation, this would call an AI API
    const responses = [
      "I understand your question about \"" + userMessage + "\". Let me provide you with a comprehensive answer...",
      "That's an interesting topic! Based on my knowledge, here's what I can tell you about \"" + userMessage + "\"...",
      "I'd be happy to help you with \"" + userMessage + "\". Here's my analysis...",
      "Great question! Regarding \"" + userMessage + "\", I can share the following insights...",
    ]
    
    return responses[Math.floor(Math.random() * responses.length)] + 
      "\n\nThis is a demonstration response from APRATIM'S AI 2.0. In a real implementation, this would be replaced with actual AI-generated content using advanced language models like GPT-4, Claude, or Gemini."
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  const toggleListening = () => {
    if (listening) {
      stop()
      setIsListening(false)
    } else {
      listen()
      setIsListening(true)
    }
  }

  if (!currentChat) return null

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto scrollbar-hide p-6 space-y-6">
        <AnimatePresence>
          {currentChat.messages.map((message, index) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <MessageBubble message={message} />
            </motion.div>
          ))}
        </AnimatePresence>
        
        {isLoading && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-white/10 backdrop-blur-md bg-white/5 dark:bg-black/20 p-6">
        <form onSubmit={handleSubmit} className="flex items-end space-x-4">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Ask APRATIM'S AI anything..."
              className="w-full px-4 py-3 pr-12 rounded-2xl glass focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none min-h-[52px] max-h-32 text-sm"
              rows={1}
              style={{
                height: 'auto',
                minHeight: '52px',
              }}
            />
            
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                type="button"
                onClick={toggleListening}
                className={`p-2 rounded-xl transition-all duration-200 ${
                  listening
                    ? 'bg-red-500 text-white'
                    : 'glass hover:bg-white/20'
                }`}
              >
                {listening ? (
                  <MicOff className="w-4 h-4" />
                ) : (
                  <Mic className="w-4 h-4" />
                )}
              </motion.button>
            </div>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            disabled={!input.trim() || isLoading}
            className="p-3 rounded-2xl bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 disabled:from-gray-400 disabled:to-gray-500 text-white transition-all duration-200 shadow-lg hover:shadow-xl disabled:shadow-none"
          >
            <Send className="w-5 h-5" />
          </motion.button>
        </form>
      </div>
    </div>
  )
}