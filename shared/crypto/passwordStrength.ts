export type StrengthLevel = "empty" | "weak" | "fair" | "strong" | "very-strong"

export interface StrengthResult {
  level: StrengthLevel
  score: number // 0..4
  label: string
}

export function scorePassword(password: string): StrengthResult {
  if (!password) return { level: "empty", score: 0, label: "Empty" }

  let score = 0
  const length = password.length
  const hasLower = /[a-z]/.test(password)
  const hasUpper = /[A-Z]/.test(password)
  const hasNumber = /[0-9]/.test(password)
  const hasSpecial = /[^A-Za-z0-9]/.test(password)

  if (length >= 8) score += 1
  if (length >= 12) score += 1
  if (length >= 16) score += 1

  const varietyCount = [hasLower, hasUpper, hasNumber, hasSpecial].filter(Boolean).length
  if (varietyCount >= 3) score += 1
  if (varietyCount === 4 && length >= 12) score += 1

  // Cap to 4 scale levels
  if (score > 4) score = 4

  let level: StrengthLevel
  let label: string
  if (score <= 1) {
    level = "weak"
    label = "Weak"
  } else if (score === 2) {
    level = "fair"
    label = "Fair"
  } else if (score === 3) {
    level = "strong"
    label = "Strong"
  } else {
    level = "very-strong"
    label = "Very Strong"
  }

  return { level, score, label }
}

/**
 * A password is considered "weak" for dashboard counting purposes if it is
 * shorter than 8 characters OR has no special characters.
 */
export function isWeakPassword(password: string): boolean {
  if (!password) return true
  if (password.length < 8) return true
  if (!/[^A-Za-z0-9]/.test(password)) return true
  return false
}
