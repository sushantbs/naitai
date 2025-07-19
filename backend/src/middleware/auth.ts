import { Request, Response, NextFunction } from 'express'
import { createClient } from '@supabase/supabase-js'

// Extend Request interface to include user
interface AuthenticatedRequest extends Request {
  user?: {
    id: string
    email?: string
    [key: string]: any
  }
}

const supabaseUrl = process.env.SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

export const authenticateUser = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        error: 'Authentication required',
        message: 'Please provide a valid authorization token',
      })
      return
    }

    const token = authHeader.substring(7) // Remove 'Bearer ' prefix

    // Verify the JWT token with Supabase
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token)

    if (error || !user) {
      res.status(401).json({
        error: 'Invalid token',
        message: 'The provided token is invalid or expired',
      })
      return
    }

    // Attach user to request object
    req.user = user
    next()
  } catch (error) {
    console.error('Authentication error:', error)
    res.status(500).json({
      error: 'Authentication failed',
      message: 'An error occurred while verifying your token',
    })
  }
}

// Optional authentication middleware (doesn't fail if no token)
export const optionalAuth = async (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7)
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser(token)

      if (!error && user) {
        req.user = user
      }
    }

    next()
  } catch (error) {
    console.error('Optional auth error:', error)
    next() // Continue even if authentication fails
  }
}

export type { AuthenticatedRequest }
