import { describe, it, expect, vi, beforeEach } from 'vitest'
import request from 'supertest'

// Mock dotenv
vi.mock('dotenv', () => ({
  default: {
    config: vi.fn(),
  },
  config: vi.fn(),
}))

// Create a simple mock that returns consistent structure
const mockSupabaseResponse = {
  data: null as any,
  error: null as any,
}

// Mock the user-specific Supabase client creation
const mockUserSupabaseClient = {
  from: vi.fn(() => ({
    select: vi.fn(() => ({
      order: vi.fn(() => Promise.resolve(mockSupabaseResponse)),
    })),
    insert: vi.fn(() => ({
      select: vi.fn(() => ({
        single: vi.fn(() => Promise.resolve(mockSupabaseResponse)),
      })),
    })),
  })),
}

// Mock Supabase client with a simple structure
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => mockUserSupabaseClient),
}))

// Mock the authentication middleware
vi.mock('../src/middleware/auth', () => ({
  authenticateUser: vi.fn((req: any, res: any, next: any) => {
    // Mock authenticated user
    req.user = {
      id: 'test-user-id',
      email: 'test@example.com',
    }
    // Mock authorization header for user-specific client creation
    req.headers = {
      ...req.headers,
      authorization: 'Bearer mock-jwt-token',
    }
    next()
  }),
  AuthenticatedRequest: {} as any,
}))

// Import app after all mocks are set up
import app from '../src/index'

describe('API Endpoints', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset the mock response
    mockSupabaseResponse.data = null
    mockSupabaseResponse.error = null
  })

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

  describe('GET /api/habits (authenticated)', () => {
    it('should return 200 OK with habits data when authenticated', async () => {
      const mockHabits = [
        {
          id: '1',
          name: 'Test Habit',
          description: 'Test Description',
          completed: false,
          user_id: 'test-user-id',
          created_at: '2024-01-01T00:00:00.000Z',
          updated_at: '2024-01-01T00:00:00.000Z',
        },
      ]

      // Set up the mock response
      mockSupabaseResponse.data = mockHabits
      mockSupabaseResponse.error = null

      const response = await request(app)
        .get('/api/habits')
        .set('Authorization', 'Bearer mock-jwt-token')

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('data')
      expect(Array.isArray(response.body.data)).toBe(true)
      expect(response.body.data).toHaveLength(1)
    })

    it('should return habits with correct structure', async () => {
      const mockHabit = {
        id: '1',
        name: 'Daily Exercise',
        description: 'Go for a 30-minute walk',
        completed: false,
        user_id: 'test-user-id',
        created_at: '2024-01-01T00:00:00.000Z',
        updated_at: '2024-01-01T00:00:00.000Z',
      }

      mockSupabaseResponse.data = [mockHabit]
      mockSupabaseResponse.error = null

      const response = await request(app)
        .get('/api/habits')
        .set('Authorization', 'Bearer mock-jwt-token')

      expect(response.status).toBe(200)
      expect(response.body.data).toHaveLength(1)

      const habit = response.body.data[0]
      expect(habit).toHaveProperty('id')
      expect(habit).toHaveProperty('name')
      expect(habit).toHaveProperty('description')
      expect(habit).toHaveProperty('completed')
      expect(habit).toHaveProperty('user_id')
      expect(habit).toHaveProperty('created_at')
      expect(habit).toHaveProperty('updated_at')
    })

    it('should handle Supabase errors', async () => {
      mockSupabaseResponse.data = null
      mockSupabaseResponse.error = { message: 'Database connection failed' }

      const response = await request(app)
        .get('/api/habits')
        .set('Authorization', 'Bearer mock-jwt-token')

      expect(response.status).toBe(500)
      expect(response.body).toHaveProperty('error', 'Failed to fetch habits')
      expect(response.body).toHaveProperty(
        'details',
        'Database connection failed'
      )
    })

    it('should return JSON content type', async () => {
      mockSupabaseResponse.data = []
      mockSupabaseResponse.error = null

      const response = await request(app)
        .get('/api/habits')
        .set('Authorization', 'Bearer mock-jwt-token')

      expect(response.headers['content-type']).toMatch(/application\/json/)
    })
  })

  describe('POST /api/habits (authenticated)', () => {
    it('should create a new habit with valid data', async () => {
      const newHabit = {
        name: 'Test Habit',
        description: 'This is a test habit',
      }

      const mockCreatedHabit = {
        id: '2',
        name: newHabit.name,
        description: newHabit.description,
        completed: false,
        user_id: 'test-user-id',
        created_at: '2024-01-01T00:00:00.000Z',
        updated_at: '2024-01-01T00:00:00.000Z',
      }

      mockSupabaseResponse.data = mockCreatedHabit
      mockSupabaseResponse.error = null

      const response = await request(app)
        .post('/api/habits')
        .send(newHabit)
        .set('Content-Type', 'application/json')
        .set('Authorization', 'Bearer mock-jwt-token')

      expect(response.status).toBe(201)
      expect(response.body).toHaveProperty('data')
      expect(response.body.data).toHaveProperty('id')
      expect(response.body.data).toHaveProperty('name', newHabit.name)
      expect(response.body.data).toHaveProperty(
        'description',
        newHabit.description
      )
      expect(response.body.data).toHaveProperty('completed', false)
      expect(response.body.data).toHaveProperty('user_id', 'test-user-id')
    })

    it('should return 400 when name is missing', async () => {
      const invalidHabit = {
        description: 'This habit has no name',
      }

      const response = await request(app)
        .post('/api/habits')
        .send(invalidHabit)
        .set('Content-Type', 'application/json')
        .set('Authorization', 'Bearer mock-jwt-token')

      expect(response.status).toBe(400)
      expect(response.body).toHaveProperty('error', 'Habit name is required')
    })

    it('should create habit with empty description when not provided', async () => {
      const habitWithoutDescription = {
        name: 'Habit Without Description',
      }

      const mockCreatedHabit = {
        id: '3',
        name: habitWithoutDescription.name,
        description: '',
        completed: false,
        user_id: 'test-user-id',
        created_at: '2024-01-01T00:00:00.000Z',
        updated_at: '2024-01-01T00:00:00.000Z',
      }

      mockSupabaseResponse.data = mockCreatedHabit
      mockSupabaseResponse.error = null

      const response = await request(app)
        .post('/api/habits')
        .send(habitWithoutDescription)
        .set('Content-Type', 'application/json')
        .set('Authorization', 'Bearer mock-jwt-token')

      expect(response.status).toBe(201)
      expect(response.body.data).toHaveProperty(
        'name',
        habitWithoutDescription.name
      )
      expect(response.body.data).toHaveProperty('description', '')
      expect(response.body.data).toHaveProperty('user_id', 'test-user-id')
    })

    it('should handle Supabase errors during creation', async () => {
      const newHabit = {
        name: 'Test Habit',
        description: 'This is a test habit',
      }

      mockSupabaseResponse.data = null
      mockSupabaseResponse.error = { message: 'Unique constraint violation' }

      const response = await request(app)
        .post('/api/habits')
        .send(newHabit)
        .set('Content-Type', 'application/json')
        .set('Authorization', 'Bearer mock-jwt-token')

      expect(response.status).toBe(500)
      expect(response.body).toHaveProperty('error', 'Failed to create habit')
      expect(response.body).toHaveProperty(
        'details',
        'Unique constraint violation'
      )
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
