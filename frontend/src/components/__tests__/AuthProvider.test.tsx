import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { AuthProvider } from '../AuthProvider'
import { useAuthStore } from '../../stores/authStore'
import { authApi } from '../../lib/auth'
import { AuthChangeEvent, Session } from '@supabase/supabase-js'

// Mock the auth store
vi.mock('../../stores/authStore', () => ({
  useAuthStore: vi.fn(),
}))

// Mock the auth API
vi.mock('../../lib/auth', () => ({
  authApi: {
    getSession: vi.fn(),
    onAuthStateChange: vi.fn(),
  },
}))

describe('AuthProvider Email Verification', () => {
  const mockSetUser = vi.fn()
  const mockSetSession = vi.fn()
  const mockSetLoading = vi.fn()
  const mockSetInitialized = vi.fn()
  const mockSetEmailVerificationRequired = vi.fn()
  const mockSetPendingVerificationEmail = vi.fn()

  const mockAuthStoreReturn = {
    setUser: mockSetUser,
    setSession: mockSetSession,
    setLoading: mockSetLoading,
    setInitialized: mockSetInitialized,
    setEmailVerificationRequired: mockSetEmailVerificationRequired,
    setPendingVerificationEmail: mockSetPendingVerificationEmail,
    initialized: false,
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useAuthStore).mockReturnValue(mockAuthStoreReturn)
  })

  it('initializes auth state on mount', async () => {
    const mockSession = {
      access_token: 'token',
      user: { id: '123' },
      refresh_token: 'refresh_token',
      expires_in: 3600,
      token_type: 'Bearer',
    } as Session
    vi.mocked(authApi.getSession).mockResolvedValue({ session: mockSession })
    vi.mocked(authApi.onAuthStateChange).mockReturnValue({
      data: {
        subscription: { unsubscribe: vi.fn(), id: '123', callback: vi.fn() },
      },
    })

    render(
      <AuthProvider>
        <div>Test Child</div>
      </AuthProvider>
    )

    await waitFor(() => {
      expect(authApi.getSession).toHaveBeenCalled()
      expect(mockSetSession).toHaveBeenCalledWith(mockSession)
      expect(mockSetUser).toHaveBeenCalledWith(mockSession.user)
      expect(mockSetLoading).toHaveBeenCalledWith(false)
      expect(mockSetInitialized).toHaveBeenCalledWith(true)
    })
  })

  it('handles initialization error gracefully', async () => {
    const error = new Error('Failed to get session')
    vi.mocked(authApi.getSession).mockRejectedValue(error)
    vi.mocked(authApi.onAuthStateChange).mockReturnValue({
      data: {
        subscription: { unsubscribe: vi.fn(), id: '123', callback: vi.fn() },
      },
    })

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    render(
      <AuthProvider>
        <div>Test Child</div>
      </AuthProvider>
    )

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Error initializing auth:', error)
      expect(mockSetLoading).toHaveBeenCalledWith(false)
      expect(mockSetInitialized).toHaveBeenCalledWith(true)
    })

    consoleSpy.mockRestore()
  })

  it('sets up auth state change listener', () => {
    const mockSubscription = {
      unsubscribe: vi.fn(),
      id: '123',
      callback: vi.fn(),
    }

    vi.mocked(authApi.getSession).mockResolvedValue({ session: null })
    vi.mocked(authApi.onAuthStateChange).mockReturnValue({
      data: {
        subscription: mockSubscription,
      },
    })

    render(
      <AuthProvider>
        <div>Test Child</div>
      </AuthProvider>
    )

    expect(authApi.onAuthStateChange).toHaveBeenCalledWith(expect.any(Function))
  })

  it('clears email verification state on SIGNED_IN event', async () => {
    const mockSubscription = {
      unsubscribe: vi.fn(),
      id: '123',
      callback: vi.fn(),
    }
    let authStateCallback: (
      event: AuthChangeEvent,
      session: Session | null
    ) => void

    vi.mocked(authApi.getSession).mockResolvedValue({ session: null })
    vi.mocked(authApi.onAuthStateChange).mockImplementation(callback => {
      authStateCallback = callback
      return {
        data: { subscription: mockSubscription, id: '123', callback: vi.fn() },
      }
    })

    render(
      <AuthProvider>
        <div>Test Child</div>
      </AuthProvider>
    )

    // Wait for initial setup
    await waitFor(() => {
      expect(authApi.onAuthStateChange).toHaveBeenCalled()
    })

    // Simulate SIGNED_IN event
    const mockSession = {
      access_token: 'token',
      user: { id: '123' },
    } as Session
    authStateCallback!('SIGNED_IN', mockSession)

    expect(mockSetSession).toHaveBeenCalledWith(mockSession)
    expect(mockSetUser).toHaveBeenCalledWith(mockSession.user)
    expect(mockSetLoading).toHaveBeenCalledWith(false)
    expect(mockSetEmailVerificationRequired).toHaveBeenCalledWith(false)
    expect(mockSetPendingVerificationEmail).toHaveBeenCalledWith(null)
  })

  it('clears email verification state on SIGNED_OUT event', async () => {
    const mockSubscription = {
      unsubscribe: vi.fn(),
      id: '123',
      callback: vi.fn(),
    }
    let authStateCallback: (
      event: AuthChangeEvent,
      session: Session | null
    ) => void

    vi.mocked(authApi.getSession).mockResolvedValue({ session: null })
    vi.mocked(authApi.onAuthStateChange).mockImplementation(callback => {
      authStateCallback = callback
      return { data: { subscription: mockSubscription } }
    })

    render(
      <AuthProvider>
        <div>Test Child</div>
      </AuthProvider>
    )

    // Wait for initial setup
    await waitFor(() => {
      expect(authApi.onAuthStateChange).toHaveBeenCalled()
    })

    // Simulate SIGNED_OUT event
    authStateCallback!('SIGNED_OUT', null)

    expect(mockSetSession).toHaveBeenCalledWith(null)
    expect(mockSetUser).toHaveBeenCalledWith(null)
    expect(mockSetLoading).toHaveBeenCalledWith(false)
    expect(mockSetEmailVerificationRequired).toHaveBeenCalledWith(false)
    expect(mockSetPendingVerificationEmail).toHaveBeenCalledWith(null)
  })

  it('handles TOKEN_REFRESHED event without clearing verification state', async () => {
    const mockSubscription = {
      unsubscribe: vi.fn(),
      id: '123',
      callback: vi.fn(),
    }
    let authStateCallback: (
      event: AuthChangeEvent,
      session: Session | null
    ) => void

    vi.mocked(authApi.getSession).mockResolvedValue({ session: null })
    vi.mocked(authApi.onAuthStateChange).mockImplementation(callback => {
      authStateCallback = callback
      return { data: { subscription: mockSubscription } }
    })

    render(
      <AuthProvider>
        <div>Test Child</div>
      </AuthProvider>
    )

    // Wait for initial setup
    await waitFor(() => {
      expect(authApi.onAuthStateChange).toHaveBeenCalled()
    })

    // Clear previous calls
    vi.clearAllMocks()

    // Simulate TOKEN_REFRESHED event
    const mockSession = {
      access_token: 'new_token',
      user: { id: '123' },
    } as Session
    authStateCallback!('TOKEN_REFRESHED', mockSession)

    expect(mockSetSession).toHaveBeenCalledWith(mockSession)
    expect(mockSetUser).toHaveBeenCalledWith(mockSession.user)
    expect(mockSetLoading).toHaveBeenCalledWith(false)
    // Should NOT clear verification state for token refresh
    expect(mockSetEmailVerificationRequired).not.toHaveBeenCalled()
    expect(mockSetPendingVerificationEmail).not.toHaveBeenCalled()
  })

  it('handles USER_UPDATED event without clearing verification state', async () => {
    const mockSubscription = {
      unsubscribe: vi.fn(),
      id: '123',
      callback: vi.fn(),
    }
    let authStateCallback: (
      event: AuthChangeEvent,
      session: Session | null
    ) => void

    vi.mocked(authApi.getSession).mockResolvedValue({ session: null })
    vi.mocked(authApi.onAuthStateChange).mockImplementation(callback => {
      authStateCallback = callback
      return {
        data: { subscription: mockSubscription, id: '123', callback: vi.fn() },
      }
    })

    render(
      <AuthProvider>
        <div>Test Child</div>
      </AuthProvider>
    )

    // Wait for initial setup
    await waitFor(() => {
      expect(authApi.onAuthStateChange).toHaveBeenCalled()
    })

    // Clear previous calls
    vi.clearAllMocks()

    // Simulate USER_UPDATED event
    const mockSession = {
      access_token: 'token',
      user: { id: '123', email: 'new@example.com' },
    } as Session
    authStateCallback!('USER_UPDATED', mockSession)

    expect(mockSetSession).toHaveBeenCalledWith(mockSession)
    expect(mockSetUser).toHaveBeenCalledWith(mockSession.user)
    expect(mockSetLoading).toHaveBeenCalledWith(false)
    // Should NOT clear verification state for user update
    expect(mockSetEmailVerificationRequired).not.toHaveBeenCalled()
    expect(mockSetPendingVerificationEmail).not.toHaveBeenCalled()
  })

  it('does not initialize auth if already initialized', async () => {
    const mockSubscription = {
      unsubscribe: vi.fn(),
      id: '123',
      callback: vi.fn(),
    }
    vi.mocked(useAuthStore).mockReturnValue({
      ...mockAuthStoreReturn,
      initialized: true, // Already initialized
    })
    vi.mocked(authApi.onAuthStateChange).mockReturnValue({
      data: { subscription: mockSubscription },
    })

    render(
      <AuthProvider>
        <div>Test Child</div>
      </AuthProvider>
    )

    // Should not call getSession if already initialized
    expect(authApi.getSession).not.toHaveBeenCalled()
    expect(authApi.onAuthStateChange).toHaveBeenCalled()
  })

  it('unsubscribes from auth state changes on unmount', () => {
    const mockUnsubscribe = vi.fn()
    const mockSubscription = {
      unsubscribe: mockUnsubscribe,
      id: '123',
      callback: vi.fn(),
    }
    vi.mocked(authApi.getSession).mockResolvedValue({ session: null })
    vi.mocked(authApi.onAuthStateChange).mockReturnValue({
      data: { subscription: mockSubscription },
    })

    const { unmount } = render(
      <AuthProvider>
        <div>Test Child</div>
      </AuthProvider>
    )

    unmount()

    expect(mockUnsubscribe).toHaveBeenCalled()
  })

  it('handles null session in auth state change', async () => {
    const mockSubscription = {
      unsubscribe: vi.fn(),
      id: '123',
      callback: vi.fn(),
    }
    let authStateCallback: (
      event: AuthChangeEvent,
      session: Session | null
    ) => void

    vi.mocked(authApi.getSession).mockResolvedValue({ session: null })
    vi.mocked(authApi.onAuthStateChange).mockImplementation(callback => {
      authStateCallback = callback
      return { data: { subscription: mockSubscription } }
    })

    render(
      <AuthProvider>
        <div>Test Child</div>
      </AuthProvider>
    )

    // Wait for initial setup
    await waitFor(() => {
      expect(authApi.onAuthStateChange).toHaveBeenCalled()
    })

    // Simulate auth state change with null session
    authStateCallback!('SIGNED_OUT', null)

    expect(mockSetSession).toHaveBeenCalledWith(null)
    expect(mockSetUser).toHaveBeenCalledWith(null)
    expect(mockSetLoading).toHaveBeenCalledWith(false)
  })

  it('renders children correctly', () => {
    vi.mocked(authApi.getSession).mockResolvedValue({ session: null })
    vi.mocked(authApi.onAuthStateChange).mockReturnValue({
      data: {
        subscription: { unsubscribe: vi.fn(), id: '123', callback: vi.fn() },
      },
    })

    const { getByText } = render(
      <AuthProvider>
        <div>Test Child Component</div>
      </AuthProvider>
    )

    expect(getByText('Test Child Component')).toBeInTheDocument()
  })
})
