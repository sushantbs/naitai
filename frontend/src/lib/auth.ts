import { supabase } from '../utils/supabase'
import type { User, Session } from '@supabase/supabase-js'

export interface AuthApiResponse {
  data: {
    user: User | null
    session: Session | null
  }
  error?: {
    message: string
  }
}

export class AuthError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'AuthError'
  }
}

export const authApi = {
  // Sign up with email and password
  signUp: async (email: string, password: string): Promise<AuthApiResponse> => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) {
      throw new AuthError(error.message)
    }

    return { data }
  },

  // Sign in with email and password
  signIn: async (email: string, password: string): Promise<AuthApiResponse> => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      throw new AuthError(error.message)
    }

    return { data }
  },

  // Sign in with Google
  signInWithGoogle: async (): Promise<void> => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      throw new AuthError(error.message)
    }
  },

  // Sign in with Facebook
  signInWithFacebook: async (): Promise<void> => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'facebook',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      throw new AuthError(error.message)
    }
  },

  // Sign out
  signOut: async (): Promise<void> => {
    const { error } = await supabase.auth.signOut()

    if (error) {
      throw new AuthError(error.message)
    }
  },

  // Get current session
  getSession: async (): Promise<{ session: Session | null }> => {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession()

    if (error) {
      throw new AuthError(error.message)
    }

    return { session }
  },

  // Get current user
  getUser: async (): Promise<{ user: User | null }> => {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error) {
      throw new AuthError(error.message)
    }

    return { user }
  },

  // Reset password
  resetPassword: async (email: string): Promise<void> => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    })

    if (error) {
      throw new AuthError(error.message)
    }
  },

  // Update password
  updatePassword: async (password: string): Promise<void> => {
    const { error } = await supabase.auth.updateUser({
      password,
    })

    if (error) {
      throw new AuthError(error.message)
    }
  },

  // Update user profile
  updateProfile: async (updates: {
    email?: string
    data?: any
  }): Promise<void> => {
    const { error } = await supabase.auth.updateUser(updates)

    if (error) {
      throw new AuthError(error.message)
    }
  },

  // Listen to auth state changes
  onAuthStateChange: (
    callback: (event: string, session: Session | null) => void
  ) => {
    return supabase.auth.onAuthStateChange(callback)
  },
}
