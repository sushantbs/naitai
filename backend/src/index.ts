import express, { Request, Response, NextFunction } from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'
import { authenticateUser, AuthenticatedRequest } from './middleware/auth.js'

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

// CORS configuration
const corsOptions = {
  origin: [
    'http://localhost:3000', // Frontend configured port (vite.config.ts)
    'http://127.0.0.1:3000', // Alternative localhost notation
    'http://localhost:5173', // Vite dev server default port
    'http://127.0.0.1:5173', // Alternative localhost notation for Vite
    'https://naitai-frontend.vercel.app', // Production frontend (removed trailing slash)
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'Accept',
    'Origin',
    'X-Requested-With',
  ],
}

// Middleware
app.use(cors(corsOptions))
app.use(express.json())

// Initialize Supabase client
if (!supabaseUrl || !supabaseKey || !supabaseAnonKey) {
  console.error('\n❌ Missing required Supabase environment variables:')
  if (!supabaseUrl) console.error('   - SUPABASE_URL is not set')
  if (!supabaseKey) console.error('   - SUPABASE_KEY is not set')
  if (!supabaseAnonKey) console.error('   - SUPABASE_ANON_KEY is not set')

  console.error('\n🔧 To fix this:')
  console.error(
    '   1. For local development: Create a .env file in the backend directory'
  )
  console.error(
    '   2. For Vercel: Add environment variables in your Vercel project settings'
  )
  console.error(
    '   3. For GitHub Actions: Add secrets to your repository settings'
  )
  console.error('\n📋 Required environment variables:')
  console.error('   SUPABASE_URL=https://your-project.supabase.co')
  console.error('   SUPABASE_KEY=your-service-role-key')
  console.error('   SUPABASE_ANON_KEY=your-anon-key')

  // In production environments, we want to fail fast
  if (process.env.NODE_ENV === 'production') {
    console.error(
      '\n🚨 Cannot start in production without Supabase configuration'
    )
    process.exit(1)
  }

  // In development, we'll warn but continue (for testing purposes)
  console.warn(
    '\n⚠️  Starting in development mode without Supabase (some features will not work)'
  )
}

// Note: We create user-specific Supabase clients in the route handlers
// const supabase: SupabaseClient = createClient(
//   supabaseUrl || 'https://placeholder.supabase.co',
//   supabaseKey || 'placeholder-key'
// )

// Routes

// Handle preflight OPTIONS requests for all routes
app.options('*', (req: Request, res: Response) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*')
  res.header(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, DELETE, PATCH, OPTIONS'
  )
  res.header(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization, Accept, Origin, X-Requested-With'
  )
  res.header('Access-Control-Allow-Credentials', 'true')
  res.sendStatus(200)
})

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
// eslint-disable-next-line no-unused-vars
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
  console.log(`\n🌐 CORS enabled for origins:`)
  corsOptions.origin.forEach(origin => console.log(`   ${origin}`))

  if (!supabaseUrl || !supabaseKey || !supabaseAnonKey) {
    console.log(`\n⚠️  Configure Supabase to enable full functionality:`)
    console.log(
      `   Add SUPABASE_URL, SUPABASE_KEY, and SUPABASE_ANON_KEY to your .env file`
    )
  }

  console.log(`\n💡 Frontend should connect to: http://localhost:${PORT}`)
  console.log(
    `   Set VITE_API_URL=http://localhost:${PORT} in your frontend .env`
  )
})

export default app
