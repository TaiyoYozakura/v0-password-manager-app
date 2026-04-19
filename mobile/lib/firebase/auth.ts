import {
  GoogleAuthProvider,
  signInWithCredential,
  signOut as fbSignOut,
} from "firebase/auth"
import { auth } from "./config"

export async function signInWithGoogleIdToken(idToken: string) {
  const credential = GoogleAuthProvider.credential(idToken)
  return signInWithCredential(auth, credential)
}

export async function signOut() {
  await fbSignOut(auth)
}
