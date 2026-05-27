import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut as fbSignOut,
  onAuthStateChanged,
  browserLocalPersistence,
  setPersistence,
  type User,
} from "firebase/auth"
import { getFirebase } from "./config"

export async function signInWithGoogle(): Promise<User> {
  try {
    console.log("[v0] getFirebase() initializing...")
    const { auth } = getFirebase()
    console.log("[v0] Firebase auth obtained, setting persistence...")
    await setPersistence(auth, browserLocalPersistence)
    console.log("[v0] Persistence set, creating Google provider...")
    const provider = new GoogleAuthProvider()
    provider.setCustomParameters({ prompt: "select_account" })
    console.log("[v0] Provider configured, opening popup...")
    const result = await signInWithPopup(auth, provider)
    console.log("[v0] Sign-in successful, returning user:", result.user.email)
    return result.user
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err)
    console.error("[v0] Google Sign-In failed:", errorMsg)
    throw err
  }
}

export async function signOut(): Promise<void> {
  const { auth } = getFirebase()
  await fbSignOut(auth)
}

export function subscribeAuth(cb: (user: User | null) => void): () => void {
  const { auth } = getFirebase()
  return onAuthStateChanged(auth, cb)
}
