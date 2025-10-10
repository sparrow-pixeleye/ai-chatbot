import { RateLimiterMemory } from 'rate-limiter-flexible'
import { Request, Response, NextFunction } from 'express'

const rateLimiter = new RateLimiterMemory({
  keyPrefix: 'middleware',
  points: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  duration: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000') / 1000, // 15 minutes
})

export const rateLimiterMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    await rateLimiter.consume(req.ip)
    next()
  } catch (rejRes) {
    res.status(429).json({
      success: false,
      error: {
        message: 'Too many requests, please try again later',
        retryAfter: Math.round(rejRes.msBeforeNext / 1000) || 1
      }
    })
  }
}

export { rateLimiterMiddleware as rateLimiter }