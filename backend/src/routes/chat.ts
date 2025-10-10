import { Router } from 'express'
import { body, validationResult } from 'express-validator'
import { ChatController } from '../controllers/ChatController'
import { authMiddleware } from '../middleware/auth'

const router = Router()
const chatController = new ChatController()

// Validation middleware
const validateMessage = [
  body('message').notEmpty().withMessage('Message is required'),
  body('chatId').optional().isUUID().withMessage('Invalid chat ID'),
  body('model').optional().isIn(['gpt-3.5-turbo', 'gpt-4', 'gpt-4-turbo']).withMessage('Invalid model'),
  body('settings.temperature').optional().isFloat({ min: 0, max: 2 }).withMessage('Temperature must be between 0 and 2'),
  body('settings.maxTokens').optional().isInt({ min: 1, max: 8000 }).withMessage('Max tokens must be between 1 and 8000'),
]

// Chat routes
router.post('/send', authMiddleware, validateMessage, async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const result = await chatController.sendMessage(req.body, req.user?.id)
    res.json(result)
  } catch (error) {
    console.error('Chat send error:', error)
    res.status(500).json({ error: 'Failed to send message' })
  }
})

router.post('/stream', authMiddleware, validateMessage, async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    await chatController.streamMessage(req, res, req.user?.id)
  } catch (error) {
    console.error('Chat stream error:', error)
    if (!res.headersSent) {
      res.status(500).json({ error: 'Failed to stream message' })
    }
  }
})

router.get('/history/:chatId', authMiddleware, async (req, res) => {
  try {
    const { chatId } = req.params
    const { page = 1, limit = 50 } = req.query

    const result = await chatController.getChatHistory(
      chatId, 
      req.user?.id, 
      Number(page), 
      Number(limit)
    )
    res.json(result)
  } catch (error) {
    console.error('Chat history error:', error)
    res.status(500).json({ error: 'Failed to get chat history' })
  }
})

router.get('/chats', authMiddleware, async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query

    const result = await chatController.getUserChats(
      req.user?.id,
      Number(page),
      Number(limit),
      search as string
    )
    res.json(result)
  } catch (error) {
    console.error('Get chats error:', error)
    res.status(500).json({ error: 'Failed to get chats' })
  }
})

router.post('/chats', authMiddleware, async (req, res) => {
  try {
    const { title, model = 'gpt-4', settings } = req.body

    const result = await chatController.createChat(
      req.user?.id,
      title,
      model,
      settings
    )
    res.status(201).json(result)
  } catch (error) {
    console.error('Create chat error:', error)
    res.status(500).json({ error: 'Failed to create chat' })
  }
})

router.put('/chats/:chatId', authMiddleware, async (req, res) => {
  try {
    const { chatId } = req.params
    const updates = req.body

    const result = await chatController.updateChat(
      chatId,
      req.user?.id,
      updates
    )
    res.json(result)
  } catch (error) {
    console.error('Update chat error:', error)
    res.status(500).json({ error: 'Failed to update chat' })
  }
})

router.delete('/chats/:chatId', authMiddleware, async (req, res) => {
  try {
    const { chatId } = req.params

    await chatController.deleteChat(chatId, req.user?.id)
    res.status(204).send()
  } catch (error) {
    console.error('Delete chat error:', error)
    res.status(500).json({ error: 'Failed to delete chat' })
  }
})

router.post('/regenerate', authMiddleware, async (req, res) => {
  try {
    const { messageId, chatId } = req.body

    const result = await chatController.regenerateResponse(
      messageId,
      chatId,
      req.user?.id
    )
    res.json(result)
  } catch (error) {
    console.error('Regenerate error:', error)
    res.status(500).json({ error: 'Failed to regenerate response' })
  }
})

export { router as chatRoutes }