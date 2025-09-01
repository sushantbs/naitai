import React, { useState } from 'react'
import { Mail, RefreshCw, CheckCircle } from 'lucide-react'
import { Button } from '../ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card'
import { useAuthStore } from '../../stores/authStore'
import { AuthError } from '../../lib/auth'

interface EmailVerificationPromptProps {
  email: string
  onBackToLogin?: () => void
}

export const EmailVerificationPrompt: React.FC<
  EmailVerificationPromptProps
> = ({ email, onBackToLogin }) => {
  const [isResending, setIsResending] = useState(false)
  const [resendSuccess, setResendSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { resendVerificationEmail } = useAuthStore()

  const handleResendEmail = async () => {
    setIsResending(true)
    setError(null)
    setResendSuccess(false)

    try {
      await resendVerificationEmail(email)
      setResendSuccess(true)
    } catch (err) {
      if (err instanceof AuthError) {
        setError(err.message)
      } else {
        setError('Failed to resend verification email. Please try again.')
      }
    } finally {
      setIsResending(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center space-y-4">
        <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
          <Mail className="w-8 h-8 text-blue-600" />
        </div>
        <CardTitle className="text-2xl font-bold">Check your email</CardTitle>
        <CardDescription className="text-center">
          We've sent a verification link to{' '}
          <span className="font-medium text-foreground">{email}</span>
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="text-sm text-muted-foreground text-center space-y-2">
          <p>
            Click the link in the email to verify your account and complete your
            registration.
          </p>
          <p>If you don't see the email, check your spam folder.</p>
        </div>

        {error && (
          <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
            {error}
          </div>
        )}

        {resendSuccess && (
          <div className="p-3 text-sm text-green-600 bg-green-50 border border-green-200 rounded-md flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            Verification email sent successfully!
          </div>
        )}

        <div className="space-y-3">
          <Button
            onClick={handleResendEmail}
            disabled={isResending}
            variant="outline"
            className="w-full"
          >
            {isResending ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Mail className="mr-2 h-4 w-4" />
                Resend verification email
              </>
            )}
          </Button>

          {onBackToLogin && (
            <Button onClick={onBackToLogin} variant="ghost" className="w-full">
              Back to login
            </Button>
          )}
        </div>

        <div className="text-xs text-muted-foreground text-center">
          <p>
            Didn't receive the email? Make sure {email} is correct and check
            your spam folder.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

export default EmailVerificationPrompt
