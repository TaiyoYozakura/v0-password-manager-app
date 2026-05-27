import { NextRequest, NextResponse } from "next/server"
import { getAuth } from "firebase-admin/auth"
import { getFirestore } from "firebase-admin/firestore"
import { verifyMasterPin } from "@/lib/crypto/bcrypt"
import { decryptPassword } from "@/lib/crypto/encryption"
import { initializeAdminApp } from "@/lib/firebase/admin"

// POST /api/export/txt
// Requires Master PIN verification and encryption key.
// Returns plaintext CSV: site,email/username,password
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { idToken, masterPin, encryptionKey } = body

    if (!idToken || !masterPin || !encryptionKey) {
      return NextResponse.json(
        { error: "Missing idToken, masterPin, or encryptionKey" },
        { status: 400 },
      )
    }

    // Verify Firebase ID token
    const adminApp = initializeAdminApp()
    const auth = getAuth(adminApp)
    const decodedToken = await auth.verifyIdToken(idToken)
    const uid = decodedToken.uid

    // Get user profile and verify Master PIN
    const db = getFirestore(adminApp)
    const profileSnap = await db
      .collection("users")
      .doc(uid)
      .collection("profile")
      .doc("app")
      .get()

    if (!profileSnap.exists()) {
      return NextResponse.json(
        { error: "User profile not found" },
        { status: 404 },
      )
    }

    const profile = profileSnap.data()
    if (!profile.masterPinHash || !profile.masterPinSalt) {
      return NextResponse.json(
        { error: "Master PIN not set up" },
        { status: 403 },
      )
    }

    // Check rate limiting
    if (
      profile.pinLockedUntil &&
      profile.pinLockedUntil > Date.now()
    ) {
      return NextResponse.json(
        { error: "Too many failed attempts. Try again later." },
        { status: 429 },
      )
    }

    // Verify Master PIN
    const pinValid = verifyMasterPin(
      masterPin,
      profile.masterPinHash,
      profile.masterPinSalt,
    )

    if (!pinValid) {
      const newAttempts = (profile.failedPinAttempts ?? 0) + 1
      const isLocked = newAttempts >= 3
      const updateData: Record<string, any> = {
        failedPinAttempts: newAttempts,
      }
      if (isLocked) {
        updateData.pinLockedUntil = Date.now() + 15 * 60 * 1000
      }
      await profileSnap.ref.update(updateData)

      return NextResponse.json(
        { error: "Invalid Master PIN" },
        { status: 401 },
      )
    }

    // Reset attempts on success
    await profileSnap.ref.update({
      failedPinAttempts: 0,
      pinLockedUntil: null,
    })

    // Fetch encrypted passwords
    const passwordsSnap = await db
      .collection("users")
      .doc(uid)
      .collection("passwords")
      .get()

    // Decrypt on server-side (since we have the key) and generate CSV
    const csvLines = [
      "Site Name,Site URL,Email/Username,Password",
    ]

    for (const doc of passwordsSnap.docs) {
      const data = doc.data()
      try {
        const decrypted = decryptPassword(
          data.encryptedEmail,
          data.encryptedUsername,
          data.encryptedPassword,
          encryptionKey,
          data.integrityHash,
        )

        const siteName = data.siteName || ""
        const siteUrl = data.siteUrl || ""
        const account = decrypted.email || decrypted.username || ""
        const password = decrypted.password || ""

        // CSV escape
        const escape = (s: string) => {
          if (s.includes(",") || s.includes('"') || s.includes("\n")) {
            return `"${s.replace(/"/g, '""')}"`
          }
          return s
        }

        csvLines.push(
          `${escape(siteName)},${escape(siteUrl)},${escape(account)},${escape(password)}`,
        )
      } catch (err) {
        console.error("[v0] Decryption error for password:", doc.id, err)
        // Skip if decryption fails
      }
    }

    const csv = csvLines.join("\n")
    const filename = `vaultly-export-${new Date().toISOString().split("T")[0]}.csv`

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Type": "text/csv;charset=utf-8",
      },
    })
  } catch (err) {
    console.error("[v0] Export TXT error:", err)
    const message = err instanceof Error ? err.message : "Export failed"
    return NextResponse.json(
      { error: message },
      { status: 500 },
    )
  }
}
