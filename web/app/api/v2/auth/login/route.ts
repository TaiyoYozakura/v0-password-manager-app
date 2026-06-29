import { NextRequest, NextResponse } from "next/server"
import { getFirestore } from "firebase-admin/firestore"
import { getAuth } from "firebase-admin/auth"
import { initializeAdminApp } from "@/lib/firebase/admin"
import { z } from "zod"
import { nanoid } from "nanoid"

const LoginSchema = z.object({
  email: z.string().email(),
  masterPasswordHash: z.string().min(20),
})

/**
 * POST /api/v2/auth/login
 * Authenticate user and create session
 * Expects: email, masterPasswordHash (hash of master password)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, masterPasswordHash } = LoginSchema.parse(body)

    const adminApp = initializeAdminApp()
    const auth = getAuth(adminApp)
    const db = getFirestore(adminApp)

    // Find user by email
    const userDoc = await db.collection("users_v2").doc(email).get()
    if (!userDoc.exists()) {
      return NextResponse.json(
        { message: "Invalid email or password" },
        { status: 401 },
      )
    }

    const userData = userDoc.data()

    // Verify master password hash matches
    if (userData.masterPasswordHash !== masterPasswordHash) {
      return NextResponse.json(
        { message: "Invalid email or password" },
        { status: 401 },
      )
    }

    const userId = userData.userId
    const deviceId = nanoid(12)
    const sessionToken = nanoid(32)

    // Add new device and session
    const expiresAt = Date.now() + 24 * 60 * 60 * 1000 // 24 hours
    await db.collection("users_v2").doc(email).update({
      [`devices.${deviceId}`]: {
        createdAt: Date.now(),
        name: "Web Browser",
        isActive: true,
      },
      [`sessions.${sessionToken}`]: {
        deviceId,
        createdAt: Date.now(),
        expiresAt,
        isActive: true,
      },
      updatedAt: Date.now(),
    })

    // Generate custom Firebase token for this session
    const firebaseToken = await auth.createCustomToken(userId)

    return NextResponse.json(
      {
        userId,
        deviceId,
        sessionToken,
        firebaseToken,
      },
      { status: 200 },
    )
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ message: "Invalid input", errors: err.errors }, { status: 400 })
    }

    console.error("[v2] Login error:", err)
    return NextResponse.json(
      { message: "Login failed" },
      { status: 500 },
    )
  }
}
