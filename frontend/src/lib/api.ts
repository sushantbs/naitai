// API base URL from environment variables
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

// Generic API error class
export class ApiError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

// Generic fetch wrapper with error handling
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`

  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  }

  try {
    const response = await fetch(url, config)

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new ApiError(
        response.status,
        errorData.message || `HTTP ${response.status}: ${response.statusText}`
      )
    }

    return await response.json()
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }

    // Network or other errors
    throw new Error(
      `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`
    )
  }
}

// Habit type definition
export interface Habit {
  id: string
  name: string
  description?: string
  completed: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateHabitRequest {
  name: string
  description?: string
}

export interface UpdateHabitRequest {
  name?: string
  description?: string
  completed?: boolean
}

// Habits API functions
export const habitsApi = {
  // Get all habits
  getAll: (): Promise<{ data: Habit[] }> => apiRequest('/api/habits'),

  // Get a specific habit by ID
  getById: (id: string): Promise<{ data: Habit }> =>
    apiRequest(`/api/habits/${id}`),

  // Create a new habit
  create: (habit: CreateHabitRequest): Promise<{ data: Habit }> =>
    apiRequest('/api/habits', {
      method: 'POST',
      body: JSON.stringify(habit),
    }),

  // Update an existing habit
  update: (id: string, updates: UpdateHabitRequest): Promise<{ data: Habit }> =>
    apiRequest(`/api/habits/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    }),

  // Delete a habit
  delete: (id: string): Promise<{ success: boolean }> =>
    apiRequest(`/api/habits/${id}`, {
      method: 'DELETE',
    }),

  // Toggle habit completion
  toggle: (id: string): Promise<{ data: Habit }> =>
    apiRequest(`/api/habits/${id}/toggle`, {
      method: 'PATCH',
    }),
}

// Health check API
export const healthApi = {
  check: (): Promise<{ status: string; timestamp: string }> =>
    apiRequest('/health'),
}

// Generic API utilities
export const api = {
  habits: habitsApi,
  health: healthApi,
}
