import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { LoginForm } from '../../components/auth/LoginForm'
import { SignupForm } from '../../components/auth/SignupForm'
import { useAuthStore } from '../../stores/authStore'

type AuthMode = 'login' | 'signup'

interface AuthPageProps {
  initialMode?: AuthMode
}

export const AuthPage: React.FC<AuthPageProps> = ({
  initialMode = 'login',
}) => {
  const [mode, setMode] = useState<AuthMode>(initialMode)
  const navigate = useNavigate()
  const location = useLocation()
  const { user, initialized } = useAuthStore()

  // Redirect authenticated users
  useEffect(() => {
    if (initialized && user) {
      const from = (location.state as any)?.from?.pathname || '/habits'
      navigate(from, { replace: true })
    }
  }, [user, initialized, navigate, location.state])

  const toggleMode = () => {
    setMode(mode === 'login' ? 'signup' : 'login')
  }

  const handleForgotPassword = () => {
    navigate('/auth/forgot-password')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {mode === 'login' ? (
          <LoginForm
            onToggleMode={toggleMode}
            onForgotPassword={handleForgotPassword}
          />
        ) : (
          <SignupForm onToggleMode={toggleMode} />
        )}
      </div>
    </div>
  )
}

export default AuthPage
