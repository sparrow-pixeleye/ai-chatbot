import mongoose, { Document, Schema } from 'mongoose'

export interface IMessage extends Document {
  _id: string
  chatId: string
  userId?: string
  content: string
  role: 'user' | 'assistant'
  metadata?: {
    model?: string
    tokens?: number
    thinkingTime?: number
  }
  createdAt: Date
  updatedAt: Date
}

const MessageSchema = new Schema<IMessage>({
  _id: { type: String, required: true },
  chatId: { type: String, required: true },
  userId: { type: String, required: false },
  content: { type: String, required: true },
  role: { type: String, enum: ['user', 'assistant'], required: true },
  metadata: {
    model: { type: String },
    tokens: { type: Number, default: 0 },
    thinkingTime: { type: Number, default: 0 }
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true,
  _id: false
})

// Index for efficient queries
MessageSchema.index({ chatId: 1, createdAt: 1 })
MessageSchema.index({ userId: 1, createdAt: -1 })

export const Message = mongoose.model<IMessage>('Message', MessageSchema)