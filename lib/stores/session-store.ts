import { create } from "zustand"
import { Session } from "@/lib/types/v2-vault"

export interface SessionState {
  // Session data
  session: Session | null
  encryptionKey: string | null // Base64-encoded derived encryption key
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null

  // Actions
  setSession: (session: Session, encryptionKey: string) => void
  clearSession: () => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  updateSessionToken: (token: string) => void
}

/**
 * Global session store using Zustand
 * Manages authentication state and encryption key across the app
 */
export const useSessionStore = create<SessionState>((set) => ({
  session: null,
  encryptionKey: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  setSession: (session: Session, encryptionKey: string) =>
    set({
      session,
      encryptionKey,
      isAuthenticated: true,
      isLoading: false,
      error: null,
    }),

  clearSession: () =>
    set({
      session: null,
      encryptionKey: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    }),

  setLoading: (loading: boolean) => set({ isLoading: loading }),

  setError: (error: string | null) => set({ error }),

  updateSessionToken: (token: string) =>
    set((state) => ({
      session: state.session
        ? {
            ...state.session,
            sessionToken: token,
          }
        : null,
    })),
}))

/**
 * Local session persistence (for browser)
 * Stores encrypted session data in localStorage
 */
export const persistSession = (session: Session, encryptionKeyHash: string) => {
  if (typeof window === "undefined") return

  const sessionData = {
    session,
    keyHash: encryptionKeyHash,
    persistedAt: Date.now(),
  }

  localStorage.setItem("v2_session", JSON.stringify(sessionData))
}

/**
 * Restore session from localStorage
 */
export const restoreSession = () => {
  if (typeof window === "undefined") return null

  try {
    const stored = localStorage.getItem("v2_session")
    if (!stored) return null

    const sessionData = JSON.parse(stored)
    return sessionData
  } catch (err) {
    console.error("[v2] Failed to restore session:", err)
    return null
  }
}

/**
 * Clear persisted session from localStorage
 */
export const clearPersistedSession = () => {
  if (typeof window === "undefined") return

  localStorage.removeItem("v2_session")
}
