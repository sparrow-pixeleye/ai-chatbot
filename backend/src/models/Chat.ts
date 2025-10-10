import mongoose, { Document, Schema } from 'mongoose'

export interface IChat extends Document {
  _id: string
  userId?: string
  title: string
  model: string
  settings: {
    temperature: number
    maxTokens: number
    systemPrompt: string
  }
  isPinned: boolean
  createdAt: Date
  updatedAt: Date
}

const ChatSchema = new Schema<IChat>({
  _id: { type: String, required: true },
  userId: { type: String, required: false },
  title: { type: String, required: true },
  model: { type: String, required: true, default: 'gpt-4' },
  settings: {
    temperature: { type: Number, default: 0.7, min: 0, max: 2 },
    maxTokens: { type: Number, default: 4000, min: 1, max: 8000 },
    systemPrompt: { type: String, default: '' }
  },
  isPinned: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true,
  _id: false
})

// Index for efficient queries
ChatSchema.index({ userId: 1, updatedAt: -1 })
ChatSchema.index({ userId: 1, isPinned: -1, updatedAt: -1 })

export const Chat = mongoose.model<IChat>('Chat', ChatSchema)