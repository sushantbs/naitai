import { create } from 'zustand'
import { User, Session } from '@supabase/supabase-js'
import { authApi } from '../lib/auth'

interface AuthState {
  user: User | null
  session: Session | null
  loading: boolean
  initialized: boolean
  emailVerificationRequired: boolean
  pendingVerificationEmail: string | null
}

interface AuthActions {
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string) => Promise<void>
  signInWithGoogle: () => Promise<void>
  signInWithFacebook: () => Promise<void>
  signOut: () => Promise<void>
  setUser: (user: User | null) => void
  setSession: (session: Session | null) => void
  setLoading: (loading: boolean) => void
  setInitialized: (initialized: boolean) => void
  setEmailVerificationRequired: (required: boolean) => void
  setPendingVerificationEmail: (email: string | null) => void
  resendVerificationEmail: (email: string) => Promise<void>
  resetPassword: (email: string) => Promise<void>
  updatePassword: (password: string) => Promise<void>
}

type AuthStore = AuthState & AuthActions

export const useAuthStore = create<AuthStore>(set => ({
  // State
  user: null,
  session: null,
  loading: true,
  initialized: false,
  emailVerificationRequired: false,
  pendingVerificationEmail: null,

  // Actions
  signIn: async (email: string, password: string) => {
    set({ loading: true })
    try {
      const { data } = await authApi.signIn(email, password)
      set({
        user: data.user,
        session: data.session,
        loading: false,
      })
    } catch (error) {
      set({ loading: false })
      throw error
    }
  },

  signUp: async (email: string, password: string) => {
    set({ loading: true })
    try {
      const { data } = await authApi.signUp(email, password)

      // Check if email verification is required
      if (!data.session) {
        // User created but not confirmed - email verification required
        set({
          user: null,
          session: null,
          emailVerificationRequired: true,
          pendingVerificationEmail: email,
          loading: false,
        })
      } else {
        // User created and confirmed (auto-confirm enabled)
        set({
          user: data.user,
          session: data.session,
          emailVerificationRequired: false,
          pendingVerificationEmail: null,
          loading: false,
        })
      }
    } catch (error) {
      set({ loading: false })
      throw error
    }
  },

  signInWithGoogle: async () => {
    set({ loading: true })
    try {
      await authApi.signInWithGoogle()
    } catch (error) {
      set({ loading: false })
      throw error
    }
  },

  signInWithFacebook: async () => {
    set({ loading: true })
    try {
      await authApi.signInWithFacebook()
    } catch (error) {
      set({ loading: false })
      throw error
    }
  },

  signOut: async () => {
    set({ loading: true })
    try {
      await authApi.signOut()
      set({
        user: null,
        session: null,
        emailVerificationRequired: false,
        pendingVerificationEmail: null,
        loading: false,
      })
    } catch (error) {
      set({ loading: false })
      throw error
    }
  },

  resetPassword: async (email: string) => {
    await authApi.resetPassword(email)
  },

  updatePassword: async (password: string) => {
    await authApi.updatePassword(password)
  },

  resendVerificationEmail: async (email: string) => {
    await authApi.resendVerificationEmail(email)
  },

  // Setters
  setUser: user => set({ user }),
  setSession: session => set({ session }),
  setLoading: loading => set({ loading }),
  setInitialized: initialized => set({ initialized }),
  setEmailVerificationRequired: emailVerificationRequired =>
    set({ emailVerificationRequired }),
  setPendingVerificationEmail: pendingVerificationEmail =>
    set({ pendingVerificationEmail }),
}))
