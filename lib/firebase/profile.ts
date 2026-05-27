import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore"
import { getFirebase } from "./config"
import type { UserProfile } from "../types"

const PROFILE_DOC = "app" // users/{uid}/profile/app

export async function getProfile(uid: string): Promise<UserProfile | null> {
  const { db } = getFirebase()
  const ref = doc(db, "users", uid, "profile", PROFILE_DOC)
  const snap = await getDoc(ref)
  if (!snap.exists()) return null
  return snap.data() as UserProfile
}

export async function setAppLockPin(
  uid: string,
  hash: string,
  salt: string,
): Promise<void> {
  const { db } = getFirebase()
  const ref = doc(db, "users", uid, "profile", PROFILE_DOC)
  await setDoc(
    ref,
    {
      appLockPinHash: hash,
      appLockPinSalt: salt,
      updatedAt: serverTimestamp(),
      createdAt: serverTimestamp(),
    },
    { merge: true },
  )
}

export async function setAutoLogoutMinutes(uid: string, minutes: number): Promise<void> {
  const { db } = getFirebase()
  const ref = doc(db, "users", uid, "profile", PROFILE_DOC)
  await setDoc(
    ref,
    {
      autoLogoutMinutes: minutes,
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  )
}

export async function setMasterPin(
  uid: string,
  hash: string,
  salt: string,
): Promise<void> {
  const { db } = getFirebase()
  const ref = doc(db, "users", uid, "profile", PROFILE_DOC)
  await setDoc(
    ref,
    {
      masterPinHash: hash,
      masterPinSalt: salt,
      requiresMasterPin: true,
      failedPinAttempts: 0,
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  )
}

export async function recordFailedPinAttempt(uid: string): Promise<void> {
  const { db } = getFirebase()
  const ref = doc(db, "users", uid, "profile", PROFILE_DOC)
  const profile = await getProfile(uid)
  const attempts = (profile?.failedPinAttempts ?? 0) + 1
  const isLocked = attempts >= 3
  const lockedUntil = isLocked ? Date.now() + 15 * 60 * 1000 : undefined

  await setDoc(
    ref,
    {
      failedPinAttempts: attempts,
      ...(isLocked && { pinLockedUntil: lockedUntil }),
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  )
}

export async function resetPinAttempts(uid: string): Promise<void> {
  const { db } = getFirebase()
  const ref = doc(db, "users", uid, "profile", PROFILE_DOC)
  await setDoc(
    ref,
    {
      failedPinAttempts: 0,
      pinLockedUntil: undefined,
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  )
}
