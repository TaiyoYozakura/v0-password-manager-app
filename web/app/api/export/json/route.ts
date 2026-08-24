import { NextRequest, NextResponse } from "next/server"
import { getAuth } from "firebase-admin/auth"
import { getFirestore } from "firebase-admin/firestore"
import { verifyMasterPin } from "@/lib/crypto/bcrypt"
import { decryptString, deriveKey } from "@/lib/crypto/encryption"
import { initializeAdminApp } from "@/lib/firebase/admin"

// POST /api/export/json
// Requires Master PIN verification. Returns unencrypted passwords as JSON.
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { idToken, masterPin } = body

    if (!idToken || !masterPin) {
      return NextResponse.json(
        { error: "Missing idToken or masterPin" },
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
      // Record failed attempt
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

    // Fetch encrypted passwords and PINs
    const passwordsSnap = await db
      .collection("users")
      .doc(uid)
      .collection("passwords")
      .get()

    const pinsSnap = await db
      .collection("users")
      .doc(uid)
      .collection("pins")
      .get()

    // Since we can't decrypt server-side (no encryption key), return raw docs
    // Client must decrypt with the encryption key
    const passwords = passwordsSnap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))

    const pins = pinsSnap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))

    // Return encrypted export
    const exportData = {
      version: 1,
      exportedAt: new Date().toISOString(),
      passwords,
      pins,
    }

    return NextResponse.json(exportData)
  } catch (err) {
    console.error("[v0] Export JSON error:", err)
    const message = err instanceof Error ? err.message : "Export failed"
    return NextResponse.json(
      { error: message },
      { status: 500 },
    )
  }
}
