import CryptoJS from "crypto-js"

/**
 * Derive the symmetric AES-256 encryption key from the user's UID + email.
 * Returns a WordArray suitable for use with CryptoJS.AES.
 * The derived key is NEVER persisted anywhere (localStorage, Firestore, etc).
 */
export function deriveKey(uid: string, email: string): CryptoJS.lib.WordArray {
  const material = `${uid}:${email.trim().toLowerCase()}`
  return CryptoJS.SHA256(material)
}

/**
 * AES-256 encrypt a UTF-8 string using a derived WordArray key.
 * Returns CryptoJS's default OpenSSL-compatible ciphertext string.
 * Empty/undefined values are returned as an empty string to keep Firestore
 * schema consistent (they are still "encrypted-shaped" placeholders).
 */
export function encryptString(plaintext: string | undefined | null, key: CryptoJS.lib.WordArray): string {
  const value = plaintext ?? ""
  if (value.length === 0) {
    // Still encrypt so we always store ciphertext, never plaintext.
    return CryptoJS.AES.encrypt("", key.toString()).toString()
  }
  return CryptoJS.AES.encrypt(value, key.toString()).toString()
}

/**
 * AES-256 decrypt a ciphertext string. Returns plaintext.
 * If decryption fails or yields empty bytes, returns an empty string.
 */
export function decryptString(ciphertext: string | undefined | null, key: CryptoJS.lib.WordArray): string {
  if (!ciphertext) return ""
  try {
    const bytes = CryptoJS.AES.decrypt(ciphertext, key.toString())
    const text = bytes.toString(CryptoJS.enc.Utf8)
    return text
  } catch {
    return ""
  }
}

/**
 * HMAC-SHA256 integrity hash. Used to detect tampering on sensitive fields.
 */
export function integrityHash(plaintext: string, key: CryptoJS.lib.WordArray): string {
  return CryptoJS.HmacSHA256(plaintext, key.toString()).toString(CryptoJS.enc.Hex)
}

/**
 * SHA-256 salted hash for the App Lock PIN. The salt is stored alongside
 * the hash in Firestore so we can verify future PIN entries.
 */
export function hashPin(pin: string, salt: string): string {
  return CryptoJS.SHA256(`${salt}:${pin}`).toString(CryptoJS.enc.Hex)
}

/** Generate a cryptographically random salt (hex). */
export function generateSalt(byteLength = 16): string {
  const array = new Uint8Array(byteLength)
  crypto.getRandomValues(array)
  return Array.from(array)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
}

/**
 * AES encrypt an arbitrary string with a user-chosen passphrase.
 * Used for the Settings → Export Vault flow.
 */
export function encryptWithPassphrase(plaintext: string, passphrase: string): string {
  return CryptoJS.AES.encrypt(plaintext, passphrase).toString()
}
