export type StrengthScore = 0 | 1 | 2 | 3 | 4

export function scorePassword(password: string): StrengthScore {
  if (!password) return 0
  let score = 0
  const len = password.length
  if (len >= 8) score++
  if (len >= 12) score++
  if (len >= 16) score++
  const variety =
    Number(/[a-z]/.test(password)) +
    Number(/[A-Z]/.test(password)) +
    Number(/[0-9]/.test(password)) +
    Number(/[^A-Za-z0-9]/.test(password))
  if (variety >= 3) score++
  if (variety === 4 && len >= 12) score++
  if (/(.)\1{2,}/.test(password)) score = Math.max(0, score - 1)
  return Math.min(4, score) as StrengthScore
}

export const STRENGTH_LABELS = ["Very weak", "Weak", "Fair", "Strong", "Very strong"] as const
export const STRENGTH_COLORS = ["#ef4444", "#f97316", "#f59e0b", "#22c55e", "#16a34a"] as const
