export type PasswordTag = "Personal" | "Work" | "Banking" | "Social" | "Other"

export type EncryptedField = {
  ciphertext: string
  iv: string
  salt: string
}

export type PasswordEntry = {
  id: string
  title: string
  email?: string
  username?: string
  siteUrl?: string
  password: EncryptedField
  notes?: EncryptedField
  tag: PasswordTag
  createdAt: number
  updatedAt: number
  passwordStrength: 0 | 1 | 2 | 3 | 4
}

export type PinCategory = "Bank" | "Card" | "SIM" | "Device" | "Other"

export type PinEntry = {
  id: string
  label: string
  category: PinCategory
  value: EncryptedField
  notes?: EncryptedField
  createdAt: number
  updatedAt: number
}

export type UserProfile = {
  uid: string
  email: string
  displayName: string
  photoURL?: string
  pinVerifierHash?: string
  pinSalt?: string
  createdAt: number
  autoLogoutMinutes: number
  themePreference: "light" | "dark" | "system"
  biometricEnabled?: boolean
}

export type ActivityEvent = {
  id: string
  type:
    | "login"
    | "logout"
    | "lock"
    | "unlock"
    | "create"
    | "update"
    | "delete"
    | "view"
    | "copy"
  itemKind?: "password" | "pin"
  itemId?: string
  label?: string
  ts: number
}
