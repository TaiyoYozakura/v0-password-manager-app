import crypto from "crypto"

/**
 * Simple bcrypt-like implementation using PBKDF2 for Master PIN hashing.
 * Generates a salt and hashes the PIN securely.
 */
export function hashMasterPin(pin: string): { hash: string; salt: string } {
  const salt = crypto.randomBytes(16).toString("hex")
  const hash = crypto
    .pbkdf2Sync(pin, salt, 100000, 64, "sha256")
    .toString("hex")
  return { hash, salt }
}

/**
 * Verify a Master PIN against its stored hash and salt.
 */
export function verifyMasterPin(
  pin: string,
  hash: string,
  salt: string,
): boolean {
  const computed = crypto
    .pbkdf2Sync(pin, salt, 100000, 64, "sha256")
    .toString("hex")
  return computed === hash
}
