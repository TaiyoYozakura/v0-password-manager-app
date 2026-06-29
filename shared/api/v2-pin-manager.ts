import nacl from "tweetnacl"
import { PINItem } from "@/lib/types/v2-vault"

/**
 * PIN Manager for v2 password manager
 * Handles PIN generation, validation, and categorization
 */

export type PINCategory = "bank" | "credit-card" | "phone" | "home" | "work" | "other"

export const PIN_CATEGORIES: Record<PINCategory, { label: string; icon: string }> = {
  bank: { label: "Bank", icon: "🏦" },
  "credit-card": { label: "Credit Card", icon: "💳" },
  phone: { label: "Phone", icon: "📱" },
  home: { label: "Home", icon: "🏠" },
  work: { label: "Work", icon: "💼" },
  other: { label: "Other", icon: "📌" },
}

export interface PINStrength {
  score: 0 | 1 | 2 | 3 | 4 // 0: Very Weak, 1: Weak, 2: Fair, 3: Good, 4: Strong
  feedback: string[]
  vulnerabilities: string[]
}

export interface PINGenerationOptions {
  length?: number
  pattern?: "numeric" | "alphanumeric" | "custom"
  customCharacters?: string
  allowDuplicates?: boolean
}

/**
 * Generate a random numeric PIN
 */
export function generateNumericPIN(length: number = 6): string {
  if (length < 1 || length > 16) {
    throw new Error("PIN length must be between 1 and 16")
  }

  const randomBytes = nacl.randomBytes(length)
  let pin = ""

  for (let i = 0; i < length; i++) {
    pin += randomBytes[i] % 10
  }

  return pin
}

/**
 * Generate alphanumeric PIN
 */
export function generateAlphanumericPIN(length: number = 8): string {
  if (length < 1 || length > 16) {
    throw new Error("PIN length must be between 1 and 16")
  }

  const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ"
  const randomBytes = nacl.randomBytes(length)
  let pin = ""

  for (let i = 0; i < length; i++) {
    pin += chars[randomBytes[i] % chars.length]
  }

  return pin
}

/**
 * Generate custom PIN with specific character set
 */
export function generateCustomPIN(
  length: number = 8,
  customCharacters: string = "0123456789",
): string {
  if (length < 1 || length > 32) {
    throw new Error("PIN length must be between 1 and 32")
  }

  if (!customCharacters || customCharacters.length === 0) {
    throw new Error("Custom characters cannot be empty")
  }

  const randomBytes = nacl.randomBytes(length)
  let pin = ""

  for (let i = 0; i < length; i++) {
    pin += customCharacters[randomBytes[i] % customCharacters.length]
  }

  return pin
}

/**
 * Evaluate PIN strength
 */
export function evaluatePINStrength(pin: string): PINStrength {
  const vulnerabilities: string[] = []
  let score: 0 | 1 | 2 | 3 | 4 = 0
  const feedback: string[] = []

  // Length check
  if (pin.length < 4) {
    score = 0
    feedback.push("PIN is too short (minimum 4 digits)")
    vulnerabilities.push("Brute force vulnerability - too few combinations")
  } else if (pin.length < 6) {
    score = 1
    feedback.push("PIN should be at least 6 digits")
  } else if (pin.length < 8) {
    score = 2
  } else {
    score = 3
  }

  // Sequential check
  if (isSequential(pin)) {
    vulnerabilities.push("Sequential pattern detected (e.g., 1234 or 4321)")
    score = Math.min(score, 1)
    feedback.push("Avoid sequential patterns")
  }

  // Repeated digits check
  if (hasRepeatingPattern(pin)) {
    vulnerabilities.push("Repeating pattern detected (e.g., 1111 or 121212)")
    score = Math.min(score, 1)
    feedback.push("Avoid repeating digits")
  }

  // Common patterns check
  if (isCommonPIN(pin)) {
    vulnerabilities.push("Common PIN - widely used and easily guessable")
    score = 0
    feedback.push("Avoid common PINs like birth dates or 0000")
  }

  // Date pattern check
  if (isLikelyDatePattern(pin)) {
    vulnerabilities.push("Possible date pattern - may be easier to guess")
    score = Math.min(score, 2)
    feedback.push("Avoid using dates if possible")
  }

  if (feedback.length === 0) {
    feedback.push("Strong PIN")
    if (score < 4) score = 4
  }

  return { score, feedback, vulnerabilities }
}

/**
 * Check if PIN is sequential (e.g., 1234, 4321)
 */
function isSequential(pin: string): boolean {
  if (pin.length < 3) return false

  for (let i = 0; i < pin.length - 1; i++) {
    const diff = parseInt(pin[i + 1]) - parseInt(pin[i])
    if (Math.abs(diff) === 1 && i > 0) {
      const prevDiff = parseInt(pin[i]) - parseInt(pin[i - 1])
      if (diff === prevDiff) {
        return true
      }
    }
  }

  return false
}

/**
 * Check if PIN has repeating pattern (e.g., 1111, 121212)
 */
function hasRepeatingPattern(pin: string): boolean {
  // Check for consecutive repeats (1111)
  if (/(.)\1{2,}/.test(pin)) return true

  // Check for alternating pattern (121212)
  if (pin.length >= 4) {
    const pattern = pin.substring(0, 2)
    const expected = pattern.repeat(Math.ceil(pin.length / pattern.length)).substring(0, pin.length)
    if (pin === expected) return true
  }

  return false
}

/**
 * Check if PIN matches common patterns
 */
function isCommonPIN(pin: string): boolean {
  const commonPINs = [
    "0000", "1111", "2222", "3333", "4444", "5555", "6666", "7777", "8888", "9999",
    "1234", "4321", "1212", "2121", "0123", "3210", "1357", "2468", "9876",
    "1111111", "12345", "123456", "1234567", "12345678", "000000", "111111",
  ]

  return commonPINs.includes(pin)
}

/**
 * Check if PIN looks like a date (MMDD or DDMM)
 */
function isLikelyDatePattern(pin: string): boolean {
  if (pin.length !== 4 && pin.length !== 6 && pin.length !== 8) return false

  // Check MMDD pattern
  if (pin.length === 4) {
    const month = parseInt(pin.substring(0, 2))
    const day = parseInt(pin.substring(2, 4))
    return month >= 1 && month <= 12 && day >= 1 && day <= 31
  }

  // Check DDMMYY or MMDDYY pattern
  if (pin.length === 6) {
    const first = parseInt(pin.substring(0, 2))
    const second = parseInt(pin.substring(2, 4))
    return (first >= 1 && first <= 31 && second >= 1 && second <= 12) ||
           (first >= 1 && first <= 12 && second >= 1 && second <= 31)
  }

  return false
}

/**
 * Get PIN strength label
 */
export function getPINStrengthLabel(score: number): string {
  switch (score) {
    case 0:
      return "Very Weak"
    case 1:
      return "Weak"
    case 2:
      return "Fair"
    case 3:
      return "Good"
    case 4:
      return "Strong"
    default:
      return "Unknown"
  }
}

/**
 * Validate PIN format
 */
export function validatePIN(pin: string, allowAlphanumeric: boolean = false): boolean {
  if (!pin || pin.length < 1 || pin.length > 32) {
    return false
  }

  if (allowAlphanumeric) {
    return /^[0-9A-Za-z]+$/.test(pin)
  }

  return /^\d+$/.test(pin)
}

/**
 * Get PIN category suggestions based on label
 */
export function suggestPINCategory(label: string): PINCategory {
  const lowerLabel = label.toLowerCase()

  if (lowerLabel.includes("bank") || lowerLabel.includes("account")) {
    return "bank"
  }
  if (lowerLabel.includes("card") || lowerLabel.includes("credit")) {
    return "credit-card"
  }
  if (lowerLabel.includes("phone") || lowerLabel.includes("mobile")) {
    return "phone"
  }
  if (lowerLabel.includes("home") || lowerLabel.includes("house")) {
    return "home"
  }
  if (lowerLabel.includes("work") || lowerLabel.includes("office")) {
    return "work"
  }

  return "other"
}
