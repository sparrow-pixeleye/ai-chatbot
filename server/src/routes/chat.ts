import express from 'express'
import { body, param, query, validationResult } from 'express-validator'
import Chat from '../models/Chat'
import { createError } from '../middleware/errorHandler'

const router = express.Router()

// Get all chats
router.get('/', async (req, res, next) => {
  try {
    const { userId, limit = 50, offset = 0 } = req.query
    
    const query: any = {}
    if (userId) query.userId = userId
    
    const chats = await Chat.find(query)
      .sort({ updatedAt: -1 })
      .limit(parseInt(limit as string))
      .skip(parseInt(offset as string))
      .select('-messages')
    
    res.json({
      success: true,
      data: chats
    })
  } catch (error) {
    next(error)
  }
})

// Get specific chat
router.get('/:id', [
  param('id').isString().notEmpty()
], async (req, res, next) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      throw createError('Invalid chat ID', 400)
    }

    const chat = await Chat.findOne({ id: req.params.id })
    
    if (!chat) {
      throw createError('Chat not found', 404)
    }

    res.json({
      success: true,
      data: chat
    })
  } catch (error) {
    next(error)
  }
})

// Create new chat
router.post('/', [
  body('title').optional().isString().trim().isLength({ min: 1, max: 100 }),
  body('userId').optional().isString(),
  body('metadata').optional().isObject()
], async (req, res, next) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      throw createError('Invalid input data', 400)
    }

    const { title = 'New Chat', userId, metadata = {} } = req.body
    
    const chat = new Chat({
      id: Date.now().toString(),
      title,
      messages: [],
      userId,
      metadata
    })

    await chat.save()

    res.status(201).json({
      success: true,
      data: chat
    })
  } catch (error) {
    next(error)
  }
})

// Update chat
router.put('/:id', [
  param('id').isString().notEmpty(),
  body('title').optional().isString().trim().isLength({ min: 1, max: 100 }),
  body('isPinned').optional().isBoolean(),
  body('metadata').optional().isObject()
], async (req, res, next) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      throw createError('Invalid input data', 400)
    }

    const { title, isPinned, metadata } = req.body
    const updateData: any = {}
    
    if (title !== undefined) updateData.title = title
    if (isPinned !== undefined) updateData.isPinned = isPinned
    if (metadata !== undefined) updateData.metadata = { ...updateData.metadata, ...metadata }

    const chat = await Chat.findOneAndUpdate(
      { id: req.params.id },
      updateData,
      { new: true, runValidators: true }
    )

    if (!chat) {
      throw createError('Chat not found', 404)
    }

    res.json({
      success: true,
      data: chat
    })
  } catch (error) {
    next(error)
  }
})

// Add message to chat
router.post('/:id/messages', [
  param('id').isString().notEmpty(),
  body('content').isString().trim().isLength({ min: 1, max: 10000 }),
  body('role').isIn(['user', 'assistant']),
  body('isTyping').optional().isBoolean()
], async (req, res, next) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      throw createError('Invalid message data', 400)
    }

    const { content, role, isTyping = false } = req.body
    
    const message = {
      id: Date.now().toString(),
      content,
      role,
      timestamp: new Date(),
      isTyping
    }

    const chat = await Chat.findOneAndUpdate(
      { id: req.params.id },
      { 
        $push: { messages: message },
        $set: { updatedAt: new Date() }
      },
      { new: true, runValidators: true }
    )

    if (!chat) {
      throw createError('Chat not found', 404)
    }

    res.json({
      success: true,
      data: message
    })
  } catch (error) {
    next(error)
  }
})

// Update message in chat
router.put('/:id/messages/:messageId', [
  param('id').isString().notEmpty(),
  param('messageId').isString().notEmpty(),
  body('content').isString().trim().isLength({ min: 1, max: 10000 })
], async (req, res, next) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      throw createError('Invalid input data', 400)
    }

    const { content } = req.body
    
    const chat = await Chat.findOne({ id: req.params.id })
    if (!chat) {
      throw createError('Chat not found', 404)
    }

    const message = chat.messages.id(req.params.messageId)
    if (!message) {
      throw createError('Message not found', 404)
    }

    message.content = content
    chat.updatedAt = new Date()
    await chat.save()

    res.json({
      success: true,
      data: message
    })
  } catch (error) {
    next(error)
  }
})

// Delete message from chat
router.delete('/:id/messages/:messageId', [
  param('id').isString().notEmpty(),
  param('messageId').isString().notEmpty()
], async (req, res, next) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      throw createError('Invalid parameters', 400)
    }

    const chat = await Chat.findOne({ id: req.params.id })
    if (!chat) {
      throw createError('Chat not found', 404)
    }

    chat.messages.pull({ _id: req.params.messageId })
    chat.updatedAt = new Date()
    await chat.save()

    res.json({
      success: true,
      message: 'Message deleted successfully'
    })
  } catch (error) {
    next(error)
  }
})

// Delete chat
router.delete('/:id', [
  param('id').isString().notEmpty()
], async (req, res, next) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      throw createError('Invalid chat ID', 400)
    }

    const chat = await Chat.findOneAndDelete({ id: req.params.id })
    
    if (!chat) {
      throw createError('Chat not found', 404)
    }

    res.json({
      success: true,
      message: 'Chat deleted successfully'
    })
  } catch (error) {
    next(error)
  }
})

// Clear all chats
router.delete('/', async (req, res, next) => {
  try {
    await Chat.deleteMany({})
    
    res.json({
      success: true,
      message: 'All chats cleared successfully'
    })
  } catch (error) {
    next(error)
  }
})

export default router