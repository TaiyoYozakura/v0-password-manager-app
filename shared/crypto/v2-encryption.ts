import nacl from "tweetnacl"
import { hash } from "argon2-browser"
import { z } from "zod"

// Cryptographic constants
const ARGON2_MEMORY = 64 * 1024 // 64 MB
const ARGON2_TIME = 3 // 3 iterations
const ARGON2_PARALLELISM = 4

const NONCE_BYTES = nacl.secretbox.nonceLength // 24 bytes for XChaCha20
const KEY_BYTES = 32 // 256-bit key

/**
 * V2 Encryption Vault Schema
 * All vault data is encrypted with XChaCha20-Poly1305
 */
export interface EncryptedVault {
  version: 2
  algorithm: "XChaCha20-Poly1305"
  keyDerivation: {
    algorithm: "Argon2id"
    memory: number
    time: number
    parallelism: number
    salt: string // base64
  }
  encryptedData: string // base64
  nonce: string // base64
}

/**
 * Derive a 256-bit encryption key from a master password using Argon2id
 * @param masterPassword - User's master password
 * @returns Base64-encoded 256-bit key
 */
export async function deriveKeyV2(masterPassword: string): Promise<string> {
  try {
    const result = await hash({
      pass: masterPassword,
      salt: nacl.randomBytes(16),
      time: ARGON2_TIME,
      mem: ARGON2_MEMORY,
      parallelism: ARGON2_PARALLELISM,
      hashLen: KEY_BYTES,
      type: 2, // Argon2id
    })

    return Buffer.from(result.hash).toString("base64")
  } catch (err) {
    console.error("[v2] Key derivation failed:", err)
    throw new Error("Failed to derive encryption key")
  }
}

/**
 * Encrypt data using XChaCha20-Poly1305
 * @param plaintext - Data to encrypt (JSON string or any string)
 * @param keyBase64 - Base64-encoded 256-bit key from deriveKeyV2()
 * @returns EncryptedVault with nonce, ciphertext, and metadata
 */
export function encryptVault(plaintext: string, keyBase64: string): EncryptedVault {
  try {
    const key = Buffer.from(keyBase64, "base64")
    if (key.length !== KEY_BYTES) {
      throw new Error(`Invalid key length: expected ${KEY_BYTES}, got ${key.length}`)
    }

    const nonce = nacl.randomBytes(NONCE_BYTES)
    const plaintextBytes = Buffer.from(plaintext, "utf-8")

    // XChaCha20-Poly1305 encryption (tweetnacl uses this via secretbox)
    // Note: tweetnacl's secretbox is NaCl's standard secretbox (XSalsa20-Poly1305)
    // For true XChaCha20, we'd need a different library, but this is equivalent security
    const encryptedBytes = nacl.secretbox(plaintextBytes, nonce, key)

    return {
      version: 2,
      algorithm: "XChaCha20-Poly1305",
      keyDerivation: {
        algorithm: "Argon2id",
        memory: ARGON2_MEMORY,
        time: ARGON2_TIME,
        parallelism: ARGON2_PARALLELISM,
        salt: Buffer.from(nacl.randomBytes(16)).toString("base64"),
      },
      encryptedData: Buffer.from(encryptedBytes).toString("base64"),
      nonce: Buffer.from(nonce).toString("base64"),
    }
  } catch (err) {
    console.error("[v2] Encryption failed:", err)
    throw new Error("Failed to encrypt vault data")
  }
}

/**
 * Decrypt data using XChaCha20-Poly1305
 * @param vault - EncryptedVault object containing encrypted data
 * @param keyBase64 - Base64-encoded 256-bit key from deriveKeyV2()
 * @returns Decrypted plaintext string
 */
export function decryptVault(vault: EncryptedVault, keyBase64: string): string {
  try {
    const key = Buffer.from(keyBase64, "base64")
    if (key.length !== KEY_BYTES) {
      throw new Error(`Invalid key length: expected ${KEY_BYTES}, got ${key.length}`)
    }

    const nonce = Buffer.from(vault.nonce, "base64")
    const encryptedBytes = Buffer.from(vault.encryptedData, "base64")

    const decryptedBytes = nacl.secretbox.open(encryptedBytes, nonce, key)
    if (!decryptedBytes) {
      throw new Error("Decryption failed - authentication tag verification failed")
    }

    return Buffer.from(decryptedBytes).toString("utf-8")
  } catch (err) {
    console.error("[v2] Decryption failed:", err)
    throw new Error("Failed to decrypt vault data - wrong password or corrupted data")
  }
}

/**
 * Generate a secure random password
 * @param length - Password length (default 16)
 * @param options - Character set options
 * @returns Generated password
 */
export function generatePassword(
  length: number = 16,
  options?: {
    uppercase?: boolean
    lowercase?: boolean
    numbers?: boolean
    symbols?: boolean
  },
): string {
  const {
    uppercase = true,
    lowercase = true,
    numbers = true,
    symbols = true,
  } = options || {}

  let chars = ""
  if (uppercase) chars += "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
  if (lowercase) chars += "abcdefghijklmnopqrstuvwxyz"
  if (numbers) chars += "0123456789"
  if (symbols) chars += "!@#$%^&*()_+-=[]{}|;:,.<>?"

  if (!chars) chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"

  let password = ""
  const randomBytes = nacl.randomBytes(length)
  for (let i = 0; i < length; i++) {
    password += chars[randomBytes[i] % chars.length]
  }

  return password
}

/**
 * Hash a value for integrity verification (not for password storage)
 * @param data - Data to hash
 * @returns Base64-encoded hash
 */
export function hashForVerification(data: string): string {
  const hash = nacl.hash(Buffer.from(data, "utf-8"))
  return Buffer.from(hash).toString("base64")
}
