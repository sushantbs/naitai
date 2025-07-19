import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Mail, Lock, Chrome, Facebook, Eye, EyeOff } from 'lucide-react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../ui/card'
import { useAuthStore } from '../../stores/authStore'
import { AuthError } from '../../lib/auth'

interface SignupFormData {
  email: string
  password: string
  confirmPassword: string
}

interface SignupFormProps {
  onToggleMode?: () => void
}

export const SignupForm: React.FC<SignupFormProps> = ({ onToggleMode }) => {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)

  const { signUp, signInWithGoogle, signInWithFacebook } = useAuthStore()

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SignupFormData>()

  const password = watch('password')

  const onSubmit = async (data: SignupFormData) => {
    setIsLoading(true)
    setError(null)
    setSuccess(null)

    try {
      await signUp(data.email, data.password)
      setSuccess(
        'Account created successfully! Please check your email to verify your account.'
      )
    } catch (err) {
      if (err instanceof AuthError) {
        setError(err.message)
      } else {
        setError('An unexpected error occurred. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    try {
      setError(null)
      await signInWithGoogle()
    } catch (err) {
      if (err instanceof AuthError) {
        setError(err.message)
      } else {
        setError('Failed to sign up with Google. Please try again.')
      }
    }
  }

  const handleFacebookSignIn = async () => {
    try {
      setError(null)
      await signInWithFacebook()
    } catch (err) {
      if (err instanceof AuthError) {
        setError(err.message)
      } else {
        setError('Failed to sign up with Facebook. Please try again.')
      }
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">
          Create account
        </CardTitle>
        <CardDescription className="text-center">
          Enter your information to create an account
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {error && (
          <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
            {error}
          </div>
        )}

        {success && (
          <div className="p-3 text-sm text-green-600 bg-green-50 border border-green-200 rounded-md">
            {success}
          </div>
        )}

        {/* Social Login Buttons */}
        <div className="grid grid-cols-2 gap-4">
          <Button
            variant="outline"
            onClick={handleGoogleSignIn}
            className="w-full"
            disabled={isLoading}
          >
            <Chrome className="mr-2 h-4 w-4" />
            Google
          </Button>
          <Button
            variant="outline"
            onClick={handleFacebookSignIn}
            className="w-full"
            disabled={isLoading}
          >
            <Facebook className="mr-2 h-4 w-4" />
            Facebook
          </Button>
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Or continue with
            </span>
          </div>
        </div>

        {/* Email/Password Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address',
                  },
                })}
                type="email"
                placeholder="Enter your email"
                className="pl-10"
                disabled={isLoading}
              />
            </div>
            {errors.email && (
              <p className="text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                {...register('password', {
                  required: 'Password is required',
                  minLength: {
                    value: 6,
                    message: 'Password must be at least 6 characters',
                  },
                  pattern: {
                    value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                    message:
                      'Password must contain at least one uppercase letter, one lowercase letter, and one number',
                  },
                })}
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                className="pl-10 pr-10"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 h-4 w-4 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff /> : <Eye />}
              </button>
            </div>
            {errors.password && (
              <p className="text-sm text-red-600">{errors.password.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                {...register('confirmPassword', {
                  required: 'Please confirm your password',
                  validate: value =>
                    value === password || 'Passwords do not match',
                })}
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Confirm your password"
                className="pl-10 pr-10"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-3 h-4 w-4 text-muted-foreground hover:text-foreground"
              >
                {showConfirmPassword ? <EyeOff /> : <Eye />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-sm text-red-600">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          <div className="text-xs text-muted-foreground">
            Password must contain at least 6 characters with uppercase,
            lowercase, and number.
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Creating account...' : 'Create account'}
          </Button>
        </form>
      </CardContent>

      {onToggleMode && (
        <CardFooter>
          <p className="text-center text-sm text-muted-foreground w-full">
            Already have an account?{' '}
            <button
              onClick={onToggleMode}
              className="font-medium text-primary hover:underline"
            >
              Sign in
            </button>
          </p>
        </CardFooter>
      )}
    </Card>
  )
}

export default SignupForm
