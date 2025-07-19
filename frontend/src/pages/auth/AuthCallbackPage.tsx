import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'
import { authApi } from '../../lib/auth'

export const AuthCallbackPage: React.FC = () => {
  const navigate = useNavigate()
  const { setUser, setSession, setLoading } = useAuthStore()

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        setLoading(true)

        // Get the session after OAuth callback
        const { session } = await authApi.getSession()

        if (session) {
          setSession(session)
          setUser(session.user)
          navigate('/habits', { replace: true })
        } else {
          // No session found, redirect to login
          navigate('/auth/login', { replace: true })
        }
      } catch (error) {
        console.error('Auth callback error:', error)
        navigate('/auth/login', { replace: true })
      } finally {
        setLoading(false)
      }
    }

    handleAuthCallback()
  }, [navigate, setUser, setSession, setLoading])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-gray-600">Completing sign in...</p>
      </div>
    </div>
  )
}

export default AuthCallbackPage
