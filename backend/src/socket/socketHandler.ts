import { Socket } from 'socket.io'
import jwt from 'jsonwebtoken'
import { User } from '../models/User'

export const socketHandler = (socket: Socket) => {
  console.log('New client connected:', socket.id)

  // Authenticate socket connection
  socket.on('authenticate', async (token: string) => {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any
      const user = await User.findById(decoded.userId).select('-password')
      
      if (user) {
        socket.data.userId = user._id
        socket.join(`user:${user._id}`)
        socket.emit('authenticated', { success: true })
        console.log(`User ${user.name} authenticated via socket`)
      } else {
        socket.emit('authentication_error', { error: 'Invalid token' })
      }
    } catch (error) {
      socket.emit('authentication_error', { error: 'Invalid token' })
    }
  })

  // Handle chat events
  socket.on('join_chat', (chatId: string) => {
    if (socket.data.userId) {
      socket.join(`chat:${chatId}`)
      console.log(`User ${socket.data.userId} joined chat ${chatId}`)
    }
  })

  socket.on('leave_chat', (chatId: string) => {
    socket.leave(`chat:${chatId}`)
    console.log(`User ${socket.data.userId} left chat ${chatId}`)
  })

  socket.on('typing_start', (data: { chatId: string }) => {
    if (socket.data.userId) {
      socket.to(`chat:${data.chatId}`).emit('user_typing', {
        userId: socket.data.userId,
        chatId: data.chatId
      })
    }
  })

  socket.on('typing_stop', (data: { chatId: string }) => {
    if (socket.data.userId) {
      socket.to(`chat:${data.chatId}`).emit('user_stopped_typing', {
        userId: socket.data.userId,
        chatId: data.chatId
      })
    }
  })

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id)
  })

  // Error handling
  socket.on('error', (error) => {
    console.error('Socket error:', error)
  })
}