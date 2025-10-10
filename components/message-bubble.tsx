'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Copy, 
  RotateCcw, 
  ThumbsUp, 
  ThumbsDown, 
  MoreVertical,
  Download,
  Share,
  Check,
  CheckCheck
} from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { useThemeStore } from '@/store/theme-store'
import { cn } from '@/lib/utils'
import { Message } from '@/store/chat-store'

interface MessageBubbleProps {
  message: Message
  onRegenerate?: () => void
  onCopy?: () => void
  onLike?: () => void
  onDislike?: () => void
}

export function MessageBubble({ 
  message, 
  onRegenerate, 
  onCopy, 
  onLike, 
  onDislike 
}: MessageBubbleProps) {
  const [showActions, setShowActions] = useState(false)
  const [copied, setCopied] = useState(false)
  const { theme } = useThemeStore()

  const isUser = message.role === 'user'
  const isStreaming = message.isStreaming

  const handleCopy = async () => {
    if (onCopy) {
      await onCopy()
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const formatTimestamp = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).format(date)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'group relative',
        isUser ? 'flex justify-end' : 'flex justify-start'
      )}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className={cn(
        'flex items-start gap-3 max-w-3xl',
        isUser ? 'flex-row-reverse' : 'flex-row'
      )}>
        {/* Avatar */}
        <div className={cn(
          'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0',
          isUser ? 'bg-gray-500' : 'bg-gradient-to-r from-primary-500 to-secondary-500'
        )}>
          {isUser ? (
            <span className="text-white font-bold text-sm">U</span>
          ) : (
            <span className="text-white font-bold text-sm">A</span>
          )}
        </div>

        {/* Message Content */}
        <div className={cn(
          'flex-1 min-w-0',
          isUser ? 'flex flex-col items-end' : 'flex flex-col items-start'
        )}>
          <div className={cn(
            'relative p-4 rounded-2xl max-w-2xl',
            isUser ? (
              theme === 'dark' ? 'bg-primary-600 text-white' :
              theme === 'aurora' ? 'bg-white/20 text-white backdrop-blur-md' :
              'bg-primary-500 text-white'
            ) : (
              theme === 'dark' ? 'bg-dark-700 text-white' :
              theme === 'aurora' ? 'bg-white/10 text-white backdrop-blur-md' :
              'bg-gray-100 text-gray-900'
            ),
            isStreaming && 'animate-pulse'
          )}>
            {/* Message Text */}
            <div className="prose prose-sm max-w-none dark:prose-invert">
              {isUser ? (
                <p className="m-0 whitespace-pre-wrap">{message.content}</p>
              ) : (
                <ReactMarkdown
                  components={{
                    code({ node, inline, className, children, ...props }) {
                      const match = /language-(\w+)/.exec(className || '')
                      return !inline && match ? (
                        <SyntaxHighlighter
                          style={theme === 'dark' ? oneDark : oneLight}
                          language={match[1]}
                          PreTag="div"
                          className="rounded-lg"
                          {...props}
                        >
                          {String(children).replace(/\n$/, '')}
                        </SyntaxHighlighter>
                      ) : (
                        <code className={cn(
                          'px-1.5 py-0.5 rounded text-sm',
                          theme === 'dark' ? 'bg-dark-600 text-primary-300' :
                          'bg-gray-200 text-primary-600'
                        )} {...props}>
                          {children}
                        </code>
                      )
                    },
                    p: ({ children }) => <p className="m-0 mb-2 last:mb-0">{children}</p>,
                    ul: ({ children }) => <ul className="m-0 mb-2 last:mb-0 pl-4">{children}</ul>,
                    ol: ({ children }) => <ol className="m-0 mb-2 last:mb-0 pl-4">{children}</ol>,
                    li: ({ children }) => <li className="m-0">{children}</li>,
                    h1: ({ children }) => <h1 className="text-xl font-bold m-0 mb-2">{children}</h1>,
                    h2: ({ children }) => <h2 className="text-lg font-bold m-0 mb-2">{children}</h2>,
                    h3: ({ children }) => <h3 className="text-base font-bold m-0 mb-2">{children}</h3>,
                    blockquote: ({ children }) => (
                      <blockquote className="border-l-4 border-primary-500 pl-4 italic m-0 mb-2">
                        {children}
                      </blockquote>
                    ),
                    table: ({ children }) => (
                      <div className="overflow-x-auto">
                        <table className="min-w-full border-collapse border border-gray-300 dark:border-gray-600">
                          {children}
                        </table>
                      </div>
                    ),
                    th: ({ children }) => (
                      <th className="border border-gray-300 dark:border-gray-600 px-3 py-2 bg-gray-100 dark:bg-gray-700 font-semibold text-left">
                        {children}
                      </th>
                    ),
                    td: ({ children }) => (
                      <td className="border border-gray-300 dark:border-gray-600 px-3 py-2">
                        {children}
                      </td>
                    )
                  }}
                >
                  {message.content}
                </ReactMarkdown>
              )}
            </div>

            {/* Streaming Indicator */}
            {isStreaming && (
              <div className="flex items-center gap-1 mt-2">
                <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
              </div>
            )}
          </div>

          {/* Timestamp and Status */}
          <div className={cn(
            'flex items-center gap-2 mt-1 text-xs text-gray-500',
            isUser ? 'flex-row-reverse' : 'flex-row'
          )}>
            <span>{formatTimestamp(message.timestamp)}</span>
            {isUser && (
              <div className="flex items-center">
                {copied ? (
                  <CheckCheck className="w-3 h-3 text-green-500" />
                ) : (
                  <Check className="w-3 h-3" />
                )}
              </div>
            )}
            {message.metadata?.tokens && (
              <span className="text-gray-400">
                {message.metadata.tokens} tokens
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <AnimatePresence>
        {showActions && !isUser && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className={cn(
              'absolute top-0 right-0 flex items-center gap-1 p-1 rounded-lg shadow-lg',
              theme === 'dark' ? 'bg-dark-800 border border-dark-700' :
              theme === 'aurora' ? 'bg-white/20 border border-white/30 backdrop-blur-md' :
              'bg-white border border-gray-200'
            )}
          >
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleCopy}
              className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title="Copy message"
            >
              {copied ? (
                <Check className="w-4 h-4 text-green-500" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </motion.button>

            {onRegenerate && (
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onRegenerate}
                className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                title="Regenerate response"
              >
                <RotateCcw className="w-4 h-4" />
              </motion.button>
            )}

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onLike}
              className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title="Like response"
            >
              <ThumbsUp className="w-4 h-4" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onDislike}
              className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title="Dislike response"
            >
              <ThumbsDown className="w-4 h-4" />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}