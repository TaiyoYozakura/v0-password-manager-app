import type { DecryptedPasswordEntry, DecryptedPinEntry } from "../types"

export interface DuplicatePasswordGroup {
  key: string
  entries: DecryptedPasswordEntry[]
  count: number
}

export interface DuplicatePinGroup {
  key: string
  entries: DecryptedPinEntry[]
  count: number
}

/**
 * Find duplicate passwords based on email/username and password
 * Exact match: same email/username AND same password
 */
export function findDuplicatePasswords(
  passwords: DecryptedPasswordEntry[],
): DuplicatePasswordGroup[] {
  const grouped = new Map<string, DecryptedPasswordEntry[]>()

  for (const p of passwords) {
    // Use email as primary, fallback to username
    const account = (p.email || p.username).toLowerCase().trim()
    const pwd = p.password.toLowerCase().trim()
    const key = `${account}:${pwd}`

    if (!grouped.has(key)) {
      grouped.set(key, [])
    }
    grouped.get(key)!.push(p)
  }

  // Return only groups with duplicates (count > 1), sorted by count descending
  return Array.from(grouped.entries())
    .filter(([, entries]) => entries.length > 1)
    .map(([key, entries]) => ({
      key,
      entries: entries.sort((a, b) => {
        // Sort newest first
        const aTime = a.createdAt?.getTime() || 0
        const bTime = b.createdAt?.getTime() || 0
        return bTime - aTime
      }),
      count: entries.length,
    }))
    .sort((a, b) => b.count - a.count)
}

/**
 * Find duplicate PINs based on PIN value
 * Exact match: same pin value
 */
export function findDuplicatePins(pins: DecryptedPinEntry[]): DuplicatePinGroup[] {
  const grouped = new Map<string, DecryptedPinEntry[]>()

  for (const pin of pins) {
    const key = pin.pin.trim()

    if (!grouped.has(key)) {
      grouped.set(key, [])
    }
    grouped.get(key)!.push(pin)
  }

  // Return only groups with duplicates (count > 1), sorted by count descending
  return Array.from(grouped.entries())
    .filter(([, entries]) => entries.length > 1)
    .map(([key, entries]) => ({
      key,
      entries: entries.sort((a, b) => {
        // Sort newest first
        const aTime = a.createdAt?.getTime() || 0
        const bTime = b.createdAt?.getTime() || 0
        return bTime - aTime
      }),
      count: entries.length,
    }))
    .sort((a, b) => b.count - a.count)
}

/**
 * Get total count of duplicates
 */
export function getDuplicateCounts(
  passwords: DecryptedPasswordEntry[],
  pins: DecryptedPinEntry[],
) {
  const pwdDupes = findDuplicatePasswords(passwords)
  const pinDupes = findDuplicatePins(pins)

  const totalPasswordDuplicates = pwdDupes.reduce((sum, g) => sum + (g.count - 1), 0)
  const totalPinDuplicates = pinDupes.reduce((sum, g) => sum + (g.count - 1), 0)

  return {
    passwordGroupCount: pwdDupes.length,
    totalPasswordDuplicates,
    pinGroupCount: pinDupes.length,
    totalPinDuplicates,
    hasAnyDuplicates: totalPasswordDuplicates > 0 || totalPinDuplicates > 0,
  }
}
