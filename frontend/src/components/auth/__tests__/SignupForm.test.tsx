import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'

// Mock environment variables
vi.mock('import.meta', () => ({
  env: {
    VITE_SUPABASE_URL: 'https://test.supabase.co',
    VITE_SUPABASE_ANON_KEY: 'test-anon-key',
  },
}))

// Mock Supabase client before any other imports
vi.mock('../../../utils/supabase', () => ({
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

import { SignupForm } from '../SignupForm'
import { useAuthStore } from '../../../stores/authStore'
import { AuthError } from '../../../lib/auth'

// Mock the auth store
vi.mock('../../../stores/authStore', () => ({
  useAuthStore: vi.fn(),
}))

// Mock the EmailVerificationPrompt component
vi.mock('../EmailVerificationPrompt', () => ({
  default: ({
    email,
    onBackToLogin,
  }: {
    email: string
    onBackToLogin?: () => void
  }) => (
    <div data-testid="email-verification-prompt">
      <div>Email verification required for: {email}</div>
      {onBackToLogin && <button onClick={onBackToLogin}>Back to Login</button>}
    </div>
  ),
}))

// Mock Lucide React icons
vi.mock('lucide-react', () => ({
  Mail: () => <div data-testid="mail-icon" />,
  Lock: () => <div data-testid="lock-icon" />,
  Chrome: () => <div data-testid="chrome-icon" />,
  Facebook: () => <div data-testid="facebook-icon" />,
  Eye: () => <div data-testid="eye-icon" />,
  EyeOff: () => <div data-testid="eye-off-icon" />,
}))

// Mock react-hook-form
const mockHandleSubmit = vi.fn()
const mockRegister = vi.fn()
const mockWatch = vi.fn()

vi.mock('react-hook-form', () => ({
  useForm: () => ({
    register: mockRegister,
    handleSubmit: mockHandleSubmit,
    watch: mockWatch,
    formState: { errors: {} },
  }),
}))

describe('SignupForm Email Verification', () => {
  const mockSignUp = vi.fn()
  const mockSignInWithGoogle = vi.fn()
  const mockSignInWithFacebook = vi.fn()
  const mockOnToggleMode = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()

    // Reset form mocks
    mockHandleSubmit.mockImplementation(fn => (e: Event) => {
      e?.preventDefault?.()
      return fn({
        email: 'test@example.com',
        password: 'Password123',
        confirmPassword: 'Password123',
      })
    })
    mockRegister.mockReturnValue({})
    mockWatch.mockReturnValue('Password123')

    // Default mock implementation
    vi.mocked(useAuthStore).mockReturnValue({
      signUp: mockSignUp,
      signInWithGoogle: mockSignInWithGoogle,
      signInWithFacebook: mockSignInWithFacebook,
      emailVerificationRequired: false,
      pendingVerificationEmail: null,
    } as unknown)
  })

  it('renders signup form when email verification is not required', () => {
    render(<SignupForm onToggleMode={mockOnToggleMode} />)

    expect(
      screen.getByRole('heading', { name: 'Create account' })
    ).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Enter your email')).toBeInTheDocument()
    expect(
      screen.getByPlaceholderText('Enter your password')
    ).toBeInTheDocument()
    expect(
      screen.getByPlaceholderText('Confirm your password')
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /create account/i })
    ).toBeInTheDocument()
  })

  it('renders EmailVerificationPrompt when email verification is required', () => {
    vi.mocked(useAuthStore).mockReturnValue({
      signUp: mockSignUp,
      signInWithGoogle: mockSignInWithGoogle,
      signInWithFacebook: mockSignInWithFacebook,
      emailVerificationRequired: true,
      pendingVerificationEmail: 'test@example.com',
    } as unknown)

    render(<SignupForm onToggleMode={mockOnToggleMode} />)

    expect(screen.getByTestId('email-verification-prompt')).toBeInTheDocument()
    expect(
      screen.getByText('Email verification required for: test@example.com')
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('heading', { name: 'Create account' })
    ).not.toBeInTheDocument()
  })

  it('passes onToggleMode to EmailVerificationPrompt as onBackToLogin', () => {
    vi.mocked(useAuthStore).mockReturnValue({
      signUp: mockSignUp,
      signInWithGoogle: mockSignInWithGoogle,
      signInWithFacebook: mockSignInWithFacebook,
      emailVerificationRequired: true,
      pendingVerificationEmail: 'test@example.com',
    } as unknown)

    render(<SignupForm onToggleMode={mockOnToggleMode} />)

    const backButton = screen.getByText('Back to Login')
    fireEvent.click(backButton)

    expect(mockOnToggleMode).toHaveBeenCalledTimes(1)
  })

  it('does not render EmailVerificationPrompt when email verification is required but no pending email', () => {
    vi.mocked(useAuthStore).mockReturnValue({
      signUp: mockSignUp,
      signInWithGoogle: mockSignInWithGoogle,
      signInWithFacebook: mockSignInWithFacebook,
      emailVerificationRequired: true,
      pendingVerificationEmail: null,
    } as unknown)

    render(<SignupForm onToggleMode={mockOnToggleMode} />)

    expect(
      screen.queryByTestId('email-verification-prompt')
    ).not.toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: 'Create account' })
    ).toBeInTheDocument()
  })

  it('calls signUp when form is submitted', async () => {
    const user = userEvent.setup()
    mockSignUp.mockResolvedValue(undefined)

    render(<SignupForm />)

    const submitButton = screen.getByRole('button', { name: /create account/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockSignUp).toHaveBeenCalledWith('test@example.com', 'Password123')
    })
  })

  it('shows error message when signup fails', async () => {
    const user = userEvent.setup()
    const error = new AuthError('Email already exists')
    mockSignUp.mockRejectedValue(error)

    render(<SignupForm />)

    const submitButton = screen.getByRole('button', { name: /create account/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Email already exists')).toBeInTheDocument()
    })
  })

  it('shows generic error message for non-AuthError', async () => {
    const user = userEvent.setup()
    const error = new Error('Network error')
    mockSignUp.mockRejectedValue(error)

    render(<SignupForm />)

    const submitButton = screen.getByRole('button', { name: /create account/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(
        screen.getByText('An unexpected error occurred. Please try again.')
      ).toBeInTheDocument()
    })
  })

  it('shows loading state during signup', async () => {
    const user = userEvent.setup()

    // Create a promise that we can control
    let resolveSignUp: () => void
    const signUpPromise = new Promise<void>(resolve => {
      resolveSignUp = resolve
    })
    mockSignUp.mockReturnValue(signUpPromise)

    render(<SignupForm />)

    const submitButton = screen.getByRole('button', { name: /create account/i })
    await user.click(submitButton)

    // Check loading state
    expect(screen.getByText('Creating account...')).toBeInTheDocument()
    expect(submitButton).toBeDisabled()

    // Resolve the promise
    resolveSignUp!()
    await waitFor(() => {
      expect(screen.queryByText('Creating account...')).not.toBeInTheDocument()
    })
  })

  it('calls signInWithGoogle when Google button is clicked', async () => {
    mockSignInWithGoogle.mockResolvedValue(undefined)

    render(<SignupForm />)

    const googleButton = screen.getByRole('button', { name: /google/i })
    fireEvent.click(googleButton)

    await waitFor(() => {
      expect(mockSignInWithGoogle).toHaveBeenCalledTimes(1)
    })
  })

  it('calls signInWithFacebook when Facebook button is clicked', async () => {
    mockSignInWithFacebook.mockResolvedValue(undefined)

    render(<SignupForm />)

    const facebookButton = screen.getByRole('button', { name: /facebook/i })
    fireEvent.click(facebookButton)

    await waitFor(() => {
      expect(mockSignInWithFacebook).toHaveBeenCalledTimes(1)
    })
  })

  it('shows error when Google signup fails', async () => {
    const error = new AuthError('Google signup failed')
    mockSignInWithGoogle.mockRejectedValue(error)

    render(<SignupForm />)

    const googleButton = screen.getByRole('button', { name: /google/i })
    fireEvent.click(googleButton)

    await waitFor(() => {
      expect(screen.getByText('Google signup failed')).toBeInTheDocument()
    })
  })

  it('shows error when Facebook signup fails', async () => {
    const error = new AuthError('Facebook signup failed')
    mockSignInWithFacebook.mockRejectedValue(error)

    render(<SignupForm />)

    const facebookButton = screen.getByRole('button', { name: /facebook/i })
    fireEvent.click(facebookButton)

    await waitFor(() => {
      expect(screen.getByText('Facebook signup failed')).toBeInTheDocument()
    })
  })

  it('disables buttons during loading', async () => {
    const user = userEvent.setup()

    // Create a promise that we can control
    let resolveSignUp: () => void
    const signUpPromise = new Promise<void>(resolve => {
      resolveSignUp = resolve
    })
    mockSignUp.mockReturnValue(signUpPromise)

    render(<SignupForm />)

    const submitButton = screen.getByRole('button', { name: /create account/i })
    const googleButton = screen.getByRole('button', { name: /google/i })
    const facebookButton = screen.getByRole('button', { name: /facebook/i })

    await user.click(submitButton)

    // Check that all buttons are disabled during loading
    expect(submitButton).toBeDisabled()
    expect(googleButton).toBeDisabled()
    expect(facebookButton).toBeDisabled()

    // Resolve the promise
    resolveSignUp!()
    await waitFor(() => {
      expect(submitButton).not.toBeDisabled()
    })
  })

  it('clears error when form is resubmitted', async () => {
    const user = userEvent.setup()

    // First submission fails
    const error = new AuthError('Email already exists')
    mockSignUp.mockRejectedValueOnce(error)

    render(<SignupForm />)

    const submitButton = screen.getByRole('button', { name: /create account/i })
    await user.click(submitButton)

    // Wait for error to appear
    await waitFor(() => {
      expect(screen.getByText('Email already exists')).toBeInTheDocument()
    })

    // Second submission succeeds
    mockSignUp.mockResolvedValue(undefined)
    await user.click(submitButton)

    // Error should be cleared
    await waitFor(() => {
      expect(screen.queryByText('Email already exists')).not.toBeInTheDocument()
    })
  })
})
