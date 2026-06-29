import { NextRequest, NextResponse } from "next/server"
import { getFirestore, FieldValue, serverTimestamp } from "firebase-admin/firestore"
import { initializeAdminApp } from "@/lib/firebase/admin"
import { z } from "zod"
import { EncryptedVault } from "@/lib/crypto/v2-encryption"

const EncryptedVaultSchema = z.object({
  version: z.literal(2),
  algorithm: z.literal("XChaCha20-Poly1305"),
  keyDerivation: z.object({
    algorithm: z.literal("Argon2id"),
    memory: z.number(),
    time: z.number(),
    parallelism: z.number(),
    salt: z.string(),
  }),
  encryptedData: z.string(),
  nonce: z.string(),
})

/**
 * POST /api/v2/vault/save
 * Save encrypted vault to server
 * Requires: Bearer token in Authorization header
 */
export async function POST(request: NextRequest) {
  try {
    // Get session token from Authorization header
    const authHeader = request.headers.get("Authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ message: "Missing or invalid authorization" }, { status: 401 })
    }

    const sessionToken = authHeader.substring(7)

    const body = await request.json()
    const encryptedVault = EncryptedVaultSchema.parse(body)

    const adminApp = initializeAdminApp()
    const db = getFirestore(adminApp)

    // Find user by session token
    const usersSnapshot = await db.collection("users_v2").get()
    let userId: string | null = null
    let userEmail: string | null = null

    for (const doc of usersSnapshot.docs) {
      const userData = doc.data()
      if (userData.sessions && userData.sessions[sessionToken]) {
        userId = userData.userId
        userEmail = doc.id

        // Check if session is still active
        const session = userData.sessions[sessionToken]
        if (session.expiresAt < Date.now()) {
          return NextResponse.json({ message: "Session expired" }, { status: 401 })
        }

        break
      }
    }

    if (!userId) {
      return NextResponse.json({ message: "Invalid session token" }, { status: 401 })
    }

    // Save encrypted vault
    await db.collection("vaults_v2").doc(userId).set(
      {
        ...encryptedVault,
        userId,
        savedAt: serverTimestamp() as FieldValue,
        deviceId: "web", // Track which device last saved
      },
      { merge: true },
    )

    // Update user's lastSyncedAt
    await db.collection("users_v2").doc(userEmail).update({
      [`sessions.${sessionToken}.lastSyncedAt`]: Date.now(),
      updatedAt: serverTimestamp() as FieldValue,
    })

    return NextResponse.json({ message: "Vault saved successfully" }, { status: 200 })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ message: "Invalid vault format", errors: err.errors }, { status: 400 })
    }

    console.error("[v2] Save vault error:", err)
    return NextResponse.json({ message: "Failed to save vault" }, { status: 500 })
  }
}
