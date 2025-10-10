import mongoose, { Document, Schema } from 'mongoose'

export interface IMessage {
  id: string
  content: string
  role: 'user' | 'assistant'
  timestamp: Date
  isTyping?: boolean
}

export interface IChat extends Document {
  id: string
  title: string
  messages: IMessage[]
  userId?: string
  createdAt: Date
  updatedAt: Date
  isPinned?: boolean
  metadata?: {
    model?: string
    temperature?: number
    maxTokens?: number
  }
}

const MessageSchema = new Schema<IMessage>({
  id: { type: String, required: true },
  content: { type: String, required: true },
  role: { type: String, enum: ['user', 'assistant'], required: true },
  timestamp: { type: Date, default: Date.now },
  isTyping: { type: Boolean, default: false }
}, { _id: false })

const ChatSchema = new Schema<IChat>({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  messages: [MessageSchema],
  userId: { type: String, required: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  isPinned: { type: Boolean, default: false },
  metadata: {
    model: { type: String, default: 'gpt-4' },
    temperature: { type: Number, default: 0.7 },
    maxTokens: { type: Number, default: 2000 }
  }
})

// Update the updatedAt field before saving
ChatSchema.pre('save', function(next) {
  this.updatedAt = new Date()
  next()
})

// Index for efficient queries
ChatSchema.index({ userId: 1, updatedAt: -1 })
ChatSchema.index({ id: 1 })

export default mongoose.model<IChat>('Chat', ChatSchema)