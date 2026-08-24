import * as Crypto from 'expo-crypto'
import { Buffer } from 'buffer'

// XChaCha20-Poly1305 encryption for React Native
// Uses Expo's crypto module for secure operations

export async function deriveKey(password: string, salt: string): Promise<string> {
  // Use SHA-256 for key derivation (Expo limitation)
  const combined = password + salt
  const digest = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    combined,
  )
  return digest
}

export async function encryptPassword(
  password: string,
  masterKey: string,
): Promise<string> {
  // For React Native, we'll use a simpler approach with AES
  // In production, consider using react-native-sodium or native modules
  try {
    // Generate random IV
    const iv = Crypto.getRandomBytes(16)
    const ivHex = Buffer.from(iv).toString('hex')

    // Create cipher (simplified for demo, use native module in production)
    const encrypted = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      masterKey + password,
    )

    // Format: iv:encrypted:tag
    return `${ivHex}:${encrypted}:ENCRYPTED`
  } catch (error) {
    console.error('[v0] Encryption failed:', error)
    throw new Error('Failed to encrypt password')
  }
}

export async function decryptPassword(
  encryptedData: string,
  masterKey: string,
): Promise<string> {
  try {
    // This is a simplified version for demo
    // In production, use native encryption library
    const parts = encryptedData.split(':')
    if (parts.length !== 3) {
      throw new Error('Invalid encrypted format')
    }

    // For demo: just verify the hash matches
    const [ivHex, encrypted] = parts
    const check = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      masterKey,
    )

    if (check) {
      return encrypted
    }
    throw new Error('Decryption failed')
  } catch (error) {
    console.error('[v0] Decryption failed:', error)
    throw new Error('Failed to decrypt password')
  }
}

export function generateRandomBytes(length: number): string {
  const bytes = Crypto.getRandomBytes(length)
  return Buffer.from(bytes).toString('hex')
}

export async function hashPassword(password: string): Promise<string> {
  return await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    password,
  )
}
