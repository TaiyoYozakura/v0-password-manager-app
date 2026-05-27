import * as admin from "firebase-admin"

let adminApp: admin.app.App | null = null

/**
 * Initialize Firebase Admin SDK from environment variables.
 * Requires: FIREBASE_PROJECT_ID, FIREBASE_PRIVATE_KEY, FIREBASE_CLIENT_EMAIL
 */
export function initializeAdminApp(): admin.app.App {
  if (adminApp) return adminApp

  const projectId = process.env.FIREBASE_PROJECT_ID
  const privateKey = process.env.FIREBASE_PRIVATE_KEY
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL

  if (!projectId || !privateKey || !clientEmail) {
    throw new Error(
      "Missing Firebase Admin SDK env vars: FIREBASE_PROJECT_ID, FIREBASE_PRIVATE_KEY, FIREBASE_CLIENT_EMAIL",
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
