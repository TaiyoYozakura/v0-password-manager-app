import { NextRequest, NextResponse } from "next/server"
import { getAuth } from "firebase-admin/auth"
import { getFirestore } from "firebase-admin/firestore"
import { verifyMasterPin } from "@/lib/crypto/bcrypt"
import { initializeAdminApp } from "@/lib/firebase/admin"

// POST /api/auth/verify-master-pin-email
// Verify Master PIN using email + PIN to find and authenticate user
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, masterPin } = body

    if (!email || !masterPin) {
      return NextResponse.json(
        { error: "Missing email or masterPin" },
        { status: 400 },
      )
    }

    // Initialize admin app
    const adminApp = initializeAdminApp()
    const auth = getAuth(adminApp)
    const db = getFirestore(adminApp)

    // Look up user by email
    let userRecord
    try {
      userRecord = await auth.getUserByEmail(email)
    } catch (err) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 },
      )
    }

    const uid = userRecord.uid

    // Get user profile
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

    // If Master PIN not set, deny
    if (!profile.masterPinHash || !profile.masterPinSalt) {
      return NextResponse.json(
        {
          error: `No Master PIN set for this account. Please set it up first or use Google Sign-In.`,
        },
        { status: 403 },
      )
    }

    // Check rate limiting
    if (
      profile.pinLockedUntil &&
      profile.pinLockedUntil > Date.now()
    ) {
      const secondsLeft = Math.ceil(
        (profile.pinLockedUntil - Date.now()) / 1000,
      )
      return NextResponse.json(
        {
          error: `Too many failed attempts. Try again in ${secondsLeft} seconds.`,
        },
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

    // Generate custom Firebase token for client-side auth
    const token = await auth.createCustomToken(uid)

    return NextResponse.json({
      success: true,
      token,
      message: "Master PIN verified",
    })
  } catch (err) {
    console.error("[v0] Master PIN verify error:", err)
    const message = err instanceof Error ? err.message : "Verification failed"
    return NextResponse.json(
      { error: message },
      { status: 500 },
    )
  }
}
