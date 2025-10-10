'use client'

import { motion } from 'framer-motion'
import { 
  Sparkles, 
  Brain, 
  Zap, 
  Globe, 
  Calculator, 
  MessageSquare,
  Lightbulb,
  Rocket,
  Star,
  ArrowRight
} from 'lucide-react'
import { useChatStore } from '@/store/chat-store'

const features = [
  {
    icon: Brain,
    title: 'Super Intelligence',
    description: 'Combines the power of multiple AI models for unparalleled intelligence',
    color: 'from-blue-500 to-purple-600'
  },
  {
    icon: Zap,
    title: 'Lightning Fast',
    description: 'Instant responses with real-time streaming and zero delays',
    color: 'from-yellow-500 to-orange-600'
  },
  {
    icon: Globe,
    title: 'World Knowledge',
    description: 'Access to vast knowledge spanning all fields and current events',
    color: 'from-green-500 to-teal-600'
  },
  {
    icon: Calculator,
    title: 'Built-in Tools',
    description: 'Calculator, predictor, and reasoning engine built right in',
    color: 'from-pink-500 to-rose-600'
  },
  {
    icon: MessageSquare,
    title: 'Memory & Context',
    description: 'Remembers conversations and maintains context across sessions',
    color: 'from-indigo-500 to-blue-600'
  },
  {
    icon: Lightbulb,
    title: 'Creative & Motivational',
    description: 'Perfect for creative tasks, problem-solving, and motivation',
    color: 'from-amber-500 to-yellow-600'
  }
]

const examplePrompts = [
  "Explain quantum computing in simple terms",
  "Help me plan a startup business strategy",
  "Write a motivational speech about overcoming challenges",
  "Analyze the latest trends in AI technology",
  "Create a workout plan for beginners",
  "Explain the history of space exploration"
]

export default function WelcomeScreen() {
  const { createChat } = useChatStore()

  const handlePromptClick = (prompt: string) => {
    const chat = createChat()
    // In a real implementation, you would send this prompt to the AI
    console.log('Starting chat with prompt:', prompt)
  }

  return (
    <div className="flex flex-col items-center justify-center h-full px-6 py-12">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center mb-12"
      >
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-r from-primary-500 via-aurora-500 to-futuristic-500 flex items-center justify-center shadow-2xl"
        >
          <Sparkles className="w-12 h-12 text-white" />
        </motion.div>
        
        <h1 className="text-5xl font-bold mb-4 gradient-text">
          APRATIM'S AI 2.0
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl">
          The most powerful, intelligent, and visually stunning AI chatbot ever built.
          Experience the future of artificial intelligence.
        </p>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => createChat()}
          className="inline-flex items-center space-x-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-semibold text-lg shadow-xl hover:shadow-2xl transition-all duration-300"
        >
          <Rocket className="w-5 h-5" />
          <span>Start New Chat</span>
          <ArrowRight className="w-5 h-5" />
        </motion.button>
      </motion.div>

      {/* Features Grid */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12 max-w-6xl"
      >
        {features.map((feature, index) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 + index * 0.1 }}
            whileHover={{ scale: 1.05, y: -5 }}
            className="p-6 rounded-2xl glass hover:bg-white/20 transition-all duration-300 group"
          >
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
              <feature.icon className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">{feature.description}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Example Prompts */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.8 }}
        className="w-full max-w-4xl"
      >
        <h2 className="text-2xl font-bold text-center mb-6 gradient-text">
          Try These Examples
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {examplePrompts.map((prompt, index) => (
            <motion.button
              key={prompt}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 1 + index * 0.1 }}
              whileHover={{ scale: 1.02, x: 5 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handlePromptClick(prompt)}
              className="p-4 rounded-xl glass hover:bg-white/20 transition-all duration-300 text-left group"
            >
              <div className="flex items-center space-x-3">
                <Star className="w-4 h-4 text-primary-400 group-hover:text-primary-300 transition-colors" />
                <span className="text-sm font-medium">{prompt}</span>
              </div>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 1.2 }}
        className="mt-12 text-center"
      >
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Powered by advanced AI technology • Built with ❤️ by APRATIM
        </p>
      </motion.div>
    </div>
  )
}