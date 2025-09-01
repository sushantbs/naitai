import React, { useEffect } from 'react'
import { useAuthStore } from '../stores/authStore'
import { authApi } from '../lib/auth'

interface AuthProviderProps {
  children: React.ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const {
    setUser,
    setSession,
    setLoading,
    setInitialized,
    setEmailVerificationRequired,
    setPendingVerificationEmail,
    initialized,
  } = useAuthStore()

  useEffect(() => {
    // Initialize auth state
    const initializeAuth = async () => {
      try {
        const { session } = await authApi.getSession()

        setSession(session)
        setUser(session?.user ?? null)
        setLoading(false)
        setInitialized(true)
      } catch (error) {
        console.error('Error initializing auth:', error)
        setLoading(false)
        setInitialized(true)
      }
    }

    // Set up auth state listener
    const {
      data: { subscription },
    } = authApi.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session)

      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)

      // Handle specific auth events
      switch (event) {
        case 'SIGNED_IN':
          console.log('User signed in')
          // Clear email verification state when user successfully signs in
          setEmailVerificationRequired(false)
          setPendingVerificationEmail(null)
          break
        case 'SIGNED_OUT':
          console.log('User signed out')
          // Clear email verification state on sign out
          setEmailVerificationRequired(false)
          setPendingVerificationEmail(null)
          break
        case 'TOKEN_REFRESHED':
          console.log('Token refreshed')
          break
        case 'USER_UPDATED':
          console.log('User updated')
          break
      }
    })

    // Initialize auth only if not already initialized
    if (!initialized) {
      initializeAuth()
    }

    // Cleanup function
    return () => {
      subscription?.unsubscribe()
    }
  }, [
    setUser,
    setSession,
    setLoading,
    setInitialized,
    setEmailVerificationRequired,
    setPendingVerificationEmail,
    initialized,
  ])

  return <>{children}</>
}

export default AuthProvider
