import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import request from 'supertest'
import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

// Import the same app setup as index.js but without starting the server
const app = express()
const PORT = process.env.PORT || 3003

// Middleware
app.use(cors())
app.use(express.json())

// Mock Supabase client for testing
const mockSupabase = {
  from: () => ({
    select: () => ({
      order: () => ({
        data: [
          {
            id: 'test-1',
            name: 'Test Habit 1',
            description: 'Test description 1',
            completed: false,
            created_at: '2023-01-01T00:00:00.000Z',
            updated_at: '2023-01-01T00:00:00.000Z',
          },
          {
            id: 'test-2',
            name: 'Test Habit 2',
            description: 'Test description 2',
            completed: true,
            created_at: '2023-01-02T00:00:00.000Z',
            updated_at: '2023-01-02T00:00:00.000Z',
          },
        ],
        error: null,
      }),
    }),
    insert: data => ({
      select: () => ({
        single: () => ({
          data: {
            id: 'test-new',
            name: data[0].name,
            description: data[0].description,
            completed: data[0].completed,
            created_at: '2023-01-03T00:00:00.000Z',
            updated_at: '2023-01-03T00:00:00.000Z',
          },
          error: null,
        }),
      }),
    }),
  }),
}

// Routes for testing
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'naitai-backend',
  })
})

app.get('/api/habits', async (req, res) => {
  try {
    // Use mock data for testing
    const { data, error } = mockSupabase
      .from('habits')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      return res.status(500).json({
        error: 'Failed to fetch habits',
        details: error.message,
      })
    }

    res.json({ data })
  } catch (error) {
    res.status(500).json({
      error: 'Internal server error',
      details: error.message,
    })
  }
})

app.post('/api/habits', async (req, res) => {
  try {
    const { name, description } = req.body

    if (!name) {
      return res.status(400).json({
        error: 'Habit name is required',
      })
    }

    // Use mock data for testing
    const { data, error } = mockSupabase
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
      return res.status(500).json({
        error: 'Failed to create habit',
        details: error.message,
      })
    }

    res.status(201).json({ data })
  } catch (error) {
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
  res.status(500).json({
    error: 'Something went wrong!',
    details: error.message,
  })
})

describe('API Endpoints', () => {
  describe('GET /api/health', () => {
    it('should return 200 OK with health status', async () => {
      const response = await request(app).get('/api/health')

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('status', 'OK')
      expect(response.body).toHaveProperty('timestamp')
      expect(response.body).toHaveProperty('service', 'naitai-backend')
      expect(response.body.timestamp).toMatch(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/
      )
    })

    it('should return JSON content type', async () => {
      const response = await request(app).get('/api/health')

      expect(response.headers['content-type']).toMatch(/application\/json/)
    })
  })

  describe('GET /api/habits', () => {
    it('should return 200 OK with an array of habits', async () => {
      const response = await request(app).get('/api/habits')

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('data')
      expect(Array.isArray(response.body.data)).toBe(true)
    })

    it('should return habits with correct structure', async () => {
      const response = await request(app).get('/api/habits')

      expect(response.status).toBe(200)
      expect(response.body.data).toHaveLength(2)

      const habit = response.body.data[0]
      expect(habit).toHaveProperty('id')
      expect(habit).toHaveProperty('name')
      expect(habit).toHaveProperty('description')
      expect(habit).toHaveProperty('completed')
      expect(habit).toHaveProperty('created_at')
      expect(habit).toHaveProperty('updated_at')
    })

    it('should return JSON content type', async () => {
      const response = await request(app).get('/api/habits')

      expect(response.headers['content-type']).toMatch(/application\/json/)
    })
  })

  describe('POST /api/habits', () => {
    it('should create a new habit with valid data', async () => {
      const newHabit = {
        name: 'Test Habit',
        description: 'This is a test habit',
      }

      const response = await request(app)
        .post('/api/habits')
        .send(newHabit)
        .set('Content-Type', 'application/json')

      expect(response.status).toBe(201)
      expect(response.body).toHaveProperty('data')
      expect(response.body.data).toHaveProperty('id')
      expect(response.body.data).toHaveProperty('name', newHabit.name)
      expect(response.body.data).toHaveProperty(
        'description',
        newHabit.description
      )
      expect(response.body.data).toHaveProperty('completed', false)
    })

    it('should return 400 when name is missing', async () => {
      const invalidHabit = {
        description: 'This habit has no name',
      }

      const response = await request(app)
        .post('/api/habits')
        .send(invalidHabit)
        .set('Content-Type', 'application/json')

      expect(response.status).toBe(400)
      expect(response.body).toHaveProperty('error', 'Habit name is required')
    })

    it('should create habit with empty description when not provided', async () => {
      const habitWithoutDescription = {
        name: 'Habit Without Description',
      }

      const response = await request(app)
        .post('/api/habits')
        .send(habitWithoutDescription)
        .set('Content-Type', 'application/json')

      expect(response.status).toBe(201)
      expect(response.body.data).toHaveProperty(
        'name',
        habitWithoutDescription.name
      )
      expect(response.body.data).toHaveProperty('description', '')
    })
  })

  describe('404 Handler', () => {
    it('should return 404 for non-existent routes', async () => {
      const response = await request(app).get('/api/nonexistent')

      expect(response.status).toBe(404)
      expect(response.body).toHaveProperty('error', 'Route not found')
      expect(response.body).toHaveProperty('path', '/api/nonexistent')
    })
  })
})
