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
  const { auth } = getFirebase()
  await setPersistence(auth, browserLocalPersistence)
  const provider = new GoogleAuthProvider()
  provider.setCustomParameters({ prompt: "select_account" })
  const result = await signInWithPopup(auth, provider)
  return result.user
}

export async function signOut(): Promise<void> {
  const { auth } = getFirebase()
  await fbSignOut(auth)
}

export function subscribeAuth(cb: (user: User | null) => void): () => void {
  const { auth } = getFirebase()
  return onAuthStateChanged(auth, cb)
}
