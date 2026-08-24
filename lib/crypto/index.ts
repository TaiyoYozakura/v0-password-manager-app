export * from "./bcrypt"
export * from "./encryption"
export * from "./generate"
export * from "./passwordStrength"

// Keep the V2 vault primitives explicit so its legacy generatePassword helper
// cannot collide with the browser-safe generator export above.
export {
  deriveKeyV2,
  encryptVault,
  decryptVault,
  hashForVerification,
} from "./v2-encryption"
export type { EncryptedVault } from "./v2-encryption"
