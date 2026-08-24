"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react"
import { type User } from "firebase/auth"
import type CryptoJS from "crypto-js"
import { subscribeAuth, signOut as fbSignOut } from "@/lib/firebase/auth"
import { deriveKey } from "@/lib/crypto/encryption"
import { getProfile } from "@/lib/firebase/profile"
import type { UserProfile } from "@/lib/types"
import { isFirebaseConfigured } from "@/lib/firebase/config"

interface AuthContextValue {
  user: User | null
  loading: boolean
  firebaseConfigured: boolean
  key: CryptoJS.lib.WordArray | null
  profile: UserProfile | null
  profileLoaded: boolean
  refreshProfile: () => Promise<void>
  logout: () => Promise<void>
  // App lock
  locked: boolean
  lock: () => void
  unlock: () => void
  // Inactivity
  resetInactivityTimer: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

const HIDDEN_LOCK_MS = 2 * 60 * 1000 // >2 minutes hidden triggers lock

export function AuthProvider({ children }: { children: ReactNode }) {
  const firebaseConfigured = isFirebaseConfigured()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [key, setKey] = useState<CryptoJS.lib.WordArray | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [profileLoaded, setProfileLoaded] = useState<boolean>(false)
  const [locked, setLocked] = useState<boolean>(false)

  const hiddenSinceRef = useRef<number | null>(null)
  const inactivityTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const logout = useCallback(async () => {
    try {
      await fbSignOut()
    } finally {
      setUser(null)
      setKey(null)
      setProfile(null)
      setProfileLoaded(false)
      setLocked(false)
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current)
        inactivityTimerRef.current = null
      }
    }
  }, [])

  const refreshProfile = useCallback(async () => {
    if (!user) {
      setProfile(null)
      setProfileLoaded(false)
      return
    }
    try {
      const p = await getProfile(user.uid)
      setProfile(p)
    } catch {
      setProfile(null)
    } finally {
      setProfileLoaded(true)
    }
  }, [user])

  const lock = useCallback(() => {
    if (user && profile?.appLockPinHash) {
      setLocked(true)
    }
  }, [user, profile])

  const unlock = useCallback(() => {
    setLocked(false)
  }, [])

  // Subscribe to auth state
  useEffect(() => {
    if (!firebaseConfigured) {
      setLoading(false)
      return
    }
    const unsub = subscribeAuth((u) => {
      setUser(u)
      if (u && u.email) {
        setKey(deriveKey(u.uid, u.email))
      } else {
        setKey(null)
      }
      setLoading(false)
    })
    return unsub
  }, [firebaseConfigured])

  // Load profile whenever user changes
  useEffect(() => {
    if (!user) {
      setProfile(null)
      setProfileLoaded(false)
      return
    }
    void refreshProfile()
  }, [user, refreshProfile])

  // Auto-logout on inactivity
  const autoLogoutMs = useMemo(() => {
    const minutes = profile?.autoLogoutMinutes ?? 15
    return minutes * 60 * 1000
  }, [profile?.autoLogoutMinutes])

  const resetInactivityTimer = useCallback(() => {
    if (!user) return
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current)
    }
    inactivityTimerRef.current = setTimeout(() => {
      void logout()
    }, autoLogoutMs)
  }, [user, autoLogoutMs, logout])

  useEffect(() => {
    if (!user) return
    resetInactivityTimer()
    const handler = () => resetInactivityTimer()
    const events: (keyof WindowEventMap)[] = ["mousemove", "keydown", "click", "scroll", "touchstart"]
    events.forEach((e) => window.addEventListener(e, handler, { passive: true }))
    return () => {
      events.forEach((e) => window.removeEventListener(e, handler))
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current)
        inactivityTimerRef.current = null
      }
    }
  }, [user, resetInactivityTimer])

  // App lock on tab visibility
  useEffect(() => {
    if (!user) return
    const onVisibility = () => {
      if (document.hidden) {
        hiddenSinceRef.current = Date.now()
      } else {
        const since = hiddenSinceRef.current
        hiddenSinceRef.current = null
        if (since && Date.now() - since > HIDDEN_LOCK_MS) {
          if (profile?.appLockPinHash) {
            setLocked(true)
          }
        }
      }
    }
    document.addEventListener("visibilitychange", onVisibility)
    return () => document.removeEventListener("visibilitychange", onVisibility)
  }, [user, profile?.appLockPinHash])

  const value: AuthContextValue = {
    user,
    loading,
    firebaseConfigured,
    key,
    profile,
    profileLoaded,
    refreshProfile,
    logout,
    locked,
    lock,
    unlock,
    resetInactivityTimer,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
