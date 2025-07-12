import { beforeAll, afterAll } from 'vitest'

// Setup test environment
beforeAll(() => {
  // Set test environment variables
  process.env.NODE_ENV = 'test'
  process.env.PORT = '3003' // Different port for testing
  process.env.SUPABASE_URL = 'https://test-placeholder.supabase.co'
  process.env.SUPABASE_KEY = 'test-placeholder-key'
})

afterAll(() => {
  // Cleanup after all tests
  delete process.env.NODE_ENV
  delete process.env.PORT
  delete process.env.SUPABASE_URL
  delete process.env.SUPABASE_KEY
})
