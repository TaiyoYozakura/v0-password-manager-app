import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'
import type { User } from 'firebase/auth'

interface AuthState {
  user: User | null
  masterKey: string | null
  sessionToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null

  setUser: (user: User | null) => void
  setMasterKey: (key: string) => void
  setSessionToken: (token: string) => void
  setIsLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  logout: () => void
  clearError: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      masterKey: null,
      sessionToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      setUser: (user) =>
        set({
          user,
          isAuthenticated: !!user,
        }),

      setMasterKey: (key) =>
        set({
          masterKey: key,
        }),

      setSessionToken: (token) =>
        set({
          sessionToken: token,
        }),

      setIsLoading: (loading) =>
        set({
          isLoading: loading,
        }),

      setError: (error) =>
        set({
          error,
        }),

      logout: () =>
        set({
          user: null,
          masterKey: null,
          sessionToken: null,
          isAuthenticated: false,
          error: null,
        }),

      clearError: () =>
        set({
          error: null,
        }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        sessionToken: state.sessionToken,
      }),
    },
  ),
)
