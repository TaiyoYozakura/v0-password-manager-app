import { NextRequest, NextResponse } from "next/server"
import { getFirestore } from "firebase-admin/firestore"
import { getAuth } from "firebase-admin/auth"
import { initializeAdminApp } from "@/lib/firebase/admin"
import { EncryptedVault } from "@/lib/crypto/v2-encryption"

/**
 * GET /api/v2/vault/fetch
 * Fetch user's encrypted vault from server
 * Requires: Bearer token in Authorization header
 */
export async function GET(request: NextRequest) {
  try {
    // Get session token from Authorization header
    const authHeader = request.headers.get("Authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ message: "Missing or invalid authorization" }, { status: 401 })
    }

    const sessionToken = authHeader.substring(7)

    const adminApp = initializeAdminApp()
    const auth = getAuth(adminApp)
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
        break
      }
    }

    if (!userId) {
      return NextResponse.json({ message: "Invalid session token" }, { status: 401 })
    }

    // Fetch vault for this user
    const vaultDoc = await db.collection("vaults_v2").doc(userId).get()

    if (!vaultDoc.exists()) {
      // Return empty encrypted vault for new users
      return NextResponse.json(
        {
          version: 2,
          algorithm: "XChaCha20-Poly1305",
          keyDerivation: {
            algorithm: "Argon2id",
            memory: 65536,
            time: 3,
            parallelism: 4,
            salt: "",
          },
          encryptedData: "",
          nonce: "",
        } as EncryptedVault,
        { status: 200 },
      )
    }

    const vaultData = vaultDoc.data() as EncryptedVault

    return NextResponse.json(vaultData, { status: 200 })
  } catch (err) {
    console.error("[v2] Fetch vault error:", err)
    return NextResponse.json({ message: "Failed to fetch vault" }, { status: 500 })
  }
}
