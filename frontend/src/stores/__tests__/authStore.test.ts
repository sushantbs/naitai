import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock environment variables
vi.mock('import.meta', () => ({
  env: {
    VITE_SUPABASE_URL: 'https://test.supabase.co',
    VITE_SUPABASE_ANON_KEY: 'test-anon-key',
  },
}))

// Mock Supabase client before any other imports
vi.mock('../../utils/supabase', () => ({
  supabase: {
    auth: {
      signUp: vi.fn(),
      signInWithPassword: vi.fn(),
      signOut: vi.fn(),
      getSession: vi.fn(),
      resend: vi.fn(),
      onAuthStateChange: vi.fn(),
    },
  },
}))

import { useAuthStore } from '../authStore'
import { authApi, AuthApiResponse } from '../../lib/auth'
import { Session, User } from '@supabase/supabase-js'

// Mock the auth API
vi.mock('../../lib/auth', () => ({
  authApi: {
    signUp: vi.fn(),
    signIn: vi.fn(),
    signOut: vi.fn(),
    signInWithGoogle: vi.fn(),
    signInWithFacebook: vi.fn(),
    resetPassword: vi.fn(),
    updatePassword: vi.fn(),
    resendVerificationEmail: vi.fn(),
  },
  AuthError: class AuthError extends Error {
    constructor(message: string) {
      super(message)
      this.name = 'AuthError'
    }
  },
}))

describe('AuthStore Email Verification', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset the store state
    useAuthStore.setState({
      user: null,
      session: null,
      loading: false,
      initialized: false,
      emailVerificationRequired: false,
      pendingVerificationEmail: null,
    })
  })

  describe('signUp', () => {
    it('should set email verification required when user created but no session', async () => {
      const mockUser = { id: '123', email: 'test@example.com' }
      const mockResponse = {
        data: {
          user: mockUser,
          session: null, // No session means verification required
        },
      } as AuthApiResponse

      vi.mocked(authApi.signUp).mockResolvedValue(mockResponse)

      const { signUp } = useAuthStore.getState()
      await signUp('test@example.com', 'password123')

      const state = useAuthStore.getState()
      expect(state.user).toBeNull()
      expect(state.session).toBeNull()
      expect(state.emailVerificationRequired).toBe(true)
      expect(state.pendingVerificationEmail).toBe('test@example.com')
      expect(state.loading).toBe(false)
    })

    it('should not require verification when session is provided', async () => {
      const mockUser = { id: '123', email: 'test@example.com' }
      const mockSession = { access_token: 'token', user: mockUser }
      const mockResponse = {
        data: {
          user: mockUser,
          session: mockSession,
        },
      } as AuthApiResponse

      vi.mocked(authApi.signUp).mockResolvedValue(mockResponse)

      const { signUp } = useAuthStore.getState()
      await signUp('test@example.com', 'password123')

      const state = useAuthStore.getState()
      expect(state.user).toBe(mockUser)
      expect(state.session).toBe(mockSession)
      expect(state.emailVerificationRequired).toBe(false)
      expect(state.pendingVerificationEmail).toBeNull()
      expect(state.loading).toBe(false)
    })

    it('should handle signup errors correctly', async () => {
      const error = new Error('Email already exists')
      vi.mocked(authApi.signUp).mockRejectedValue(error)

      const { signUp } = useAuthStore.getState()

      await expect(signUp('test@example.com', 'password123')).rejects.toThrow(
        'Email already exists'
      )

      const state = useAuthStore.getState()
      expect(state.loading).toBe(false)
      expect(state.emailVerificationRequired).toBe(false)
      expect(state.pendingVerificationEmail).toBeNull()
    })

    it('should set loading state during signup', async () => {
      const mockResponse = {
        data: { user: null, session: null },
      }

      // Create a promise that we can control
      let resolveSignUp: (value: AuthApiResponse) => void
      const signUpPromise = new Promise<AuthApiResponse>(resolve => {
        resolveSignUp = resolve
      })

      vi.mocked(authApi.signUp).mockReturnValue(signUpPromise)

      const { signUp } = useAuthStore.getState()
      const signUpCall = signUp('test@example.com', 'password123')

      // Check loading state is true during signup
      expect(useAuthStore.getState().loading).toBe(true)

      // Resolve the promise
      resolveSignUp!(mockResponse)
      await signUpCall

      // Check loading state is false after signup
      expect(useAuthStore.getState().loading).toBe(false)
    })
  })

  describe('signOut', () => {
    it('should clear email verification state on sign out', async () => {
      // Set initial state with email verification required
      useAuthStore.setState({
        emailVerificationRequired: true,
        pendingVerificationEmail: 'test@example.com',
        user: { id: '123', email: 'test@example.com' } as User,
        session: { access_token: 'token' } as Session,
      })

      vi.mocked(authApi.signOut).mockResolvedValue()

      const { signOut } = useAuthStore.getState()
      await signOut()

      const state = useAuthStore.getState()
      expect(state.user).toBeNull()
      expect(state.session).toBeNull()
      expect(state.emailVerificationRequired).toBe(false)
      expect(state.pendingVerificationEmail).toBeNull()
      expect(state.loading).toBe(false)
    })

    it('should handle sign out errors', async () => {
      const error = new Error('Sign out failed')
      vi.mocked(authApi.signOut).mockRejectedValue(error)

      const { signOut } = useAuthStore.getState()

      await expect(signOut()).rejects.toThrow('Sign out failed')

      const state = useAuthStore.getState()
      expect(state.loading).toBe(false)
    })
  })

  describe('resendVerificationEmail', () => {
    it('should call auth API resend verification email', async () => {
      vi.mocked(authApi.resendVerificationEmail).mockResolvedValue()

      const { resendVerificationEmail } = useAuthStore.getState()
      await resendVerificationEmail('test@example.com')

      expect(authApi.resendVerificationEmail).toHaveBeenCalledWith(
        'test@example.com'
      )
    })

    it('should handle resend verification email errors', async () => {
      const error = new Error('Failed to resend email')
      vi.mocked(authApi.resendVerificationEmail).mockRejectedValue(error)

      const { resendVerificationEmail } = useAuthStore.getState()

      await expect(resendVerificationEmail('test@example.com')).rejects.toThrow(
        'Failed to resend email'
      )
    })
  })

  describe('state setters', () => {
    it('should update email verification required state', () => {
      const { setEmailVerificationRequired } = useAuthStore.getState()

      setEmailVerificationRequired(true)
      expect(useAuthStore.getState().emailVerificationRequired).toBe(true)

      setEmailVerificationRequired(false)
      expect(useAuthStore.getState().emailVerificationRequired).toBe(false)
    })

    it('should update pending verification email state', () => {
      const { setPendingVerificationEmail } = useAuthStore.getState()

      setPendingVerificationEmail('test@example.com')
      expect(useAuthStore.getState().pendingVerificationEmail).toBe(
        'test@example.com'
      )

      setPendingVerificationEmail(null)
      expect(useAuthStore.getState().pendingVerificationEmail).toBeNull()
    })
  })

  describe('signIn', () => {
    it('should not affect email verification state on successful sign in', async () => {
      // Set initial verification state
      useAuthStore.setState({
        emailVerificationRequired: true,
        pendingVerificationEmail: 'test@example.com',
      })

      const mockUser = { id: '123', email: 'test@example.com' }
      const mockSession = { access_token: 'token', user: mockUser }
      const mockResponse = {
        data: {
          user: mockUser,
          session: mockSession,
        },
      } as AuthApiResponse

      vi.mocked(authApi.signIn).mockResolvedValue(mockResponse)

      const { signIn } = useAuthStore.getState()
      await signIn('test@example.com', 'password123')

      const state = useAuthStore.getState()
      expect(state.user).toBe(mockUser)
      expect(state.session).toBe(mockSession)
      expect(state.loading).toBe(false)
      // Email verification state should remain unchanged by signIn
      expect(state.emailVerificationRequired).toBe(true)
      expect(state.pendingVerificationEmail).toBe('test@example.com')
    })
  })
})
