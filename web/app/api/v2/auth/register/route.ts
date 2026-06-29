import { NextRequest, NextResponse } from "next/server"
import { getFirestore } from "firebase-admin/firestore"
import { getAuth } from "firebase-admin/auth"
import { initializeAdminApp } from "@/lib/firebase/admin"
import { z } from "zod"
import { nanoid } from "nanoid"

const RegisterSchema = z.object({
  email: z.string().email(),
  masterPasswordHash: z.string().min(20), // Should be a hash
})

/**
 * POST /api/v2/auth/register
 * Register a new user account
 * Expects: email, masterPasswordHash (never the password itself)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input
    const { email, masterPasswordHash } = RegisterSchema.parse(body)

    const adminApp = initializeAdminApp()
    const auth = getAuth(adminApp)
    const db = getFirestore(adminApp)

    // Check if user already exists
    const existingUser = await db.collection("users_v2").doc(email).get()
    if (existingUser.exists()) {
      return NextResponse.json({ message: "User already exists" }, { status: 409 })
    }

    // Create Firebase Auth user (no password, we'll use custom auth token)
    const userRecord = await auth.createUser({
      email,
      emailVerified: false,
    })

    const userId = userRecord.uid
    const deviceId = nanoid(12)
    const sessionToken = nanoid(32)

    // Store user in v2 collection (no password, only hash for verification)
    await db.collection("users_v2").doc(email).set({
      userId,
      email,
      masterPasswordHash, // Store hash for login verification
      devices: {
        [deviceId]: {
          createdAt: Date.now(),
          name: "Web Browser",
          isActive: true,
        },
      },
      sessions: {
        [sessionToken]: {
          deviceId,
          createdAt: Date.now(),
          expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
          isActive: true,
        },
      },
      createdAt: Date.now(),
      updatedAt: Date.now(),
    })

    return NextResponse.json(
      {
        userId,
        deviceId,
        sessionToken,
      },
      { status: 201 },
    )
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ message: "Invalid input", errors: err.errors }, { status: 400 })
    }

    console.error("[v2] Registration error:", err)
    return NextResponse.json(
      { message: "Registration failed" },
      { status: 500 },
    )
  }
}
