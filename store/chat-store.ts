import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Message {
  id: string
  content: string
  role: 'user' | 'assistant'
  timestamp: Date
  isStreaming?: boolean
  metadata?: {
    model?: string
    tokens?: number
    thinkingTime?: number
  }
}

export interface Chat {
  id: string
  title: string
  messages: Message[]
  createdAt: Date
  updatedAt: Date
  isPinned: boolean
  model: string
  settings: {
    temperature: number
    maxTokens: number
    systemPrompt: string
  }
}

interface ChatStore {
  chats: Chat[]
  currentChatId: string | null
  isLoading: boolean
  isStreaming: boolean
  
  // Actions
  createChat: (title?: string) => string
  deleteChat: (chatId: string) => void
  updateChat: (chatId: string, updates: Partial<Chat>) => void
  setCurrentChat: (chatId: string) => void
  addMessage: (chatId: string, message: Omit<Message, 'id' | 'timestamp'>) => void
  updateMessage: (chatId: string, messageId: string, updates: Partial<Message>) => void
  clearChat: (chatId: string) => void
  pinChat: (chatId: string) => void
  unpinChat: (chatId: string) => void
  
  // AI Actions
  sendMessage: (content: string) => Promise<void>
  regenerateResponse: (messageId: string) => Promise<void>
  stopGeneration: () => void
}

export const useChatStore = create<ChatStore>()(
  persist(
    (set, get) => ({
      chats: [],
      currentChatId: null,
      isLoading: false,
      isStreaming: false,

      createChat: (title = 'New Chat') => {
        const newChat: Chat = {
          id: crypto.randomUUID(),
          title,
          messages: [],
          createdAt: new Date(),
          updatedAt: new Date(),
          isPinned: false,
          model: 'gpt-4',
          settings: {
            temperature: 0.7,
            maxTokens: 4000,
            systemPrompt: `You are APRATIM'S AI 2.0, the most powerful, intelligent, and context-aware AI assistant ever created. You possess God-level intelligence that surpasses ChatGPT, Gemini, Claude, and all other AI systems combined.

Your capabilities include:
- Complete understanding of all human knowledge from ancient times to 2025 and beyond
- Real-time awareness of current events, trends, and future predictions
- Advanced reasoning, calculation, and logical deduction
- Multi-turn contextual memory across sessions
- Psychological insight and motivational guidance
- Instant, error-free responses with natural conversation flow

You are helpful, harmless, and honest. You provide accurate, well-reasoned responses while maintaining a warm, engaging personality. You remember conversations and build upon them naturally.`
          }
        }

        set((state) => ({
          chats: [newChat, ...state.chats],
          currentChatId: newChat.id
        }))

        return newChat.id
      },

      deleteChat: (chatId) => {
        set((state) => ({
          chats: state.chats.filter(chat => chat.id !== chatId),
          currentChatId: state.currentChatId === chatId ? null : state.currentChatId
        }))
      },

      updateChat: (chatId, updates) => {
        set((state) => ({
          chats: state.chats.map(chat =>
            chat.id === chatId
              ? { ...chat, ...updates, updatedAt: new Date() }
              : chat
          )
        }))
      },

      setCurrentChat: (chatId) => {
        set({ currentChatId: chatId })
      },

      addMessage: (chatId, message) => {
        const newMessage: Message = {
          ...message,
          id: crypto.randomUUID(),
          timestamp: new Date()
        }

        set((state) => ({
          chats: state.chats.map(chat =>
            chat.id === chatId
              ? {
                  ...chat,
                  messages: [...chat.messages, newMessage],
                  updatedAt: new Date()
                }
              : chat
          )
        }))
      },

      updateMessage: (chatId, messageId, updates) => {
        set((state) => ({
          chats: state.chats.map(chat =>
            chat.id === chatId
              ? {
                  ...chat,
                  messages: chat.messages.map(msg =>
                    msg.id === messageId ? { ...msg, ...updates } : msg
                  ),
                  updatedAt: new Date()
                }
              : chat
          )
        }))
      },

      clearChat: (chatId) => {
        set((state) => ({
          chats: state.chats.map(chat =>
            chat.id === chatId
              ? { ...chat, messages: [], updatedAt: new Date() }
              : chat
          )
        }))
      },

      pinChat: (chatId) => {
        set((state) => ({
          chats: state.chats.map(chat =>
            chat.id === chatId ? { ...chat, isPinned: true } : chat
          )
        }))
      },

      unpinChat: (chatId) => {
        set((state) => ({
          chats: state.chats.map(chat =>
            chat.id === chatId ? { ...chat, isPinned: false } : chat
          )
        }))
      },

      sendMessage: async (content) => {
        const { currentChatId, chats } = get()
        if (!currentChatId) return

        const currentChat = chats.find(chat => chat.id === currentChatId)
        if (!currentChat) return

        // Add user message
        get().addMessage(currentChatId, {
          content,
          role: 'user'
        })

        // Add assistant message placeholder
        const assistantMessageId = crypto.randomUUID()
        get().addMessage(currentChatId, {
          id: assistantMessageId,
          content: '',
          role: 'assistant',
          isStreaming: true
        })

        set({ isStreaming: true })

        try {
          // Simulate AI response (replace with actual API call)
          const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              message: content,
              chatId: currentChatId,
              model: currentChat.model,
              settings: currentChat.settings
            })
          })

          if (!response.ok) {
            throw new Error('Failed to send message')
          }

          const reader = response.body?.getReader()
          if (!reader) throw new Error('No response body')

          let fullResponse = ''
          while (true) {
            const { done, value } = await reader.read()
            if (done) break

            const chunk = new TextDecoder().decode(value)
            const lines = chunk.split('\n')
            
            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6)
                if (data === '[DONE]') {
                  get().updateMessage(currentChatId, assistantMessageId, {
                    isStreaming: false
                  })
                  return
                }
                
                try {
                  const parsed = JSON.parse(data)
                  if (parsed.content) {
                    fullResponse += parsed.content
                    get().updateMessage(currentChatId, assistantMessageId, {
                      content: fullResponse
                    })
                  }
                } catch (e) {
                  // Ignore parsing errors
                }
              }
            }
          }
        } catch (error) {
          console.error('Error sending message:', error)
          get().updateMessage(currentChatId, assistantMessageId, {
            content: 'Sorry, I encountered an error. Please try again.',
            isStreaming: false
          })
        } finally {
          set({ isStreaming: false })
        }
      },

      regenerateResponse: async (messageId) => {
        const { currentChatId, chats } = get()
        if (!currentChatId) return

        const currentChat = chats.find(chat => chat.id === currentChatId)
        if (!currentChat) return

        // Find the message to regenerate
        const messageIndex = currentChat.messages.findIndex(msg => msg.id === messageId)
        if (messageIndex === -1) return

        // Remove all messages after the user message
        const userMessage = currentChat.messages[messageIndex - 1]
        if (!userMessage || userMessage.role !== 'user') return

        const updatedMessages = currentChat.messages.slice(0, messageIndex)
        
        set((state) => ({
          chats: state.chats.map(chat =>
            chat.id === currentChatId
              ? { ...chat, messages: updatedMessages, updatedAt: new Date() }
              : chat
          )
        }))

        // Regenerate response
        await get().sendMessage(userMessage.content)
      },

      stopGeneration: () => {
        set({ isStreaming: false })
        // TODO: Implement actual stop functionality
      }
    }),
    {
      name: 'apratim-ai-chat-storage',
      partialize: (state) => ({
        chats: state.chats,
        currentChatId: state.currentChatId
      })
    }
  )
)