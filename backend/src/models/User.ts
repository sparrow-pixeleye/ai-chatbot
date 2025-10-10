import mongoose, { Document, Schema } from 'mongoose'
import bcrypt from 'bcryptjs'

export interface IUser extends Document {
  _id: string
  email: string
  password: string
  name: string
  avatar?: string
  preferences: {
    theme: 'light' | 'dark' | 'aurora' | 'futuristic'
    language: string
    notifications: boolean
  }
  subscription: {
    plan: 'free' | 'pro' | 'enterprise'
    expiresAt?: Date
    features: string[]
  }
  usage: {
    messagesThisMonth: number
    tokensUsed: number
    lastReset: Date
  }
  createdAt: Date
  updatedAt: Date
}

const UserSchema = new Schema<IUser>({
  _id: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  avatar: { type: String },
  preferences: {
    theme: { type: String, enum: ['light', 'dark', 'aurora', 'futuristic'], default: 'light' },
    language: { type: String, default: 'en' },
    notifications: { type: Boolean, default: true }
  },
  subscription: {
    plan: { type: String, enum: ['free', 'pro', 'enterprise'], default: 'free' },
    expiresAt: { type: Date },
    features: [{ type: String }]
  },
  usage: {
    messagesThisMonth: { type: Number, default: 0 },
    tokensUsed: { type: Number, default: 0 },
    lastReset: { type: Date, default: Date.now }
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true,
  _id: false
})

// Hash password before saving
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next()
  
  try {
    const salt = await bcrypt.genSalt(12)
    this.password = await bcrypt.hash(this.password, salt)
    next()
  } catch (error) {
    next(error as Error)
  }
})

// Compare password method
UserSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password)
}

// Index for efficient queries
UserSchema.index({ email: 1 })
UserSchema.index({ 'subscription.plan': 1 })

export const User = mongoose.model<IUser>('User', UserSchema)