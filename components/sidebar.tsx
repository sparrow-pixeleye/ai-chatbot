'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Plus, 
  MessageSquare, 
  Pin, 
  Trash2, 
  Settings, 
  Search,
  MoreVertical,
  Star,
  Clock
} from 'lucide-react'
import { useChatStore } from '@/store/chat-store'
import { useThemeStore } from '@/store/theme-store'
import { formatDistanceToNow } from 'date-fns'
import { cn } from '@/lib/utils'

export function Sidebar() {
  const [searchQuery, setSearchQuery] = useState('')
  const { 
    chats, 
    currentChatId, 
    createChat, 
    deleteChat, 
    setCurrentChat, 
    pinChat, 
    unpinChat 
  } = useChatStore()
  const { theme } = useThemeStore()

  const filteredChats = chats.filter(chat =>
    chat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    chat.messages.some(msg => 
      msg.content.toLowerCase().includes(searchQuery.toLowerCase())
    )
  )

  const pinnedChats = filteredChats.filter(chat => chat.isPinned)
  const unpinnedChats = filteredChats.filter(chat => !chat.isPinned)

  const handleNewChat = () => {
    createChat()
  }

  const handleChatSelect = (chatId: string) => {
    setCurrentChat(chatId)
  }

  const handleDeleteChat = (e: React.MouseEvent, chatId: string) => {
    e.stopPropagation()
    deleteChat(chatId)
  }

  const handlePinChat = (e: React.MouseEvent, chatId: string) => {
    e.stopPropagation()
    const chat = chats.find(c => c.id === chatId)
    if (chat) {
      if (chat.isPinned) {
        unpinChat(chatId)
      } else {
        pinChat(chatId)
      }
    }
  }

  return (
    <motion.div
      initial={{ x: -300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={cn(
        'w-80 h-full flex flex-col border-r',
        theme === 'dark' ? 'bg-dark-800/50 border-dark-700' :
        theme === 'aurora' ? 'bg-white/10 backdrop-blur-md border-white/20' :
        'bg-white/80 backdrop-blur-md border-gray-200'
      )}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-200/20">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleNewChat}
          className={cn(
            'w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200',
            theme === 'dark' ? 'bg-primary-600 hover:bg-primary-700 text-white' :
            theme === 'aurora' ? 'bg-white/20 hover:bg-white/30 text-white backdrop-blur-md' :
            'bg-primary-500 hover:bg-primary-600 text-white'
          )}
        >
          <Plus className="w-5 h-5" />
          New Chat
        </motion.button>
      </div>

      {/* Search */}
      <div className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={cn(
              'w-full pl-10 pr-4 py-2 rounded-lg border text-sm',
              theme === 'dark' ? 'bg-dark-700 border-dark-600 text-white placeholder-gray-400' :
              theme === 'aurora' ? 'bg-white/10 border-white/20 text-white placeholder-white/60 backdrop-blur-md' :
              'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500'
            )}
          />
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        <div className="p-4 space-y-2">
          {/* Pinned Chats */}
          {pinnedChats.length > 0 && (
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2 px-2">
                <Pin className="w-4 h-4 text-primary-500" />
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Pinned
                </span>
              </div>
              <div className="space-y-1">
                {pinnedChats.map((chat) => (
                  <ChatItem
                    key={chat.id}
                    chat={chat}
                    isActive={chat.id === currentChatId}
                    onSelect={handleChatSelect}
                    onDelete={handleDeleteChat}
                    onPin={handlePinChat}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Regular Chats */}
          {unpinnedChats.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2 px-2">
                <Clock className="w-4 h-4 text-gray-400" />
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Recent
                </span>
              </div>
              <div className="space-y-1">
                {unpinnedChats.map((chat) => (
                  <ChatItem
                    key={chat.id}
                    chat={chat}
                    isActive={chat.id === currentChatId}
                    onSelect={handleChatSelect}
                    onDelete={handleDeleteChat}
                    onPin={handlePinChat}
                  />
                ))}
              </div>
            </div>
          )}

          {filteredChats.length === 0 && searchQuery && (
            <div className="text-center py-8">
              <MessageSquare className="w-12 h-12 mx-auto text-gray-400 mb-2" />
              <p className="text-sm text-gray-500">No conversations found</p>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200/20">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={cn(
            'w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200',
            theme === 'dark' ? 'hover:bg-dark-700 text-gray-300' :
            theme === 'aurora' ? 'hover:bg-white/10 text-white/80' :
            'hover:bg-gray-100 text-gray-700'
          )}
        >
          <Settings className="w-5 h-5" />
          Settings
        </motion.button>
      </div>
    </motion.div>
  )
}

interface ChatItemProps {
  chat: any
  isActive: boolean
  onSelect: (chatId: string) => void
  onDelete: (e: React.MouseEvent, chatId: string) => void
  onPin: (e: React.MouseEvent, chatId: string) => void
}

function ChatItem({ chat, isActive, onSelect, onDelete, onPin }: ChatItemProps) {
  const [showActions, setShowActions] = useState(false)
  const { theme } = useThemeStore()

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      className={cn(
        'group relative rounded-lg transition-all duration-200 cursor-pointer',
        isActive ? (
          theme === 'dark' ? 'bg-primary-600/20 border-primary-500/50' :
          theme === 'aurora' ? 'bg-white/20 border-white/30' :
          'bg-primary-50 border-primary-200'
        ) : (
          theme === 'dark' ? 'hover:bg-dark-700/50' :
          theme === 'aurora' ? 'hover:bg-white/10' :
          'hover:bg-gray-50'
        )
      )}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
      onClick={() => onSelect(chat.id)}
    >
      <div className="p-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h3 className={cn(
              'text-sm font-medium truncate',
              isActive ? 'text-primary-600' : 'text-gray-900 dark:text-gray-100'
            )}>
              {chat.title}
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              {formatDistanceToNow(chat.updatedAt, { addSuffix: true })}
            </p>
          </div>
          
          <AnimatePresence>
            {showActions && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex items-center gap-1"
              >
                <button
                  onClick={(e) => onPin(e, chat.id)}
                  className={cn(
                    'p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors',
                    chat.isPinned ? 'text-yellow-500' : 'text-gray-400'
                  )}
                >
                  <Star className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => onDelete(e, chat.id)}
                  className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/20 text-red-500 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  )
}