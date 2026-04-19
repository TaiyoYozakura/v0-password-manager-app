import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore"
import { db } from "./config"
import type { UserProfile } from "../types"

export async function getProfile(uid: string): Promise<UserProfile | null> {
  const snap = await getDoc(doc(db, "users", uid))
  if (!snap.exists()) return null
  return snap.data() as UserProfile
}

export async function createProfile(profile: UserProfile) {
  await setDoc(doc(db, "users", profile.uid), {
    ...profile,
    createdAtServer: serverTimestamp(),
  })
}

export async function updateProfile(uid: string, patch: Partial<UserProfile>) {
  await updateDoc(doc(db, "users", uid), patch)
}
