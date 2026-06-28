import { SessionSchema, Session } from "@/lib/types/v2-vault"
import { deriveKeyV2, hashForVerification } from "@/lib/crypto/v2-encryption"

/**
 * Auth API Service for v2 password manager
 * Handles registration, login, and session management
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"

export interface RegisterRequest {
  email: string
  masterPassword: string
}

export interface RegisterResponse {
  userId: string
  sessionToken: string
  deviceId: string
}

export interface LoginRequest {
  email: string
  masterPassword: string
}

export interface LoginResponse {
  userId: string
  sessionToken: string
  deviceId: string
  encryptedVault?: string // Client will decrypt this
}

export interface SessionResponse {
  isValid: boolean
  session?: Session
}

/**
 * Register a new account
 * Frontend derives key from master password, backend stores only the hash
 */
export async function registerV2(req: RegisterRequest): Promise<RegisterResponse> {
  try {
    // Derive key client-side (never send master password to backend)
    const encryptionKey = await deriveKeyV2(req.masterPassword)
    const masterPasswordHash = hashForVerification(req.masterPassword)

    const response = await fetch(`${API_BASE}/api/v2/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: req.email,
        masterPasswordHash, // Only the hash, never the password
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Registration failed")
    }

    const data = await response.json()
    return data
  } catch (err) {
    console.error("[v2] Registration error:", err)
    throw err
  }
}

/**
 * Login to existing account
 * Derives encryption key client-side for vault decryption
 */
export async function loginV2(req: LoginRequest): Promise<LoginResponse> {
  try {
    const encryptionKey = await deriveKeyV2(req.masterPassword)
    const masterPasswordHash = hashForVerification(req.masterPassword)

    const response = await fetch(`${API_BASE}/api/v2/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: req.email,
        masterPasswordHash,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Login failed")
    }

    const data = await response.json()
    return data
  } catch (err) {
    console.error("[v2] Login error:", err)
    throw err
  }
}

/**
 * Verify current session is still valid
 */
export async function verifySessionV2(sessionToken: string): Promise<SessionResponse> {
  try {
    const response = await fetch(`${API_BASE}/api/v2/auth/verify`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${sessionToken}`,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      return { isValid: false }
    }

    const session = await response.json()
    return { isValid: true, session }
  } catch (err) {
    console.error("[v2] Session verification error:", err)
    return { isValid: false }
  }
}

/**
 * Logout and invalidate session
 */
export async function logoutV2(sessionToken: string): Promise<void> {
  try {
    await fetch(`${API_BASE}/api/v2/auth/logout`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${sessionToken}`,
        "Content-Type": "application/json",
      },
    })
  } catch (err) {
    console.error("[v2] Logout error:", err)
    // Don't throw, user is logging out anyway
  }
}

/**
 * Refresh session token
 */
export async function refreshSessionV2(sessionToken: string): Promise<{ sessionToken: string }> {
  try {
    const response = await fetch(`${API_BASE}/api/v2/auth/refresh`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${sessionToken}`,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error("Token refresh failed")
    }

    const data = await response.json()
    return data
  } catch (err) {
    console.error("[v2] Token refresh error:", err)
    throw err
  }
}
