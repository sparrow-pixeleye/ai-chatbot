import { Router } from 'express'
import { body, validationResult } from 'express-validator'
import { UserController } from '../controllers/UserController'
import { authMiddleware } from '../middleware/auth'

const router = Router()
const userController = new UserController()

// Validation middleware
const validateRegister = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('name').notEmpty().withMessage('Name is required'),
]

const validateLogin = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
]

// User routes
router.post('/register', validateRegister, async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const result = await userController.register(req.body)
    res.status(201).json(result)
  } catch (error) {
    console.error('User registration error:', error)
    res.status(500).json({ error: 'Failed to register user' })
  }
})

router.post('/login', validateLogin, async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const result = await userController.login(req.body)
    res.json(result)
  } catch (error) {
    console.error('User login error:', error)
    res.status(500).json({ error: 'Failed to login' })
  }
})

router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const result = await userController.getProfile(req.user?.id)
    res.json(result)
  } catch (error) {
    console.error('Get profile error:', error)
    res.status(500).json({ error: 'Failed to get profile' })
  }
})

router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const result = await userController.updateProfile(req.user?.id, req.body)
    res.json(result)
  } catch (error) {
    console.error('Update profile error:', error)
    res.status(500).json({ error: 'Failed to update profile' })
  }
})

router.post('/logout', authMiddleware, async (req, res) => {
  try {
    // In a real app, you might want to blacklist the token
    res.json({ message: 'Logged out successfully' })
  } catch (error) {
    console.error('Logout error:', error)
    res.status(500).json({ error: 'Failed to logout' })
  }
})

export { router as userRoutes }