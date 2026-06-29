import { NextRequest, NextResponse } from "next/server"
import { getFirestore, serverTimestamp, FieldValue } from "firebase-admin/firestore"
import { initializeAdminApp } from "@/lib/firebase/admin"
import { z } from "zod"
import { SyncEvent } from "@/lib/types/v2-vault"

const SyncEventSchema = z.object({
  userId: z.string(),
  timestamp: z.number(),
  action: z.enum(["create", "update", "delete"]),
  itemType: z.enum(["password", "pin", "note"]),
  itemId: z.string(),
  data: z.record(z.any()).optional(),
})

/**
 * POST /api/v2/sync/events
 * Record a sync event (alternative to WebSocket)
 * Used when WebSocket is not available
 */
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("Authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const sessionToken = authHeader.substring(7)
    const body = await request.json()
    const eventData = SyncEventSchema.parse(body)

    const adminApp = initializeAdminApp()
    const db = getFirestore(adminApp)

    // Verify session
    const usersSnapshot = await db.collection("users_v2").get()
    let userEmail: string | null = null

    for (const doc of usersSnapshot.docs) {
      const userData = doc.data()
      if (userData.sessions && userData.sessions[sessionToken]) {
        userEmail = doc.id
        break
      }
    }

    if (!userEmail) {
      return NextResponse.json({ message: "Invalid session" }, { status: 401 })
    }

    // Store sync event
    const syncEvent: SyncEvent = {
      id: `sync_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...eventData,
    }

    await db.collection("sync_events").add({
      ...syncEvent,
      recordedAt: serverTimestamp() as FieldValue,
    })

    return NextResponse.json({ event: syncEvent }, { status: 201 })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ message: "Invalid event data", errors: err.errors }, { status: 400 })
    }

    console.error("[v2] Sync event error:", err)
    return NextResponse.json({ message: "Failed to record sync event" }, { status: 500 })
  }
}

/**
 * GET /api/v2/sync/events
 * Fetch sync events since last sync (polling fallback)
 */
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("Authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const sessionToken = authHeader.substring(7)
    const since = Number(request.nextUrl.searchParams.get("since") || 0)

    const adminApp = initializeAdminApp()
    const db = getFirestore(adminApp)

    // Verify session
    const usersSnapshot = await db.collection("users_v2").get()
    let userId: string | null = null

    for (const doc of usersSnapshot.docs) {
      const userData = doc.data()
      if (userData.sessions && userData.sessions[sessionToken]) {
        userId = userData.userId
        break
      }
    }

    if (!userId) {
      return NextResponse.json({ message: "Invalid session" }, { status: 401 })
    }

    // Fetch recent sync events
    const eventsSnapshot = await db
      .collection("sync_events")
      .where("userId", "==", userId)
      .where("timestamp", ">", since)
      .orderBy("timestamp", "desc")
      .limit(100)
      .get()

    const events = eventsSnapshot.docs.map((doc) => doc.data() as SyncEvent)

    return NextResponse.json({ events, timestamp: Date.now() }, { status: 200 })
  } catch (err) {
    console.error("[v2] Sync fetch error:", err)
    return NextResponse.json({ message: "Failed to fetch sync events" }, { status: 500 })
  }
}
