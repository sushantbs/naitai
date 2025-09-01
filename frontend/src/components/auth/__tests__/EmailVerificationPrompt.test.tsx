import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
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

import { EmailVerificationPrompt } from '../EmailVerificationPrompt'
import { useAuthStore } from '../../../stores/authStore'
import { AuthError } from '../../../lib/auth'

// Mock the auth store
vi.mock('../../../stores/authStore', () => ({
  useAuthStore: vi.fn(),
}))

// Mock Lucide React icons
vi.mock('lucide-react', () => ({
  Mail: ({ className }: { className?: string }) => (
    <div data-testid="mail-icon" className={className} />
  ),
  RefreshCw: ({ className }: { className?: string }) => (
    <div data-testid="refresh-icon" className={className} />
  ),
  CheckCircle: ({ className }: { className?: string }) => (
    <div data-testid="check-icon" className={className} />
  ),
}))

describe('EmailVerificationPrompt', () => {
  const mockResendVerificationEmail = vi.fn()
  const mockOnBackToLogin = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()

    // Mock the auth store
    vi.mocked(useAuthStore).mockReturnValue({
      resendVerificationEmail: mockResendVerificationEmail,
    } as unknown)
  })

  it('renders correctly with email address', () => {
    render(
      <EmailVerificationPrompt
        email="test@example.com"
        onBackToLogin={mockOnBackToLogin}
      />
    )

    expect(screen.getByText('Check your email')).toBeInTheDocument()
    expect(screen.getByText('test@example.com')).toBeInTheDocument()
    expect(
      screen.getByText(
        'Click the link in the email to verify your account and complete your registration.'
      )
    ).toBeInTheDocument()
    expect(
      screen.getByText("If you don't see the email, check your spam folder.")
    ).toBeInTheDocument()
  })

  it('shows resend verification email button', () => {
    render(<EmailVerificationPrompt email="test@example.com" />)

    const resendButton = screen.getByRole('button', {
      name: /resend verification email/i,
    })
    expect(resendButton).toBeInTheDocument()
    expect(resendButton).not.toBeDisabled()
  })

  it('shows back to login button when onBackToLogin is provided', () => {
    render(
      <EmailVerificationPrompt
        email="test@example.com"
        onBackToLogin={mockOnBackToLogin}
      />
    )

    const backButton = screen.getByRole('button', { name: /back to login/i })
    expect(backButton).toBeInTheDocument()
  })

  it('does not show back to login button when onBackToLogin is not provided', () => {
    render(<EmailVerificationPrompt email="test@example.com" />)

    const backButton = screen.queryByRole('button', { name: /back to login/i })
    expect(backButton).not.toBeInTheDocument()
  })

  it('calls onBackToLogin when back button is clicked', () => {
    render(
      <EmailVerificationPrompt
        email="test@example.com"
        onBackToLogin={mockOnBackToLogin}
      />
    )

    const backButton = screen.getByRole('button', { name: /back to login/i })
    fireEvent.click(backButton)

    expect(mockOnBackToLogin).toHaveBeenCalledTimes(1)
  })

  it('calls resendVerificationEmail when resend button is clicked', async () => {
    mockResendVerificationEmail.mockResolvedValue(undefined)

    render(<EmailVerificationPrompt email="test@example.com" />)

    const resendButton = screen.getByRole('button', {
      name: /resend verification email/i,
    })
    fireEvent.click(resendButton)

    await waitFor(() => {
      expect(mockResendVerificationEmail).toHaveBeenCalledWith(
        'test@example.com'
      )
    })
  })

  it('shows loading state when resending email', async () => {
    // Create a promise that we can control
    let resolveResend: () => void
    const resendPromise = new Promise<void>(resolve => {
      resolveResend = resolve
    })
    mockResendVerificationEmail.mockReturnValue(resendPromise)

    render(<EmailVerificationPrompt email="test@example.com" />)

    const resendButton = screen.getByRole('button', {
      name: /resend verification email/i,
    })
    fireEvent.click(resendButton)

    // Check loading state
    expect(screen.getByText('Sending...')).toBeInTheDocument()
    expect(screen.getByTestId('refresh-icon')).toBeInTheDocument()
    expect(resendButton).toBeDisabled()

    // Resolve the promise
    resolveResend!()
    await waitFor(() => {
      expect(screen.queryByText('Sending...')).not.toBeInTheDocument()
    })
  })

  it('shows success message after successful resend', async () => {
    mockResendVerificationEmail.mockResolvedValue(undefined)

    render(<EmailVerificationPrompt email="test@example.com" />)

    const resendButton = screen.getByRole('button', {
      name: /resend verification email/i,
    })
    fireEvent.click(resendButton)

    await waitFor(() => {
      expect(
        screen.getByText('Verification email sent successfully!')
      ).toBeInTheDocument()
    })

    expect(screen.getByTestId('check-icon')).toBeInTheDocument()
  })

  it('shows error message when resend fails with AuthError', async () => {
    const error = new AuthError('Rate limit exceeded')
    mockResendVerificationEmail.mockRejectedValue(error)

    render(<EmailVerificationPrompt email="test@example.com" />)

    const resendButton = screen.getByRole('button', {
      name: /resend verification email/i,
    })
    fireEvent.click(resendButton)

    await waitFor(() => {
      expect(screen.getByText('Rate limit exceeded')).toBeInTheDocument()
    })
  })

  it('shows generic error message when resend fails with unknown error', async () => {
    const error = new Error('Network error')
    mockResendVerificationEmail.mockRejectedValue(error)

    render(<EmailVerificationPrompt email="test@example.com" />)

    const resendButton = screen.getByRole('button', {
      name: /resend verification email/i,
    })
    fireEvent.click(resendButton)

    await waitFor(() => {
      expect(
        screen.getByText(
          'Failed to resend verification email. Please try again.'
        )
      ).toBeInTheDocument()
    })
  })

  it('clears error and success messages when resending again', async () => {
    // First, make it fail
    const error = new AuthError('Rate limit exceeded')
    mockResendVerificationEmail.mockRejectedValueOnce(error)

    render(<EmailVerificationPrompt email="test@example.com" />)

    const resendButton = screen.getByRole('button', {
      name: /resend verification email/i,
    })

    // First click - should show error
    fireEvent.click(resendButton)
    await waitFor(() => {
      expect(screen.getByText('Rate limit exceeded')).toBeInTheDocument()
    })

    // Second click - should clear error and show loading
    mockResendVerificationEmail.mockResolvedValue(undefined)
    fireEvent.click(resendButton)

    await waitFor(() => {
      expect(screen.queryByText('Rate limit exceeded')).not.toBeInTheDocument()
    })
  })

  it('clears success message when resending again', async () => {
    // First, make it succeed
    mockResendVerificationEmail.mockResolvedValue(undefined)

    render(<EmailVerificationPrompt email="test@example.com" />)

    const resendButton = screen.getByRole('button', {
      name: /resend verification email/i,
    })

    // First click - should show success
    fireEvent.click(resendButton)
    await waitFor(() => {
      expect(
        screen.getByText('Verification email sent successfully!')
      ).toBeInTheDocument()
    })

    // Second click - should clear success message
    fireEvent.click(resendButton)

    await waitFor(() => {
      expect(
        screen.queryByText('Verification email sent successfully!')
      ).not.toBeInTheDocument()
    })
  })

  it('displays helpful instructions', () => {
    render(<EmailVerificationPrompt email="test@example.com" />)

    expect(
      screen.getByText(
        'Click the link in the email to verify your account and complete your registration.'
      )
    ).toBeInTheDocument()
    expect(
      screen.getByText("If you don't see the email, check your spam folder.")
    ).toBeInTheDocument()
    expect(
      screen.getByText(
        /Didn't receive the email\? Make sure test@example\.com is correct/
      )
    ).toBeInTheDocument()
  })

  it('has proper accessibility attributes', () => {
    render(<EmailVerificationPrompt email="test@example.com" />)

    const resendButton = screen.getByRole('button', {
      name: /resend verification email/i,
    })
    expect(resendButton).toBeInTheDocument()

    const mailIcon = screen.getAllByTestId('mail-icon')[0]
    expect(mailIcon).toBeInTheDocument()
  })
})
