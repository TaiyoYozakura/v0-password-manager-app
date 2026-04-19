export interface PasswordGenOptions {
  length: number
  uppercase: boolean
  lowercase: boolean
  numbers: boolean
  special: boolean
  excludeAmbiguous: boolean
}

const UPPER = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
const LOWER = "abcdefghijklmnopqrstuvwxyz"
const NUMBERS = "0123456789"
const SPECIAL = "!@#$%^&*()-_=+[]{};:,.<>?/"
const AMBIGUOUS = new Set(["0", "O", "I", "l", "1"])

function secureRandomIndex(max: number): number {
  // Rejection sampling to avoid modulo bias
  const arr = new Uint32Array(1)
  const limit = Math.floor(0xffffffff / max) * max
  while (true) {
    crypto.getRandomValues(arr)
    if (arr[0] < limit) return arr[0] % max
  }
}

export function generatePassword(options: PasswordGenOptions): string {
  const { length, uppercase, lowercase, numbers, special, excludeAmbiguous } = options

  let charset = ""
  const required: string[] = []
  if (uppercase) {
    const s = excludeAmbiguous ? stripAmbiguous(UPPER) : UPPER
    charset += s
    required.push(s)
  }
  if (lowercase) {
    const s = excludeAmbiguous ? stripAmbiguous(LOWER) : LOWER
    charset += s
    required.push(s)
  }
  if (numbers) {
    const s = excludeAmbiguous ? stripAmbiguous(NUMBERS) : NUMBERS
    charset += s
    required.push(s)
  }
  if (special) {
    charset += SPECIAL
    required.push(SPECIAL)
  }

  if (!charset) return ""
  if (length <= 0) return ""

  // Guarantee at least one char from each selected set when possible.
  const chars: string[] = []
  for (const set of required) {
    if (chars.length >= length) break
    chars.push(set[secureRandomIndex(set.length)])
  }
  while (chars.length < length) {
    chars.push(charset[secureRandomIndex(charset.length)])
  }

  // Secure shuffle (Fisher-Yates with crypto randoms)
  for (let i = chars.length - 1; i > 0; i--) {
    const j = secureRandomIndex(i + 1)
    ;[chars[i], chars[j]] = [chars[j], chars[i]]
  }

  return chars.join("")
}

function stripAmbiguous(set: string): string {
  return set
    .split("")
    .filter((c) => !AMBIGUOUS.has(c))
    .join("")
}

export function generatePin(length: 4 | 6): string {
  let out = ""
  for (let i = 0; i < length; i++) {
    out += secureRandomIndex(10).toString()
  }
  return out
}
