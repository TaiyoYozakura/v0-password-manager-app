import * as Crypto from "expo-crypto"

export type PasswordOptions = {
  length: number
  lowercase: boolean
  uppercase: boolean
  numbers: boolean
  symbols: boolean
  excludeSimilar: boolean
}

const SIMILAR = /[O0Il1|`'"\u00B7\u02BC]/g

function randomInt(maxExclusive: number) {
  if (maxExclusive <= 0) return 0
  const max = 0xffffffff
  const limit = max - (max % maxExclusive)
  while (true) {
    const bytes = Crypto.getRandomBytes(4)
    const n =
      ((bytes[0] << 24) | (bytes[1] << 16) | (bytes[2] << 8) | bytes[3]) >>> 0
    if (n < limit) return n % maxExclusive
  }
}

export function generatePassword(opts: PasswordOptions): string {
  let charset = ""
  if (opts.lowercase) charset += "abcdefghijklmnopqrstuvwxyz"
  if (opts.uppercase) charset += "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
  if (opts.numbers) charset += "0123456789"
  if (opts.symbols) charset += "!@#$%^&*()-_=+[]{};:,.<>/?"
  if (opts.excludeSimilar) charset = charset.replace(SIMILAR, "")
  if (!charset) return ""
  const out: string[] = []
  for (let i = 0; i < opts.length; i++) {
    out.push(charset[randomInt(charset.length)])
  }
  return out.join("")
}

export type PinOptions = {
  length: number
  noRepeating: boolean
}

export function generatePin(opts: PinOptions): string {
  const digits = "0123456789".split("")
  if (opts.noRepeating && opts.length <= 10) {
    const pool = [...digits]
    const out: string[] = []
    for (let i = 0; i < opts.length; i++) {
      const idx = randomInt(pool.length)
      out.push(pool.splice(idx, 1)[0])
    }
    return out.join("")
  }
  let prev = ""
  const out: string[] = []
  for (let i = 0; i < opts.length; i++) {
    let next = digits[randomInt(10)]
    if (opts.noRepeating) {
      while (next === prev) next = digits[randomInt(10)]
    }
    prev = next
    out.push(next)
  }
  return out.join("")
}
