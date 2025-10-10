'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Sparkles, 
  Brain, 
  Zap, 
  Globe, 
  Calculator,
  MessageSquare,
  ArrowRight,
  Star,
  Lightbulb,
  Target
} from 'lucide-react'
import { useChatStore } from '@/store/chat-store'
import { useThemeStore } from '@/store/theme-store'
import { cn } from '@/lib/utils'

const features = [
  {
    icon: Brain,
    title: 'God-Level Intelligence',
    description: 'Combines the power of ChatGPT, Gemini, Claude, and more'
  },
  {
    icon: Globe,
    title: 'Universal Knowledge',
    description: 'Complete understanding from ancient times to 2025+'
  },
  {
    icon: Calculator,
    title: 'Advanced Reasoning',
    description: 'Built-in calculator, predictor, and logical deduction'
  },
  {
    icon: MessageSquare,
    title: 'Contextual Memory',
    description: 'Remembers conversations across sessions'
  },
  {
    icon: Lightbulb,
    title: 'Psychological Insight',
    description: 'Deep understanding of human psychology and motivation'
  },
  {
    icon: Zap,
    title: 'Instant Responses',
    description: 'Zero errors, smooth natural replies to any prompt'
  }
]

const examplePrompts = [
  "Explain quantum computing in simple terms",
  "Help me plan a startup business strategy",
  "Write a motivational speech about overcoming challenges",
  "Analyze the latest AI trends and predict the future",
  "Create a personalized workout and diet plan",
  "Teach me advanced mathematics concepts"
]

export function WelcomeScreen() {
  const [selectedPrompt, setSelectedPrompt] = useState('')
  const { createChat, sendMessage } = useChatStore()
  const { theme } = useThemeStore()

  const handlePromptClick = (prompt: string) => {
    setSelectedPrompt(prompt)
  }

  const handleStartChat = () => {
    const chatId = createChat()
    if (selectedPrompt) {
      setTimeout(() => {
        sendMessage(selectedPrompt)
      }, 100)
    }
  }

  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="max-w-4xl w-full">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
            animate={{ 
              background: [
                'linear-gradient(45deg, #667eea, #764ba2)',
                'linear-gradient(45deg, #f093fb, #f5576c)',
                'linear-gradient(45deg, #4facfe, #00f2fe)',
                'linear-gradient(45deg, #667eea, #764ba2)'
              ]
            }}
            transition={{ duration: 4, repeat: Infinity }}
            style={{ backgroundSize: '200% 200%' }}
          >
            <Sparkles className="w-5 h-5 text-white" />
            <span className="text-white font-medium">Welcome to the Future</span>
          </motion.div>

          <h1 className="text-6xl font-bold mb-6">
            <span className="gradient-text">APRATIM'S AI 2.0</span>
          </h1>
          
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            The most powerful, intelligent, and visually stunning AI assistant ever created. 
            Experience God-level intelligence with futuristic design.
          </p>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleStartChat}
            className={cn(
              'inline-flex items-center gap-2 px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-200',
              theme === 'dark' ? 'bg-primary-600 hover:bg-primary-700 text-white' :
              theme === 'aurora' ? 'bg-white/20 hover:bg-white/30 text-white backdrop-blur-md' :
              'bg-primary-500 hover:bg-primary-600 text-white'
            )}
          >
            Start New Chat
            <ArrowRight className="w-5 h-5" />
          </motion.button>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12"
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 * index }}
              whileHover={{ scale: 1.02, y: -5 }}
              className={cn(
                'p-6 rounded-xl border transition-all duration-200',
                theme === 'dark' ? 'bg-dark-800/50 border-dark-700 hover:bg-dark-700/50' :
                theme === 'aurora' ? 'bg-white/10 border-white/20 hover:bg-white/20 backdrop-blur-md' :
                'bg-white/80 border-gray-200 hover:bg-white backdrop-blur-md'
              )}
            >
              <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-primary-500 to-secondary-500 flex items-center justify-center mb-4">
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
                {feature.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* Example Prompts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center"
        >
          <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
            Try these examples
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
            {examplePrompts.map((prompt, index) => (
              <motion.button
                key={prompt}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.1 * index }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handlePromptClick(prompt)}
                className={cn(
                  'p-4 rounded-xl text-left transition-all duration-200',
                  selectedPrompt === prompt ? (
                    theme === 'dark' ? 'bg-primary-600/20 border-primary-500' :
                    theme === 'aurora' ? 'bg-white/20 border-white/30' :
                    'bg-primary-50 border-primary-200'
                  ) : (
                    theme === 'dark' ? 'bg-dark-800/50 border-dark-700 hover:bg-dark-700/50' :
                    theme === 'aurora' ? 'bg-white/10 border-white/20 hover:bg-white/20' :
                    'bg-white/80 border-gray-200 hover:bg-gray-50'
                  )
                )}
              >
                <div className="flex items-start gap-3">
                  <Lightbulb className="w-5 h-5 text-primary-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {prompt}
                  </span>
                </div>
              </motion.button>
            ))}
          </div>

          {selectedPrompt && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6"
            >
              <button
                onClick={handleStartChat}
                className={cn(
                  'inline-flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-200',
                  theme === 'dark' ? 'bg-primary-600 hover:bg-primary-700 text-white' :
                  theme === 'aurora' ? 'bg-white/20 hover:bg-white/30 text-white backdrop-blur-md' :
                  'bg-primary-500 hover:bg-primary-600 text-white'
                )}
              >
                <MessageSquare className="w-4 h-4" />
                Start with this prompt
                <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  )
}