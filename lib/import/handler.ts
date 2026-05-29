import CryptoJS from "crypto-js"
import type { DecryptedPasswordEntry, DecryptedPinEntry } from "@/lib/types"

export interface ExportedVault {
  version: number
  exportedAt: string
  user: { uid: string; email: string }
  passwords: Array<{
    siteName: string
    siteUrl: string
    tag: string
    username: string
    email: string
    password: string
    notes: string
    createdAt: string | null
  }>
  pins: Array<{
    label: string
    category: string
    pin: string
    notes: string
    createdAt: string | null
  }>
}

export async function decryptVaultFile(
  fileContent: string,
  passphrase: string,
): Promise<ExportedVault> {
  try {
    const fileJson = JSON.parse(fileContent)

    if (fileJson.format !== "vaultly-export") {
      throw new Error("Invalid file format. Must be a Vaultly export file.")
    }

    if (fileJson.version !== 1) {
      throw new Error(`Unsupported export version: ${fileJson.version}`)
    }

    // Decrypt the data
    const decrypted = CryptoJS.AES.decrypt(fileJson.data, passphrase)
    const decryptedText = decrypted.toString(CryptoJS.enc.Utf8)

    if (!decryptedText) {
      throw new Error("Failed to decrypt file. Passphrase may be incorrect.")
    }

    const vault = JSON.parse(decryptedText) as ExportedVault

    if (!vault.passwords || !vault.pins) {
      throw new Error("Invalid vault structure in file.")
    }

    return vault
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to decrypt vault file"
    throw new Error(message)
  }
}

export function validateVaultData(vault: ExportedVault): string[] {
  const errors: string[] = []

  if (!Array.isArray(vault.passwords)) {
    errors.push("Passwords array is missing or invalid")
  }

  if (!Array.isArray(vault.pins)) {
    errors.push("PINs array is missing or invalid")
  }

  vault.passwords?.forEach((p, i) => {
    if (!p.siteName) errors.push(`Password ${i + 1}: siteName is required`)
    if (!p.password) errors.push(`Password ${i + 1}: password is required`)
  })

  vault.pins?.forEach((p, i) => {
    if (!p.label) errors.push(`PIN ${i + 1}: label is required`)
    if (!p.pin) errors.push(`PIN ${i + 1}: pin is required`)
  })

  return errors
}
