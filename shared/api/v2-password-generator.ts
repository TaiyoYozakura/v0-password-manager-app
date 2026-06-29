import nacl from "tweetnacl"

/**
 * Advanced password generator for v2 password manager
 * Uses cryptographically secure random generation
 */

export interface PasswordGeneratorOptions {
  length?: number
  uppercase?: boolean
  lowercase?: boolean
  numbers?: boolean
  symbols?: boolean
  excludeAmbiguous?: boolean
  minUppercase?: number
  minLowercase?: number
  minNumbers?: number
  minSymbols?: number
}

export interface PasswordStrength {
  score: 0 | 1 | 2 | 3 | 4 // 0: Very Weak, 1: Weak, 2: Fair, 3: Good, 4: Strong
  feedback: string[]
  estimatedCrackTime: string
}

const UPPERCASE = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
const LOWERCASE = "abcdefghijklmnopqrstuvwxyz"
const NUMBERS = "0123456789"
const SYMBOLS = "!@#$%^&*()_+-=[]{}|;:,.<>?~`"

// Ambiguous characters that are hard to distinguish
const AMBIGUOUS = "0O1l|I`'"

/**
 * Generate a cryptographically secure password
 */
export function generatePassword(options: PasswordGeneratorOptions = {}): string {
  const {
    length = 16,
    uppercase = true,
    lowercase = true,
    numbers = true,
    symbols = false,
    excludeAmbiguous = false,
    minUppercase = 0,
    minLowercase = 0,
    minNumbers = 0,
    minSymbols = 0,
  } = options

  // Build character set
  let chars = ""
  if (uppercase) chars += excludeAmbiguous ? UPPERCASE.replace(/[O1I]/g, "") : UPPERCASE
  if (lowercase) chars += excludeAmbiguous ? LOWERCASE.replace(/[l]/g, "") : LOWERCASE
  if (numbers) chars += excludeAmbiguous ? NUMBERS.replace(/[0O1l]/g, "") : NUMBERS
  if (symbols) chars += SYMBOLS

  if (!chars) {
    throw new Error("At least one character type must be enabled")
  }

  const randomBytes = nacl.randomBytes(length)
  let password = ""

  // Ensure minimum requirements are met
  const requirements: [string, number][] = [
    [uppercase ? (excludeAmbiguous ? UPPERCASE.replace(/[O1I]/g, "") : UPPERCASE) : "", minUppercase],
    [lowercase ? (excludeAmbiguous ? LOWERCASE.replace(/[l]/g, "") : LOWERCASE) : "", minLowercase],
    [numbers ? (excludeAmbiguous ? NUMBERS.replace(/[0O1l]/g, "") : NUMBERS) : "", minNumbers],
    [symbols ? SYMBOLS : "", minSymbols],
  ].filter(([set, min]) => set && min > 0)

  // Build password with minimum requirements
  let usedLength = 0
  for (const [set, min] of requirements) {
    for (let i = 0; i < min; i++) {
      const index = nacl.randomBytes(1)[0] % set.length
      password += set[index]
      usedLength++
    }
  }

  // Fill remaining length with random characters
  for (let i = usedLength; i < length; i++) {
    const index = randomBytes[i] % chars.length
    password += chars[index]
  }

  // Shuffle password to avoid predictable patterns
  return shuffleString(password)
}

/**
 * Generate passphrase using dictionary words
 */
export function generatePassphrase(
  wordCount: number = 4,
  separator: string = "-",
  capitalize: boolean = true,
): string {
  const words = [
    "correct", "horse", "battery", "staple", "python", "coffee", "guitar", "sunrise",
    "mountain", "crystal", "diamond", "thunder", "whisper", "dragon", "phoenix", "garden",
    "river", "ocean", "forest", "desert", "rainbow", "butterfly", "elephant", "penguin",
    "giraffe", "leopard", "tiger", "eagle", "falcon", "dolphin", "whale", "shark",
    "panda", "koala", "rabbit", "squirrel", "hedgehog", "flamingo", "peacock", "penguin",
  ]

  const randomBytes = nacl.randomBytes(wordCount)
  const selectedWords: string[] = []

  for (let i = 0; i < wordCount; i++) {
    const index = randomBytes[i] % words.length
    let word = words[index]
    if (capitalize) {
      word = word.charAt(0).toUpperCase() + word.slice(1)
    }
    selectedWords.push(word)
  }

  return selectedWords.join(separator)
}

/**
 * Shuffle a string using Fisher-Yates algorithm
 */
function shuffleString(str: string): string {
  const arr = str.split("")
  const randomBytes = nacl.randomBytes(arr.length)

  for (let i = arr.length - 1; i > 0; i--) {
    const j = randomBytes[arr.length - 1 - i] % (i + 1)
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }

  return arr.join("")
}

/**
 * Evaluate password strength
 */
export function evaluatePasswordStrength(password: string): PasswordStrength {
  const hasUppercase = /[A-Z]/.test(password)
  const hasLowercase = /[a-z]/.test(password)
  const hasNumbers = /[0-9]/.test(password)
  const hasSymbols = /[!@#$%^&*()_+\-=\[\]{}|;:,.<>?~`]/.test(password)
  const hasSequences = /(.)\1{2,}/.test(password)
  const hasKeyboardPatterns = /qwerty|asdfgh|zxcvbn|123456|654321/i.test(password)

  let score: 0 | 1 | 2 | 3 | 4 = 0
  const feedback: string[] = []

  // Length evaluation
  if (password.length < 8) {
    score = 0
    feedback.push("Password is too short (minimum 8 characters)")
  } else if (password.length < 12) {
    score = 1
    feedback.push("Password should be at least 12 characters")
  } else if (password.length < 16) {
    score = 2
  } else {
    score = 3
  }

  // Character set evaluation
  const charTypes = [hasUppercase, hasLowercase, hasNumbers, hasSymbols].filter(Boolean).length

  if (charTypes < 2) {
    feedback.push("Use multiple character types (uppercase, lowercase, numbers, symbols)")
    score = Math.min(score, 1)
  } else if (charTypes < 4) {
    feedback.push("Use all character types for stronger password")
    if (score === 3) score = 2
  } else {
    if (score === 3) score = 4
  }

  // Common patterns
  if (hasSequences) {
    feedback.push("Avoid repeating characters")
    score = Math.min(score, 1)
  }

  if (hasKeyboardPatterns) {
    feedback.push("Avoid common keyboard patterns")
    score = Math.min(score, 1)
  }

  // Calculate estimated crack time
  const charsetSize = (hasUppercase ? 26 : 0) + (hasLowercase ? 26 : 0) + (hasNumbers ? 10 : 0) + (hasSymbols ? 32 : 0)
  const possibilities = Math.pow(charsetSize, password.length)
  const secondsToCrack = possibilities / 2 / 1e9 // Assuming 1 billion guesses/second

  let estimatedCrackTime = ""
  if (secondsToCrack < 1) {
    estimatedCrackTime = "Instant"
  } else if (secondsToCrack < 60) {
    estimatedCrackTime = `${Math.round(secondsToCrack)} seconds`
  } else if (secondsToCrack < 3600) {
    estimatedCrackTime = `${Math.round(secondsToCrack / 60)} minutes`
  } else if (secondsToCrack < 86400) {
    estimatedCrackTime = `${Math.round(secondsToCrack / 3600)} hours`
  } else if (secondsToCrack < 31536000) {
    estimatedCrackTime = `${Math.round(secondsToCrack / 86400)} days`
  } else {
    estimatedCrackTime = "Centuries"
  }

  return {
    score,
    feedback: feedback.length > 0 ? feedback : ["Strong password"],
    estimatedCrackTime,
  }
}

/**
 * Get password strength label
 */
export function getStrengthLabel(score: number): string {
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
