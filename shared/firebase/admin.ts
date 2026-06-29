import * as admin from "firebase-admin"

let adminApp: admin.app.App | null = null

/**
 * Initialize Firebase Admin SDK from environment variables.
 * Requires: FIREBASE_PROJECT_ID, FIREBASE_PRIVATE_KEY, FIREBASE_CLIENT_EMAIL
 */
export function initializeAdminApp(): admin.app.App {
  if (adminApp) return adminApp

  // Use public project ID if private one isn't set
  const projectId = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
  const privateKey = process.env.FIREBASE_PRIVATE_KEY
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL

  console.log("[v0] Admin SDK init - projectId:", projectId ? "✓ present" : "✗ missing")
  console.log("[v0] Admin SDK init - privateKey:", privateKey ? "✓ present" : "✗ missing")
  console.log("[v0] Admin SDK init - clientEmail:", clientEmail ? "✓ present" : "✗ missing")
  console.log("[v0] All env vars:", Object.keys(process.env).filter(k => k.includes("FIREBASE")).sort())

  if (!projectId || !privateKey || !clientEmail) {
    throw new Error(
      "Missing Firebase Admin SDK env vars: FIREBASE_PRIVATE_KEY and FIREBASE_CLIENT_EMAIL are required",
    )
  }

  adminApp = admin.initializeApp({
    credential: admin.credential.cert({
      projectId,
      privateKey: privateKey.replace(/\\n/g, "\n"),
      clientEmail,
    }),
  })

  return adminApp
}
