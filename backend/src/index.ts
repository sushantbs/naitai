import express, { Request, Response, NextFunction } from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'
import { authenticateUser, AuthenticatedRequest } from './middleware/auth'

// Load environment variables
dotenv.config()

// Type definitions
interface Habit {
  id: string
  name: string
  description: string
  completed: boolean
  user_id: string
  created_at?: string
  updated_at?: string
  createdAt?: string
  updatedAt?: string
}

interface ApiResponse<T> {
  data?: T
  error?: string
  details?: string
  message?: string
}

// interface CreateHabitRequest {
//   name: string
//   description?: string
// }

interface HealthResponse {
  status: string
  timestamp: string
  service: string
}

// Environment variables with type safety
const PORT: number = parseInt(process.env.PORT || '3002', 10)
const supabaseUrl: string | undefined = process.env.SUPABASE_URL
const supabaseKey: string | undefined = process.env.SUPABASE_KEY
const supabaseAnonKey: string | undefined = process.env.SUPABASE_ANON_KEY

// Helper function to create user-specific Supabase client
const createUserSupabaseClient = (userToken: string) => {
  return createClient(supabaseUrl!, supabaseAnonKey!, {
    global: {
      headers: {
        Authorization: `Bearer ${userToken}`,
      },
    },
  })
}

const app = express()

// Middleware
app.use(cors())
app.use(express.json())

// Initialize Supabase client
if (!supabaseUrl || !supabaseKey || !supabaseAnonKey) {
  console.error(
    '⚠️  SUPABASE_URL, SUPABASE_KEY, and SUPABASE_ANON_KEY must be set in environment variables'
  )
  process.exit(1)
}

// Note: We create user-specific Supabase clients in the route handlers
// const supabase: SupabaseClient = createClient(
//   supabaseUrl || 'https://placeholder.supabase.co',
//   supabaseKey || 'placeholder-key'
// )

// Routes

// Health check endpoint
app.get('/api/health', (_req: Request, res: Response<HealthResponse>) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'naitai-backend',
  })
})

// GET /api/habits - Fetch user's habits
app.get(
  '/api/habits',
  authenticateUser,
  async (
    req: AuthenticatedRequest,
    res: Response<ApiResponse<Habit[]>>
  ): Promise<void> => {
    try {
      const userId = req.user?.id

      if (!userId) {
        res.status(401).json({
          error: 'User not authenticated',
        })
        return
      }

      // Get the user's JWT token from the authorization header
      const authHeader = req.headers.authorization
      const token = authHeader?.substring(7) // Remove 'Bearer ' prefix

      if (!token) {
        res.status(401).json({
          error: 'Authentication token required',
        })
        return
      }

      // Create a user-specific Supabase client with their JWT token
      const userSupabase = createUserSupabaseClient(token)

      const { data, error } = await userSupabase
        .from('habits')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Supabase error:', error)
        res.status(500).json({
          error: 'Failed to fetch habits',
          details: error.message,
        })
        return
      }

      res.json({ data: data as Habit[] })
    } catch (error) {
      console.error('Error fetching habits:', error)
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error'
      res.status(500).json({
        error: 'Internal server error',
        details: errorMessage,
      })
    }
  }
)

// POST /api/habits - Create a new habit
app.post(
  '/api/habits',
  authenticateUser,
  async (
    req: AuthenticatedRequest,
    res: Response<ApiResponse<Habit>>
  ): Promise<void> => {
    try {
      const { name, description } = req.body
      const userId = req.user?.id

      if (!userId) {
        res.status(401).json({
          error: 'User not authenticated',
        })
        return
      }

      if (!name) {
        res.status(400).json({
          error: 'Habit name is required',
        })
        return
      }

      // Get the user's JWT token from the authorization header
      const authHeader = req.headers.authorization
      const token = authHeader?.substring(7) // Remove 'Bearer ' prefix

      if (!token) {
        res.status(401).json({
          error: 'Authentication token required',
        })
        return
      }

      // Create a user-specific Supabase client with their JWT token
      const userSupabase = createUserSupabaseClient(token)

      const { data, error } = await userSupabase
        .from('habits')
        .insert([
          {
            name,
            description: description || '',
            completed: false,
            user_id: userId,
          },
        ])
        .select()
        .single()

      if (error) {
        console.error('Supabase error:', error)
        res.status(500).json({
          error: 'Failed to create habit',
          details: error.message,
        })
        return
      }

      res.status(201).json({ data: data as Habit })
    } catch (error) {
      console.error('Error creating habit:', error)
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error'
      res.status(500).json({
        error: 'Internal server error',
        details: errorMessage,
      })
    }
  }
)

// 404 handler
app.use('*', (req: Request, res: Response) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl,
  })
})

// Error handling middleware
app.use((error: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Unhandled error:', error)
  res.status(500).json({
    error: 'Something went wrong!',
    details: error.message,
  })
})

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`)
  console.log(`📡 API endpoints:`)
  console.log(`   GET  http://localhost:${PORT}/api/health`)
  console.log(`   GET  http://localhost:${PORT}/api/habits`)
  console.log(`   POST http://localhost:${PORT}/api/habits`)

  if (!supabaseUrl || !supabaseKey || !supabaseAnonKey) {
    console.log(`\n⚠️  Configure Supabase to enable full functionality:`)
    console.log(
      `   Add SUPABASE_URL, SUPABASE_KEY, and SUPABASE_ANON_KEY to your .env file`
    )
  }
})

export default app
