'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  MessageSquare, 
  Plus, 
  Pin, 
  PinOff, 
  Edit3, 
  Trash2, 
  MoreVertical,
  Search,
  Clock
} from 'lucide-react'
import { useChatStore } from '@/store/chat-store'
import { formatDistanceToNow } from 'date-fns'

export default function Sidebar() {
  const { 
    chats, 
    currentChat, 
    createChat, 
    setCurrentChat, 
    deleteChat, 
    renameChat, 
    togglePinChat 
  } = useChatStore()
  
  const [searchQuery, setSearchQuery] = useState('')
  const [editingChat, setEditingChat] = useState<string | null>(null)
  const [editingTitle, setEditingTitle] = useState('')
  const [hoveredChat, setHoveredChat] = useState<string | null>(null)

  const filteredChats = chats.filter(chat =>
    chat.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const pinnedChats = filteredChats.filter(chat => chat.isPinned)
  const unpinnedChats = filteredChats.filter(chat => !chat.isPinned)

  const handleCreateChat = () => {
    createChat()
  }

  const handleRenameChat = (chatId: string, newTitle: string) => {
    if (newTitle.trim()) {
      renameChat(chatId, newTitle.trim())
    }
    setEditingChat(null)
    setEditingTitle('')
  }

  const handleStartEdit = (chat: any) => {
    setEditingChat(chat.id)
    setEditingTitle(chat.title)
  }

  const handleKeyPress = (e: React.KeyboardEvent, chatId: string) => {
    if (e.key === 'Enter') {
      handleRenameChat(chatId, editingTitle)
    } else if (e.key === 'Escape') {
      setEditingChat(null)
      setEditingTitle('')
    }
  }

  return (
    <div className="w-80 h-full glass border-r border-white/10 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-white/10">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleCreateChat}
          className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          <Plus className="w-5 h-5" />
          <span>New Chat</span>
        </motion.button>
      </div>

      {/* Search */}
      <div className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search chats..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl glass focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
          />
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        <div className="p-2 space-y-1">
          {/* Pinned Chats */}
          {pinnedChats.length > 0 && (
            <div className="mb-4">
              <div className="px-2 py-1 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Pinned
              </div>
              <div className="space-y-1">
                {pinnedChats.map((chat) => (
                  <ChatItem
                    key={chat.id}
                    chat={chat}
                    isActive={currentChat?.id === chat.id}
                    onSelect={() => setCurrentChat(chat.id)}
                    onRename={(newTitle) => handleRenameChat(chat.id, newTitle)}
                    onDelete={() => deleteChat(chat.id)}
                    onTogglePin={() => togglePinChat(chat.id)}
                    onStartEdit={() => handleStartEdit(chat)}
                    isEditing={editingChat === chat.id}
                    editingTitle={editingTitle}
                    onEditingTitleChange={setEditingTitle}
                    onKeyPress={(e) => handleKeyPress(e, chat.id)}
                    onHover={() => setHoveredChat(chat.id)}
                    onLeave={() => setHoveredChat(null)}
                    isHovered={hoveredChat === chat.id}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Regular Chats */}
          {unpinnedChats.length > 0 && (
            <div>
              <div className="px-2 py-1 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Recent
              </div>
              <div className="space-y-1">
                {unpinnedChats.map((chat) => (
                  <ChatItem
                    key={chat.id}
                    chat={chat}
                    isActive={currentChat?.id === chat.id}
                    onSelect={() => setCurrentChat(chat.id)}
                    onRename={(newTitle) => handleRenameChat(chat.id, newTitle)}
                    onDelete={() => deleteChat(chat.id)}
                    onTogglePin={() => togglePinChat(chat.id)}
                    onStartEdit={() => handleStartEdit(chat)}
                    isEditing={editingChat === chat.id}
                    editingTitle={editingTitle}
                    onEditingTitleChange={setEditingTitle}
                    onKeyPress={(e) => handleKeyPress(e, chat.id)}
                    onHover={() => setHoveredChat(chat.id)}
                    onLeave={() => setHoveredChat(null)}
                    isHovered={hoveredChat === chat.id}
                  />
                ))}
              </div>
            </div>
          )}

          {filteredChats.length === 0 && (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-sm">No chats found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

interface ChatItemProps {
  chat: any
  isActive: boolean
  onSelect: () => void
  onRename: (title: string) => void
  onDelete: () => void
  onTogglePin: () => void
  onStartEdit: () => void
  isEditing: boolean
  editingTitle: string
  onEditingTitleChange: (title: string) => void
  onKeyPress: (e: React.KeyboardEvent) => void
  onHover: () => void
  onLeave: () => void
  isHovered: boolean
}

function ChatItem({
  chat,
  isActive,
  onSelect,
  onRename,
  onDelete,
  onTogglePin,
  onStartEdit,
  isEditing,
  editingTitle,
  onEditingTitleChange,
  onKeyPress,
  onHover,
  onLeave,
  isHovered
}: ChatItemProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={`group relative rounded-xl transition-all duration-200 ${
        isActive
          ? 'bg-primary-500/20 border border-primary-500/30'
          : 'hover:bg-white/10 border border-transparent'
      }`}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
    >
      <div className="flex items-center space-x-3 p-3">
        <MessageSquare className={`w-4 h-4 flex-shrink-0 ${
          isActive ? 'text-primary-400' : 'text-gray-400'
        }`} />
        
        <div className="flex-1 min-w-0">
          {isEditing ? (
            <input
              type="text"
              value={editingTitle}
              onChange={(e) => onEditingTitleChange(e.target.value)}
              onKeyDown={onKeyPress}
              onBlur={() => onRename(editingTitle)}
              className="w-full bg-transparent border-none outline-none text-sm font-medium"
              autoFocus
            />
          ) : (
            <div className="text-sm font-medium truncate">
              {chat.title}
            </div>
          )}
          
          <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
            <Clock className="w-3 h-3" />
            <span>{formatDistanceToNow(chat.updatedAt, { addSuffix: true })}</span>
          </div>
        </div>

        <AnimatePresence>
          {(isHovered || isActive) && !isEditing && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex items-center space-x-1"
            >
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onTogglePin}
                className="p-1 rounded hover:bg-white/20 transition-colors"
              >
                {chat.isPinned ? (
                  <Pin className="w-3 h-3 text-primary-400" />
                ) : (
                  <PinOff className="w-3 h-3 text-gray-400" />
                )}
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onStartEdit}
                className="p-1 rounded hover:bg-white/20 transition-colors"
              >
                <Edit3 className="w-3 h-3 text-gray-400" />
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onDelete}
                className="p-1 rounded hover:bg-red-500/20 transition-colors"
              >
                <Trash2 className="w-3 h-3 text-red-400" />
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}