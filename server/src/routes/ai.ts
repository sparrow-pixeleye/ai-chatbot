import express from 'express'
import { body, param, validationResult } from 'express-validator'
import { generateResponse } from '../services/aiService'
import { createError } from '../middleware/errorHandler'

const router = express.Router()

// Generate AI response
router.post('/generate', [
  body('message').isString().trim().isLength({ min: 1, max: 10000 }),
  body('chatId').optional().isString(),
  body('model').optional().isString(),
  body('temperature').optional().isFloat({ min: 0, max: 2 }),
  body('maxTokens').optional().isInt({ min: 1, max: 4000 }),
  body('stream').optional().isBoolean()
], async (req, res, next) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      throw createError('Invalid input data', 400)
    }

    const { 
      message, 
      chatId, 
      model = 'gpt-4', 
      temperature = 0.7, 
      maxTokens = 2000,
      stream = false 
    } = req.body

    if (stream) {
      // Set up Server-Sent Events for streaming
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Cache-Control'
      })

      try {
        await generateResponse(message, {
          model,
          temperature,
          maxTokens,
          chatId,
          stream: true,
          onChunk: (chunk: string) => {
            res.write(`data: ${JSON.stringify({ content: chunk, done: false })}\n\n`)
          }
        })

        res.write(`data: ${JSON.stringify({ content: '', done: true })}\n\n`)
        res.end()
      } catch (error) {
        res.write(`data: ${JSON.stringify({ error: 'Failed to generate response' })}\n\n`)
        res.end()
      }
    } else {
      // Regular response
      const response = await generateResponse(message, {
        model,
        temperature,
        maxTokens,
        chatId
      })

      res.json({
        success: true,
        data: response
      })
    }
  } catch (error) {
    next(error)
  }
})

// Get available models
router.get('/models', async (req, res, next) => {
  try {
    const models = [
      {
        id: 'gpt-4',
        name: 'GPT-4',
        provider: 'OpenAI',
        description: 'Most capable model for complex reasoning',
        maxTokens: 4000,
        cost: 'high'
      },
      {
        id: 'gpt-3.5-turbo',
        name: 'GPT-3.5 Turbo',
        provider: 'OpenAI',
        description: 'Fast and efficient for most tasks',
        maxTokens: 4000,
        cost: 'medium'
      },
      {
        id: 'claude-3-opus',
        name: 'Claude 3 Opus',
        provider: 'Anthropic',
        description: 'Advanced reasoning and analysis',
        maxTokens: 4000,
        cost: 'high'
      },
      {
        id: 'claude-3-sonnet',
        name: 'Claude 3 Sonnet',
        provider: 'Anthropic',
        description: 'Balanced performance and speed',
        maxTokens: 4000,
        cost: 'medium'
      },
      {
        id: 'gemini-pro',
        name: 'Gemini Pro',
        provider: 'Google',
        description: 'Google\'s most capable model',
        maxTokens: 4000,
        cost: 'medium'
      }
    ]

    res.json({
      success: true,
      data: models
    })
  } catch (error) {
    next(error)
  }
})

// Get AI capabilities
router.get('/capabilities', async (req, res, next) => {
  try {
    const capabilities = {
      features: [
        'Natural language understanding',
        'Code generation and explanation',
        'Creative writing and storytelling',
        'Mathematical problem solving',
        'Data analysis and visualization',
        'Translation between languages',
        'Summarization and extraction',
        'Question answering',
        'Conversation and chat',
        'Image analysis (when available)',
        'Voice interaction (when available)',
        'Real-time streaming responses'
      ],
      limitations: [
        'Knowledge cutoff date',
        'Cannot browse the internet in real-time',
        'May not have access to very recent events',
        'Cannot execute code or access external systems',
        'May occasionally produce inaccurate information'
      ],
      supportedFormats: [
        'Plain text',
        'Markdown',
        'Code (multiple languages)',
        'JSON',
        'XML',
        'CSV',
        'LaTeX'
      ]
    }

    res.json({
      success: true,
      data: capabilities
    })
  } catch (error) {
    next(error)
  }
})

export default router