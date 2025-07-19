import { create } from 'zustand'
import { User, Session } from '@supabase/supabase-js'
import { authApi } from '../lib/auth'

interface AuthState {
  user: User | null
  session: Session | null
  loading: boolean
  initialized: boolean
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
  resetPassword: (email: string) => Promise<void>
  updatePassword: (password: string) => Promise<void>
}

type AuthStore = AuthState & AuthActions

export const useAuthStore = create<AuthStore>((set, _get) => ({
  // State
  user: null,
  session: null,
  loading: true,
  initialized: false,

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

  // Setters
  setUser: user => set({ user }),
  setSession: session => set({ session }),
  setLoading: loading => set({ loading }),
  setInitialized: initialized => set({ initialized }),
}))
