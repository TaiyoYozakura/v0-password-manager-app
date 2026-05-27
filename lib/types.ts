import type { Timestamp } from "firebase/firestore"

export interface EncryptedPasswordDoc {
  encryptedPassword: string
  encryptedUsername: string
  encryptedEmail: string
  encryptedNotes: string
  integrityHash: string
  tag: string
  siteUrl: string
  siteName: string
  createdAt: Timestamp | null
  updatedAt: Timestamp | null
}

export interface DecryptedPasswordEntry {
  id: string
  siteName: string
  siteUrl: string
  tag: string
  password: string
  username: string
  email: string
  notes: string
  integrityOk: boolean
  createdAt: Date | null
  updatedAt: Date | null
}

export interface EncryptedPinDoc {
  encryptedPin: string
  encryptedNotes: string
  integrityHash: string
  label: string
  category: string
  createdAt: Timestamp | null
  updatedAt: Timestamp | null
}

export interface DecryptedPinEntry {
  id: string
  label: string
  category: string
  pin: string
  notes: string
  integrityOk: boolean
  createdAt: Date | null
  updatedAt: Date | null
}

export type PinCategory = "Banking" | "UPI/Payments" | "Phone" | "App Lock" | "Other"
export const PIN_CATEGORIES: PinCategory[] = ["Banking", "UPI/Payments", "Phone", "App Lock", "Other"]

export const DEFAULT_TAGS = [
  "Google Account",
  "GitHub",
  "Banking",
  "Work",
  "Social",
  "Shopping",
  "Other",
]

export interface UserProfile {
  appLockPinHash?: string
  appLockPinSalt?: string
  masterPinHash?: string
  masterPinSalt?: string
  requiresMasterPin?: boolean
  failedPinAttempts?: number
  pinLockedUntil?: number
  autoLogoutMinutes?: number
  createdAt?: Timestamp | null
  updatedAt?: Timestamp | null
}
