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

interface LoginFormData {
  email: string
  password: string
}

interface LoginFormProps {
  onToggleMode?: () => void
  onForgotPassword?: () => void
}

export const LoginForm: React.FC<LoginFormProps> = ({
  onToggleMode,
  onForgotPassword,
}) => {
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const { signIn, signInWithGoogle, signInWithFacebook } = useAuthStore()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>()

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true)
    setError(null)

    try {
      await signIn(data.email, data.password)
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
        setError('Failed to sign in with Google. Please try again.')
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
        setError('Failed to sign in with Facebook. Please try again.')
      }
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">
          Welcome back
        </CardTitle>
        <CardDescription className="text-center">
          Sign in to your account to continue
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {error && (
          <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
            {error}
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

          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={onForgotPassword}
              className="text-sm text-primary hover:underline"
            >
              Forgot password?
            </button>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Signing in...' : 'Sign in'}
          </Button>
        </form>
      </CardContent>

      {onToggleMode && (
        <CardFooter>
          <p className="text-center text-sm text-muted-foreground w-full">
            Don't have an account?{' '}
            <button
              onClick={onToggleMode}
              className="font-medium text-primary hover:underline"
            >
              Sign up
            </button>
          </p>
        </CardFooter>
      )}
    </Card>
  )
}

export default LoginForm
