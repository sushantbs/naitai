import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'

// Load environment variables
dotenv.config()

const app = express()
const PORT = process.env.PORT || 3002

// Middleware
app.use(cors())
app.use(express.json())

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.warn(
    '⚠️  SUPABASE_URL and SUPABASE_KEY must be set in environment variables'
  )
  console.warn('⚠️  Using placeholder values for development')
}

const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseKey || 'placeholder-key'
)

// Routes

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'naitai-backend',
  })
})

// GET /api/habits - Fetch all habits
app.get('/api/habits', async (req, res) => {
  try {
    if (!supabaseUrl || !supabaseKey) {
      return res.status(200).json({
        data: [
          {
            id: '1',
            name: 'Example Habit',
            description: 'This is a placeholder habit for development',
            completed: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ],
        message:
          'Using placeholder data - configure Supabase to fetch real data',
      })
    }

    const { data, error } = await supabase
      .from('habits')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Supabase error:', error)
      return res.status(500).json({
        error: 'Failed to fetch habits',
        details: error.message,
      })
    }

    res.json({ data })
  } catch (error) {
    console.error('Error fetching habits:', error)
    res.status(500).json({
      error: 'Internal server error',
      details: error.message,
    })
  }
})

// POST /api/habits - Create a new habit
app.post('/api/habits', async (req, res) => {
  try {
    const { name, description } = req.body

    if (!name) {
      return res.status(400).json({
        error: 'Habit name is required',
      })
    }

    if (!supabaseUrl || !supabaseKey) {
      return res.status(200).json({
        data: {
          id: Date.now().toString(),
          name,
          description: description || '',
          completed: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        message:
          'Placeholder habit created - configure Supabase to persist data',
      })
    }

    const { data, error } = await supabase
      .from('habits')
      .insert([
        {
          name,
          description: description || '',
          completed: false,
        },
      ])
      .select()
      .single()

    if (error) {
      console.error('Supabase error:', error)
      return res.status(500).json({
        error: 'Failed to create habit',
        details: error.message,
      })
    }

    res.status(201).json({ data })
  } catch (error) {
    console.error('Error creating habit:', error)
    res.status(500).json({
      error: 'Internal server error',
      details: error.message,
    })
  }
})

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl,
  })
})

// Error handling middleware
app.use((error, req, res, _next) => {
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

  if (!supabaseUrl || !supabaseKey) {
    console.log(`\n⚠️  Configure Supabase to enable full functionality:`)
    console.log(`   Add SUPABASE_URL and SUPABASE_KEY to your .env file`)
  }
})
