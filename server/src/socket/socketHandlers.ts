import { Server } from 'socket.io'
import { generateResponse } from '../services/aiService'

export function setupSocketHandlers(io: Server) {
  io.on('connection', (socket) => {
    console.log('User connected:', socket.id)

    // Handle new message
    socket.on('message', async (data) => {
      try {
        const { message, chatId, model = 'gpt-4', temperature = 0.7, maxTokens = 2000 } = data

        // Emit typing indicator
        socket.emit('typing', { isTyping: true })

        // Generate AI response with streaming
        const response = await generateResponse(message, {
          model,
          temperature,
          maxTokens,
          chatId,
          stream: true,
          onChunk: (chunk: string) => {
            socket.emit('ai-chunk', { content: chunk, done: false })
          }
        })

        // Emit completion
        socket.emit('ai-chunk', { content: '', done: true })
        socket.emit('typing', { isTyping: false })

        // Emit full response
        socket.emit('ai-response', {
          content: response.content,
          model: response.model,
          usage: response.usage
        })

      } catch (error) {
        console.error('Socket error:', error)
        socket.emit('error', { message: 'Failed to generate response' })
        socket.emit('typing', { isTyping: false })
      }
    })

    // Handle typing indicator
    socket.on('typing', (data) => {
      socket.broadcast.emit('user-typing', {
        userId: socket.id,
        isTyping: data.isTyping
      })
    })

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id)
    })

    // Handle errors
    socket.on('error', (error) => {
      console.error('Socket error:', error)
    })
  })
}