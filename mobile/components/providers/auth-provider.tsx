import type CryptoJS from "crypto-js"
import { onAuthStateChanged, type User } from "firebase/auth"
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"
import { AppState, type AppStateStatus } from "react-native"
import { auth } from "@/lib/firebase/config"
import { signOut as fbSignOut } from "@/lib/firebase/auth"
import {
  createProfile,
  getProfile,
  updateProfile,
} from "@/lib/firebase/profile"
import {
  deriveMasterKey,
  makePinSalt,
  pinVerifier,
} from "@/lib/crypto/encryption"
import {
  clearBiometricPin,
  getBiometricPin,
  saveBiometricPin,
} from "@/lib/secure-store"
import type { UserProfile } from "@/lib/types"

type Status = "loading" | "signed-out" | "needs-pin-setup" | "locked" | "unlocked"

type Ctx = {
  user: User | null
  profile: UserProfile | null
  status: Status
  masterKey: CryptoJS.lib.WordArray | null
  setupPin: (pin: string, enableBiometric: boolean) => Promise<void>
  unlockWithPin: (pin: string) => Promise<boolean>
  unlockWithBiometric: () => Promise<boolean>
  changePin: (oldPin: string, newPin: string) => Promise<void>
  setBiometricEnabled: (enabled: boolean, currentPin?: string) => Promise<void>
  setAutoLogoutMinutes: (minutes: number) => Promise<void>
  lock: () => void
  signOut: () => Promise<void>
  bumpActivity: () => void
}

const AuthContext = createContext<Ctx | null>(null)

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider")
  return ctx
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [status, setStatus] = useState<Status>("loading")
  const masterKeyRef = useRef<CryptoJS.lib.WordArray | null>(null)
  const lastActivityRef = useRef<number>(Date.now())
  const inactivityTimer = useRef<ReturnType<typeof setInterval> | null>(null)

  const setMasterKey = (k: CryptoJS.lib.WordArray | null) => {
    masterKeyRef.current = k
  }

  const lock = useCallback(() => {
    setMasterKey(null)
    setStatus((prev) => (prev === "signed-out" ? prev : "locked"))
  }, [])

  const signOut = useCallback(async () => {
    setMasterKey(null)
    await fbSignOut()
    setProfile(null)
    setStatus("signed-out")
  }, [])

  const bumpActivity = useCallback(() => {
    lastActivityRef.current = Date.now()
  }, [])

  // Inactivity watcher
  useEffect(() => {
    if (status !== "unlocked") return
    const minutes = profile?.autoLogoutMinutes ?? 5
    const timeoutMs = minutes * 60 * 1000
    inactivityTimer.current = setInterval(() => {
      if (Date.now() - lastActivityRef.current >= timeoutMs) {
        lock()
      }
    }, 15_000)
    return () => {
      if (inactivityTimer.current) clearInterval(inactivityTimer.current)
    }
  }, [status, profile?.autoLogoutMinutes, lock])

  // Lock on background
  useEffect(() => {
    const sub = AppState.addEventListener("change", (next: AppStateStatus) => {
      if (next === "background" && status === "unlocked") {
        lock()
      }
    })
    return () => sub.remove()
  }, [status, lock])

  // Auth state
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u)
      if (!u) {
        setProfile(null)
        setMasterKey(null)
        setStatus("signed-out")
        return
      }
      const p = await getProfile(u.uid)
      if (!p) {
        const newProfile: UserProfile = {
          uid: u.uid,
          email: u.email ?? "",
          displayName: u.displayName ?? "Vault user",
          photoURL: u.photoURL ?? undefined,
          createdAt: Date.now(),
          autoLogoutMinutes: 5,
          themePreference: "system",
        }
        await createProfile(newProfile)
        setProfile(newProfile)
        setStatus("needs-pin-setup")
      } else {
        setProfile(p)
        setStatus(p.pinVerifierHash ? "locked" : "needs-pin-setup")
      }
    })
    return unsub
  }, [])

  const setupPin = useCallback(
    async (pin: string, enableBiometric: boolean) => {
      if (!user || !profile) return
      const salt = makePinSalt()
      const verifier = pinVerifier(pin, salt)
      await updateProfile(user.uid, {
        pinSalt: salt,
        pinVerifierHash: verifier,
        biometricEnabled: enableBiometric,
      })
      setProfile({
        ...profile,
        pinSalt: salt,
        pinVerifierHash: verifier,
        biometricEnabled: enableBiometric,
      })
      setMasterKey(deriveMasterKey(user.uid, pin))
      if (enableBiometric) {
        try {
          await saveBiometricPin(user.uid, pin)
        } catch {
          // ignore – biometric may be unavailable
        }
      }
      setStatus("unlocked")
      bumpActivity()
    },
    [user, profile, bumpActivity],
  )

  const unlockWithPin = useCallback(
    async (pin: string) => {
      if (!user || !profile?.pinVerifierHash || !profile.pinSalt) return false
      const verifier = pinVerifier(pin, profile.pinSalt)
      if (verifier !== profile.pinVerifierHash) return false
      setMasterKey(deriveMasterKey(user.uid, pin))
      setStatus("unlocked")
      bumpActivity()
      return true
    },
    [user, profile, bumpActivity],
  )

  const unlockWithBiometric = useCallback(async () => {
    if (!user) return false
    const pin = await getBiometricPin(user.uid)
    if (!pin) return false
    return unlockWithPin(pin)
  }, [user, unlockWithPin])

  const changePin = useCallback(
    async (oldPin: string, newPin: string) => {
      if (!user || !profile?.pinVerifierHash || !profile.pinSalt) {
        throw new Error("No profile")
      }
      const verifier = pinVerifier(oldPin, profile.pinSalt)
      if (verifier !== profile.pinVerifierHash) {
        throw new Error("Incorrect current PIN")
      }
      const salt = makePinSalt()
      const newVerifier = pinVerifier(newPin, salt)
      await updateProfile(user.uid, {
        pinSalt: salt,
        pinVerifierHash: newVerifier,
      })
      setProfile({
        ...profile,
        pinSalt: salt,
        pinVerifierHash: newVerifier,
      })
      setMasterKey(deriveMasterKey(user.uid, newPin))
      if (profile.biometricEnabled) {
        try {
          await saveBiometricPin(user.uid, newPin)
        } catch {
          // ignore
        }
      }
    },
    [user, profile],
  )

  const setBiometricEnabled = useCallback(
    async (enabled: boolean, currentPin?: string) => {
      if (!user || !profile) return
      await updateProfile(user.uid, { biometricEnabled: enabled })
      setProfile({ ...profile, biometricEnabled: enabled })
      if (enabled && currentPin) {
        try {
          await saveBiometricPin(user.uid, currentPin)
        } catch {
          // ignore
        }
      }
      if (!enabled) await clearBiometricPin(user.uid)
    },
    [user, profile],
  )

  const setAutoLogoutMinutes = useCallback(
    async (minutes: number) => {
      if (!user || !profile) return
      await updateProfile(user.uid, { autoLogoutMinutes: minutes })
      setProfile({ ...profile, autoLogoutMinutes: minutes })
    },
    [user, profile],
  )

  const value = useMemo<Ctx>(
    () => ({
      user,
      profile,
      status,
      masterKey: masterKeyRef.current,
      setupPin,
      unlockWithPin,
      unlockWithBiometric,
      changePin,
      setBiometricEnabled,
      setAutoLogoutMinutes,
      lock,
      signOut,
      bumpActivity,
    }),
    [
      user,
      profile,
      status,
      setupPin,
      unlockWithPin,
      unlockWithBiometric,
      changePin,
      setBiometricEnabled,
      setAutoLogoutMinutes,
      lock,
      signOut,
      bumpActivity,
    ],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
