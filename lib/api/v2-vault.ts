import { PasswordItem, PINItem, NoteItem, VaultData } from "@/lib/types/v2-vault"
import { encryptVault, decryptVault, EncryptedVault } from "@/lib/crypto/v2-encryption"

/**
 * Vault API Service for v2 password manager
 * Handles all vault operations: create, read, update, delete
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"

export interface VaultOperationRequest {
  sessionToken: string
  itemType: "password" | "pin" | "note"
  action: "create" | "read" | "update" | "delete"
  item?: PasswordItem | PINItem | NoteItem
  itemId?: string
}

/**
 * Fetch encrypted vault from server
 */
export async function fetchEncryptedVault(sessionToken: string): Promise<EncryptedVault> {
  try {
    const response = await fetch(`${API_BASE}/api/v2/vault/fetch`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${sessionToken}`,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch vault: ${response.statusText}`)
    }

    const vault = await response.json()
    return vault
  } catch (err) {
    console.error("[v2] Fetch vault error:", err)
    throw err
  }
}

/**
 * Save encrypted vault to server
 */
export async function saveEncryptedVault(
  sessionToken: string,
  encryptedVault: EncryptedVault,
): Promise<void> {
  try {
    const response = await fetch(`${API_BASE}/api/v2/vault/save`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${sessionToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(encryptedVault),
    })

    if (!response.ok) {
      throw new Error(`Failed to save vault: ${response.statusText}`)
    }
  } catch (err) {
    console.error("[v2] Save vault error:", err)
    throw err
  }
}

/**
 * Create a new password item locally (vault not synced yet)
 */
export function createPassword(vaultData: VaultData, password: Omit<PasswordItem, "id" | "createdAt" | "updatedAt">): VaultData {
  const newPassword: PasswordItem = {
    ...password,
    id: `pwd_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }

  return {
    ...vaultData,
    passwords: [...vaultData.passwords, newPassword],
    lastSyncedAt: Date.now(),
  }
}

/**
 * Update a password item locally
 */
export function updatePassword(vaultData: VaultData, id: string, updates: Partial<Omit<PasswordItem, "id" | "createdAt">>): VaultData {
  return {
    ...vaultData,
    passwords: vaultData.passwords.map((pwd) =>
      pwd.id === id
        ? {
            ...pwd,
            ...updates,
            updatedAt: Date.now(),
          }
        : pwd,
    ),
    lastSyncedAt: Date.now(),
  }
}

/**
 * Delete a password item locally
 */
export function deletePassword(vaultData: VaultData, id: string): VaultData {
  return {
    ...vaultData,
    passwords: vaultData.passwords.filter((pwd) => pwd.id !== id),
    lastSyncedAt: Date.now(),
  }
}

/**
 * Create a new PIN item locally
 */
export function createPIN(vaultData: VaultData, pin: Omit<PINItem, "id" | "createdAt" | "updatedAt">): VaultData {
  const newPIN: PINItem = {
    ...pin,
    id: `pin_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }

  return {
    ...vaultData,
    pins: [...vaultData.pins, newPIN],
    lastSyncedAt: Date.now(),
  }
}

/**
 * Update a PIN item locally
 */
export function updatePIN(vaultData: VaultData, id: string, updates: Partial<Omit<PINItem, "id" | "createdAt">>): VaultData {
  return {
    ...vaultData,
    pins: vaultData.pins.map((pin) =>
      pin.id === id
        ? {
            ...pin,
            ...updates,
            updatedAt: Date.now(),
          }
        : pin,
    ),
    lastSyncedAt: Date.now(),
  }
}

/**
 * Delete a PIN item locally
 */
export function deletePIN(vaultData: VaultData, id: string): VaultData {
  return {
    ...vaultData,
    pins: vaultData.pins.filter((pin) => pin.id !== id),
    lastSyncedAt: Date.now(),
  }
}

/**
 * Create a new note locally
 */
export function createNote(vaultData: VaultData, note: Omit<NoteItem, "id" | "createdAt" | "updatedAt">): VaultData {
  const newNote: NoteItem = {
    ...note,
    id: `note_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }

  return {
    ...vaultData,
    notes: [...vaultData.notes, newNote],
    lastSyncedAt: Date.now(),
  }
}

/**
 * Update a note locally
 */
export function updateNote(vaultData: VaultData, id: string, updates: Partial<Omit<NoteItem, "id" | "createdAt">>): VaultData {
  return {
    ...vaultData,
    notes: vaultData.notes.map((note) =>
      note.id === id
        ? {
            ...note,
            ...updates,
            updatedAt: Date.now(),
          }
        : note,
    ),
    lastSyncedAt: Date.now(),
  }
}

/**
 * Delete a note locally
 */
export function deleteNote(vaultData: VaultData, id: string): VaultData {
  return {
    ...vaultData,
    notes: vaultData.notes.filter((note) => note.id !== id),
    lastSyncedAt: Date.now(),
  }
}

/**
 * Get vault statistics
 */
export function getVaultStats(vaultData: VaultData) {
  return {
    totalPasswords: vaultData.passwords.length,
    totalPINs: vaultData.pins.length,
    totalNotes: vaultData.notes.length,
    favoritePasswords: vaultData.passwords.filter((p) => p.favorite).length,
    lastSynced: vaultData.lastSyncedAt,
  }
}
