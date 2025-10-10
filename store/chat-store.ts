import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Message {
  id: string
  content: string
  role: 'user' | 'assistant'
  timestamp: Date
  isTyping?: boolean
}

export interface Chat {
  id: string
  title: string
  messages: Message[]
  createdAt: Date
  updatedAt: Date
  isPinned?: boolean
}

interface ChatState {
  chats: Chat[]
  currentChat: Chat | null
  isLoading: boolean
  isTyping: boolean
  
  // Actions
  createChat: (title?: string) => Chat
  setCurrentChat: (chatId: string) => void
  addMessage: (chatId: string, message: Omit<Message, 'id' | 'timestamp'>) => void
  updateMessage: (chatId: string, messageId: string, content: string) => void
  deleteMessage: (chatId: string, messageId: string) => void
  deleteChat: (chatId: string) => void
  renameChat: (chatId: string, title: string) => void
  togglePinChat: (chatId: string) => void
  setLoading: (loading: boolean) => void
  setTyping: (typing: boolean) => void
  clearAllChats: () => void
}

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      chats: [],
      currentChat: null,
      isLoading: false,
      isTyping: false,

      createChat: (title = 'New Chat') => {
        const newChat: Chat = {
          id: Date.now().toString(),
          title,
          messages: [],
          createdAt: new Date(),
          updatedAt: new Date(),
          isPinned: false,
        }
        
        set((state) => ({
          chats: [newChat, ...state.chats],
          currentChat: newChat,
        }))
        
        return newChat
      },

      setCurrentChat: (chatId) => {
        const chat = get().chats.find(c => c.id === chatId)
        if (chat) {
          set({ currentChat: chat })
        }
      },

      addMessage: (chatId, message) => {
        const newMessage: Message = {
          ...message,
          id: Date.now().toString(),
          timestamp: new Date(),
        }

        set((state) => ({
          chats: state.chats.map(chat =>
            chat.id === chatId
              ? {
                  ...chat,
                  messages: [...chat.messages, newMessage],
                  updatedAt: new Date(),
                }
              : chat
          ),
          currentChat: state.currentChat?.id === chatId
            ? {
                ...state.currentChat,
                messages: [...state.currentChat.messages, newMessage],
                updatedAt: new Date(),
              }
            : state.currentChat,
        }))
      },

      updateMessage: (chatId, messageId, content) => {
        set((state) => ({
          chats: state.chats.map(chat =>
            chat.id === chatId
              ? {
                  ...chat,
                  messages: chat.messages.map(msg =>
                    msg.id === messageId ? { ...msg, content } : msg
                  ),
                  updatedAt: new Date(),
                }
              : chat
          ),
          currentChat: state.currentChat?.id === chatId
            ? {
                ...state.currentChat,
                messages: state.currentChat.messages.map(msg =>
                  msg.id === messageId ? { ...msg, content } : msg
                ),
                updatedAt: new Date(),
              }
            : state.currentChat,
        }))
      },

      deleteMessage: (chatId, messageId) => {
        set((state) => ({
          chats: state.chats.map(chat =>
            chat.id === chatId
              ? {
                  ...chat,
                  messages: chat.messages.filter(msg => msg.id !== messageId),
                  updatedAt: new Date(),
                }
              : chat
          ),
          currentChat: state.currentChat?.id === chatId
            ? {
                ...state.currentChat,
                messages: state.currentChat.messages.filter(msg => msg.id !== messageId),
                updatedAt: new Date(),
              }
            : state.currentChat,
        }))
      },

      deleteChat: (chatId) => {
        set((state) => {
          const newChats = state.chats.filter(chat => chat.id !== chatId)
          const newCurrentChat = state.currentChat?.id === chatId 
            ? (newChats.length > 0 ? newChats[0] : null)
            : state.currentChat

          return {
            chats: newChats,
            currentChat: newCurrentChat,
          }
        })
      },

      renameChat: (chatId, title) => {
        set((state) => ({
          chats: state.chats.map(chat =>
            chat.id === chatId ? { ...chat, title, updatedAt: new Date() } : chat
          ),
          currentChat: state.currentChat?.id === chatId
            ? { ...state.currentChat, title, updatedAt: new Date() }
            : state.currentChat,
        }))
      },

      togglePinChat: (chatId) => {
        set((state) => ({
          chats: state.chats.map(chat =>
            chat.id === chatId ? { ...chat, isPinned: !chat.isPinned } : chat
          ),
        }))
      },

      setLoading: (loading) => set({ isLoading: loading }),
      setTyping: (typing) => set({ isTyping: typing }),
      
      clearAllChats: () => set({ chats: [], currentChat: null }),
    }),
    {
      name: 'apratim-ai-chat-storage',
      partialize: (state) => ({ chats: state.chats }),
    }
  )
)