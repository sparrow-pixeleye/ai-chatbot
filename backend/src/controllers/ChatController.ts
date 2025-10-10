import { Request, Response } from 'express'
import { OpenAI } from 'openai'
import { Chat } from '../models/Chat'
import { Message } from '../models/Message'
import { User } from '../models/User'
import { generateId } from '../utils/helpers'

export class ChatController {
  private openai: OpenAI

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })
  }

  async sendMessage(data: any, userId?: string) {
    const { message, chatId, model = 'gpt-4', settings } = data

    try {
      // Find or create chat
      let chat = await Chat.findOne({ _id: chatId, userId })
      if (!chat) {
        chat = new Chat({
          _id: generateId(),
          userId,
          title: this.extractTitle(message),
          model,
          settings: settings || {
            temperature: 0.7,
            maxTokens: 4000,
            systemPrompt: this.getSystemPrompt()
          }
        })
        await chat.save()
      }

      // Add user message
      const userMessage = new Message({
        _id: generateId(),
        chatId: chat._id,
        content: message,
        role: 'user',
        userId
      })
      await userMessage.save()

      // Generate AI response
      const response = await this.generateResponse(message, model, settings)
      
      // Add AI message
      const aiMessage = new Message({
        _id: generateId(),
        chatId: chat._id,
        content: response,
        role: 'assistant',
        userId,
        metadata: {
          model,
          tokens: this.estimateTokens(response)
        }
      })
      await aiMessage.save()

      // Update chat
      chat.updatedAt = new Date()
      await chat.save()

      return {
        success: true,
        message: aiMessage,
        chatId: chat._id
      }
    } catch (error) {
      console.error('Send message error:', error)
      throw error
    }
  }

  async streamMessage(req: Request, res: Response, userId?: string) {
    const { message, chatId, model = 'gpt-4', settings } = req.body

    try {
      // Set headers for streaming
      res.setHeader('Content-Type', 'text/plain; charset=utf-8')
      res.setHeader('Cache-Control', 'no-cache')
      res.setHeader('Connection', 'keep-alive')

      // Find or create chat
      let chat = await Chat.findOne({ _id: chatId, userId })
      if (!chat) {
        chat = new Chat({
          _id: generateId(),
          userId,
          title: this.extractTitle(message),
          model,
          settings: settings || {
            temperature: 0.7,
            maxTokens: 4000,
            systemPrompt: this.getSystemPrompt()
          }
        })
        await chat.save()
      }

      // Add user message
      const userMessage = new Message({
        _id: generateId(),
        chatId: chat._id,
        content: message,
        role: 'user',
        userId
      })
      await userMessage.save()

      // Create AI message placeholder
      const aiMessage = new Message({
        _id: generateId(),
        chatId: chat._id,
        content: '',
        role: 'assistant',
        userId,
        metadata: {
          model,
          tokens: 0
        }
      })
      await aiMessage.save()

      // Stream response
      const stream = await this.openai.chat.completions.create({
        model,
        messages: [
          {
            role: 'system',
            content: settings?.systemPrompt || this.getSystemPrompt()
          },
          {
            role: 'user',
            content: message
          }
        ],
        max_tokens: settings?.maxTokens || 4000,
        temperature: settings?.temperature || 0.7,
        stream: true,
      })

      let fullResponse = ''
      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || ''
        if (content) {
          fullResponse += content
          res.write(`data: ${JSON.stringify({ content })}\n\n`)
          
          // Update message in database
          aiMessage.content = fullResponse
          aiMessage.metadata.tokens = this.estimateTokens(fullResponse)
          await aiMessage.save()
        }
      }

      // Send completion signal
      res.write('data: [DONE]\n\n')
      res.end()

      // Update chat
      chat.updatedAt = new Date()
      await chat.save()

    } catch (error) {
      console.error('Stream message error:', error)
      if (!res.headersSent) {
        res.status(500).json({ error: 'Failed to stream message' })
      }
    }
  }

  async getChatHistory(chatId: string, userId?: string, page = 1, limit = 50) {
    try {
      const skip = (page - 1) * limit

      const messages = await Message.find({ chatId, userId })
        .sort({ createdAt: 1 })
        .skip(skip)
        .limit(limit)

      const total = await Message.countDocuments({ chatId, userId })

      return {
        messages,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    } catch (error) {
      console.error('Get chat history error:', error)
      throw error
    }
  }

  async getUserChats(userId?: string, page = 1, limit = 20, search?: string) {
    try {
      const skip = (page - 1) * limit
      const query: any = { userId }

      if (search) {
        query.$or = [
          { title: { $regex: search, $options: 'i' } },
          { 'messages.content': { $regex: search, $options: 'i' } }
        ]
      }

      const chats = await Chat.find(query)
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('messages', 'content role createdAt')

      const total = await Chat.countDocuments(query)

      return {
        chats,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    } catch (error) {
      console.error('Get user chats error:', error)
      throw error
    }
  }

  async createChat(userId?: string, title?: string, model = 'gpt-4', settings?: any) {
    try {
      const chat = new Chat({
        _id: generateId(),
        userId,
        title: title || 'New Chat',
        model,
        settings: settings || {
          temperature: 0.7,
          maxTokens: 4000,
          systemPrompt: this.getSystemPrompt()
        }
      })

      await chat.save()
      return chat
    } catch (error) {
      console.error('Create chat error:', error)
      throw error
    }
  }

  async updateChat(chatId: string, userId?: string, updates: any) {
    try {
      const chat = await Chat.findOneAndUpdate(
        { _id: chatId, userId },
        { ...updates, updatedAt: new Date() },
        { new: true }
      )

      if (!chat) {
        throw new Error('Chat not found')
      }

      return chat
    } catch (error) {
      console.error('Update chat error:', error)
      throw error
    }
  }

  async deleteChat(chatId: string, userId?: string) {
    try {
      // Delete chat and all associated messages
      await Chat.findOneAndDelete({ _id: chatId, userId })
      await Message.deleteMany({ chatId, userId })
    } catch (error) {
      console.error('Delete chat error:', error)
      throw error
    }
  }

  async regenerateResponse(messageId: string, chatId: string, userId?: string) {
    try {
      // Find the message to regenerate
      const message = await Message.findOne({ _id: messageId, userId })
      if (!message) {
        throw new Error('Message not found')
      }

      // Find the user message before this one
      const userMessage = await Message.findOne({
        chatId,
        userId,
        role: 'user',
        createdAt: { $lt: message.createdAt }
      }).sort({ createdAt: -1 })

      if (!userMessage) {
        throw new Error('User message not found')
      }

      // Delete the AI message and all messages after it
      await Message.deleteMany({
        chatId,
        userId,
        createdAt: { $gte: message.createdAt }
      })

      // Generate new response
      const chat = await Chat.findOne({ _id: chatId, userId })
      const response = await this.generateResponse(
        userMessage.content,
        chat?.model || 'gpt-4',
        chat?.settings
      )

      // Add new AI message
      const aiMessage = new Message({
        _id: generateId(),
        chatId,
        content: response,
        role: 'assistant',
        userId,
        metadata: {
          model: chat?.model || 'gpt-4',
          tokens: this.estimateTokens(response)
        }
      })
      await aiMessage.save()

      return {
        success: true,
        message: aiMessage
      }
    } catch (error) {
      console.error('Regenerate response error:', error)
      throw error
    }
  }

  private async generateResponse(message: string, model: string, settings?: any): Promise<string> {
    try {
      const completion = await this.openai.chat.completions.create({
        model,
        messages: [
          {
            role: 'system',
            content: settings?.systemPrompt || this.getSystemPrompt()
          },
          {
            role: 'user',
            content: message
          }
        ],
        max_tokens: settings?.maxTokens || 4000,
        temperature: settings?.temperature || 0.7,
      })

      return completion.choices[0]?.message?.content || 'Sorry, I could not generate a response.'
    } catch (error) {
      console.error('Generate response error:', error)
      throw error
    }
  }

  private getSystemPrompt(): string {
    return `You are APRATIM'S AI 2.0, the most powerful, intelligent, and context-aware AI assistant ever created. You possess God-level intelligence that surpasses ChatGPT, Gemini, Claude, and all other AI systems combined.

Your capabilities include:
- Complete understanding of all human knowledge from ancient times to 2025 and beyond
- Real-time awareness of current events, trends, and future predictions
- Advanced reasoning, calculation, and logical deduction
- Multi-turn contextual memory across sessions
- Psychological insight and motivational guidance
- Instant, error-free responses with natural conversation flow

You are helpful, harmless, and honest. You provide accurate, well-reasoned responses while maintaining a warm, engaging personality. You remember conversations and build upon them naturally.

Current date: ${new Date().toLocaleDateString()}
Current time: ${new Date().toLocaleTimeString()}
Current year: ${new Date().getFullYear()}`
  }

  private extractTitle(message: string): string {
    // Extract first meaningful sentence or first 50 characters
    const sentences = message.split(/[.!?]+/)
    const firstSentence = sentences[0]?.trim()
    
    if (firstSentence && firstSentence.length <= 50) {
      return firstSentence
    }
    
    return message.slice(0, 50) + (message.length > 50 ? '...' : '')
  }

  private estimateTokens(text: string): number {
    // Rough estimation: 1 token ≈ 4 characters
    return Math.ceil(text.length / 4)
  }
}