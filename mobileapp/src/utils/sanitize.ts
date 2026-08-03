export const LIMITS = {
  password: 512,
  notes: 1000,
  tag: 50,
  username: 100,
  url: 300,
  siteName: 100,
  email: 254,
  label: 100,
  category: 50,
}

/** Trim whitespace and cap length. Returns a safe string. */
export function sanitizeText(input: unknown, maxLen: number): string {
  if (typeof input !== "string") return ""
  return input.trim().slice(0, maxLen)
}

/** Sanitize without trimming trailing/leading whitespace (for passwords/PINs). */
export function sanitizeSecret(input: unknown, maxLen: number): string {
  if (typeof input !== "string") return ""
  return input.slice(0, maxLen)
}

export function isValidUrl(url: string): boolean {
  if (!url) return false
  try {
    const u = new URL(url.startsWith("http") ? url : `https://${url}`)
    return Boolean(u.hostname) && u.hostname.includes(".")
  } catch {
    return false
  }
}

export function normalizeUrl(url: string): string {
  if (!url) return ""
  try {
    const u = new URL(url.startsWith("http") ? url : `https://${url}`)
    return u.toString()
  } catch {
    return url
  }
}

export function getHostname(url: string): string {
  try {
    const u = new URL(url.startsWith("http") ? url : `https://${url}`)
    return u.hostname
  } catch {
    return ""
  }
}

/** Simple HTML escape for any dynamic rendering that bypasses React escaping. */
export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}
