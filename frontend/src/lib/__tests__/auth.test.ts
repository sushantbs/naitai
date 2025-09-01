import { describe, it, expect, vi, beforeEach } from 'vitest'
import { authApi, AuthError } from '../auth'
import { supabase } from '../../utils/supabase'
import {
  AuthOtpResponse,
  AuthResponse,
  AuthTokenResponsePassword,
} from '@supabase/supabase-js'

// Mock Supabase
vi.mock('../../utils/supabase', () => ({
  supabase: {
    auth: {
      signUp: vi.fn(),
      signInWithPassword: vi.fn(),
      signInWithOAuth: vi.fn(),
      signOut: vi.fn(),
      getSession: vi.fn(),
      getUser: vi.fn(),
      resetPasswordForEmail: vi.fn(),
      updateUser: vi.fn(),
      resend: vi.fn(),
      onAuthStateChange: vi.fn(),
    },
  },
}))

describe('Auth API Email Verification', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('signUp', () => {
    it('should return user and session data on successful signup', async () => {
      const mockUser = { id: '123', email: 'test@example.com' }
      const mockSession = { access_token: 'token', user: mockUser }
      const mockResponse = {
        data: { user: mockUser, session: mockSession },
        error: null,
      }

      vi.mocked(supabase.auth.signUp).mockResolvedValue(
        mockResponse as AuthResponse
      )

      const result = await authApi.signUp('test@example.com', 'password123')

      expect(supabase.auth.signUp).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      })
      expect(result).toEqual({ data: { user: mockUser, session: mockSession } })
    })

    it('should return user without session when email verification required', async () => {
      const mockUser = { id: '123', email: 'test@example.com' }
      const mockResponse = {
        data: { user: mockUser, session: null },
        error: null,
      }

      vi.mocked(supabase.auth.signUp).mockResolvedValue(
        mockResponse as AuthResponse
      )

      const result = await authApi.signUp('test@example.com', 'password123')

      expect(result).toEqual({ data: { user: mockUser, session: null } })
    })

    it('should throw AuthError on signup failure', async () => {
      const mockError = { message: 'Email already exists' }
      const mockResponse = {
        data: { user: null, session: null },
        error: mockError,
      }

      vi.mocked(supabase.auth.signUp).mockResolvedValue(
        mockResponse as AuthResponse
      )

      await expect(
        authApi.signUp('test@example.com', 'password123')
      ).rejects.toThrow(AuthError)
      await expect(
        authApi.signUp('test@example.com', 'password123')
      ).rejects.toThrow('Email already exists')
    })
  })

  describe('resendVerificationEmail', () => {
    it('should call Supabase resend with correct parameters', async () => {
      const mockResponse = { error: null }
      vi.mocked(supabase.auth.resend).mockResolvedValue(
        mockResponse as AuthOtpResponse
      )

      await authApi.resendVerificationEmail('test@example.com')

      expect(supabase.auth.resend).toHaveBeenCalledWith({
        type: 'signup',
        email: 'test@example.com',
      })
    })

    it('should throw AuthError when resend fails', async () => {
      const mockError = { message: 'Rate limit exceeded' }
      const mockResponse = { error: mockError }
      vi.mocked(supabase.auth.resend).mockResolvedValue(
        mockResponse as AuthOtpResponse
      )

      await expect(
        authApi.resendVerificationEmail('test@example.com')
      ).rejects.toThrow(AuthError)
      await expect(
        authApi.resendVerificationEmail('test@example.com')
      ).rejects.toThrow('Rate limit exceeded')
    })

    it('should resolve successfully when no error', async () => {
      const mockResponse = { error: null }
      vi.mocked(supabase.auth.resend).mockResolvedValue(
        mockResponse as AuthOtpResponse
      )

      await expect(
        authApi.resendVerificationEmail('test@example.com')
      ).resolves.toBeUndefined()
    })
  })

  describe('signIn', () => {
    it('should return user and session on successful sign in', async () => {
      const mockUser = { id: '123', email: 'test@example.com' }
      const mockSession = { access_token: 'token', user: mockUser }
      const mockResponse = {
        data: { user: mockUser, session: mockSession },
        error: null,
      }

      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue(
        mockResponse as AuthTokenResponsePassword
      )

      const result = await authApi.signIn('test@example.com', 'password123')

      expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      })
      expect(result).toEqual({ data: { user: mockUser, session: mockSession } })
    })

    it('should throw AuthError when email not verified', async () => {
      const mockError = { message: 'Email not confirmed' }
      const mockResponse = {
        data: { user: null, session: null },
        error: mockError,
      }

      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue(
        mockResponse as AuthTokenResponsePassword
      )

      await expect(
        authApi.signIn('test@example.com', 'password123')
      ).rejects.toThrow(AuthError)
      await expect(
        authApi.signIn('test@example.com', 'password123')
      ).rejects.toThrow('Email not confirmed')
    })
  })

  describe('signOut', () => {
    it('should call Supabase signOut', async () => {
      const mockResponse = { error: null }
      vi.mocked(supabase.auth.signOut).mockResolvedValue(mockResponse)

      await authApi.signOut()

      expect(supabase.auth.signOut).toHaveBeenCalled()
    })

    it('should throw AuthError on sign out failure', async () => {
      const mockError = { message: 'Sign out failed' }
      const mockResponse = { error: mockError as AuthError }
      vi.mocked(supabase.auth.signOut).mockResolvedValue(
        mockResponse as AuthResponse
      )

      await expect(authApi.signOut()).rejects.toThrow(AuthError)
      await expect(authApi.signOut()).rejects.toThrow('Sign out failed')
    })
  })

  describe('getSession', () => {
    it('should return session data', async () => {
      const mockSession = { access_token: 'token' }
      const mockResponse = {
        data: { session: mockSession },
        error: null,
      }

      vi.mocked(supabase.auth.getSession).mockResolvedValue(
        mockResponse as AuthTokenResponsePassword
      )

      const result = await authApi.getSession()

      expect(supabase.auth.getSession).toHaveBeenCalled()
      expect(result).toEqual({ session: mockSession })
    })

    it('should throw AuthError on get session failure', async () => {
      const mockError = { message: 'Session expired' }
      const mockResponse = {
        data: { session: null },
        error: mockError,
      }

      vi.mocked(supabase.auth.getSession).mockResolvedValue(
        mockResponse as AuthTokenResponsePassword
      )

      await expect(authApi.getSession()).rejects.toThrow(AuthError)
      await expect(authApi.getSession()).rejects.toThrow('Session expired')
    })
  })

  describe('onAuthStateChange', () => {
    it('should call Supabase onAuthStateChange with callback', () => {
      const mockCallback = vi.fn()
      const mockSubscription = {
        unsubscribe: vi.fn(),
        callback: mockCallback,
        id: '123',
      }
      vi.mocked(supabase.auth.onAuthStateChange).mockReturnValue({
        data: { subscription: mockSubscription },
      })

      const result = authApi.onAuthStateChange(mockCallback)

      expect(supabase.auth.onAuthStateChange).toHaveBeenCalledWith(mockCallback)
      expect(result).toEqual({ data: { subscription: mockSubscription } })
    })
  })
})

describe('AuthError', () => {
  it('should create an error with correct name and message', () => {
    const error = new AuthError('Test error message')

    expect(error).toBeInstanceOf(Error)
    expect(error.name).toBe('AuthError')
    expect(error.message).toBe('Test error message')
  })
})
