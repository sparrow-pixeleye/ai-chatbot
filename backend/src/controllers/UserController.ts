import { User } from '../models/User'
import { generateId } from '../utils/helpers'
import jwt from 'jsonwebtoken'

export class UserController {
  async register(data: any) {
    const { email, password, name } = data

    // Check if user already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      throw new Error('User already exists with this email')
    }

    // Create new user
    const user = new User({
      _id: generateId(),
      email,
      password,
      name,
      preferences: {
        theme: 'light',
        language: 'en',
        notifications: true
      },
      subscription: {
        plan: 'free',
        features: ['basic_chat', 'limited_tokens']
      },
      usage: {
        messagesThisMonth: 0,
        tokensUsed: 0,
        lastReset: new Date()
      }
    })

    await user.save()

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    )

    return {
      success: true,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        preferences: user.preferences,
        subscription: user.subscription
      },
      token
    }
  }

  async login(data: any) {
    const { email, password } = data

    // Find user
    const user = await User.findOne({ email })
    if (!user) {
      throw new Error('Invalid email or password')
    }

    // Check password
    const isMatch = await user.comparePassword(password)
    if (!isMatch) {
      throw new Error('Invalid email or password')
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    )

    return {
      success: true,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        preferences: user.preferences,
        subscription: user.subscription
      },
      token
    }
  }

  async getProfile(userId?: string) {
    if (!userId) {
      throw new Error('User ID is required')
    }

    const user = await User.findById(userId).select('-password')
    if (!user) {
      throw new Error('User not found')
    }

    return {
      success: true,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        preferences: user.preferences,
        subscription: user.subscription,
        usage: user.usage,
        createdAt: user.createdAt
      }
    }
  }

  async updateProfile(userId?: string, updates: any) {
    if (!userId) {
      throw new Error('User ID is required')
    }

    const allowedUpdates = ['name', 'avatar', 'preferences']
    const updateData: any = {}

    for (const key of allowedUpdates) {
      if (updates[key] !== undefined) {
        updateData[key] = updates[key]
      }
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { ...updateData, updatedAt: new Date() },
      { new: true }
    ).select('-password')

    if (!user) {
      throw new Error('User not found')
    }

    return {
      success: true,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        preferences: user.preferences,
        subscription: user.subscription,
        usage: user.usage,
        updatedAt: user.updatedAt
      }
    }
  }
}