import { SyncEvent } from "@/lib/types/v2-vault"
import { z } from "zod"

/**
 * Real-time sync service for v2 password manager
 * Handles WebSocket connections and sync events
 */

const WS_BASE = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:3000"

export type SyncEventMessage = {
  type: "sync_event"
  event: SyncEvent
}

export type SyncStatusMessage = {
  type: "sync_status"
  status: "synced" | "syncing" | "error"
  timestamp: number
}

export type SyncMessage = SyncEventMessage | SyncStatusMessage

export interface SyncClient {
  connect(sessionToken: string, userId: string): Promise<void>
  disconnect(): void>
  send(event: SyncEvent): void
  onEvent(callback: (event: SyncEvent) => void): void
  onStatusChange(callback: (status: "synced" | "syncing" | "error") => void): void
  isConnected(): boolean
}

/**
 * WebSocket-based sync client for real-time vault synchronization
 */
export class WebSocketSyncClient implements SyncClient {
  private ws: WebSocket | null = null
  private eventCallbacks: ((event: SyncEvent) => void)[] = []
  private statusCallbacks: ((status: "synced" | "syncing" | "error") => void)[] = []
  private messageQueue: SyncEvent[] = []
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 1000

  async connect(sessionToken: string, userId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const url = `${WS_BASE}/api/v2/sync?token=${encodeURIComponent(sessionToken)}&userId=${encodeURIComponent(userId)}`
        this.ws = new WebSocket(url)

        this.ws.onopen = () => {
          console.log("[v2] WebSocket connected")
          this.reconnectAttempts = 0
          
          // Send queued messages
          this.messageQueue.forEach((event) => this.send(event))
          this.messageQueue = []
          
          this.emitStatus("synced")
          resolve()
        }

        this.ws.onmessage = (event) => {
          try {
            const message: SyncMessage = JSON.parse(event.data)
            
            if (message.type === "sync_event") {
              this.eventCallbacks.forEach((cb) => cb(message.event))
            } else if (message.type === "sync_status") {
              this.emitStatus(message.status)
            }
          } catch (err) {
            console.error("[v2] Failed to parse sync message:", err)
          }
        }

        this.ws.onerror = (error) => {
          console.error("[v2] WebSocket error:", error)
          this.emitStatus("error")
          reject(error)
        }

        this.ws.onclose = () => {
          console.log("[v2] WebSocket disconnected")
          this.ws = null
          this.attemptReconnect(sessionToken, userId)
        }
      } catch (err) {
        console.error("[v2] Failed to create WebSocket:", err)
        reject(err)
      }
    })
  }

  private attemptReconnect(sessionToken: string, userId: string): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error("[v2] Max reconnection attempts reached")
      this.emitStatus("error")
      return
    }

    this.reconnectAttempts++
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1)
    
    console.log(`[v2] Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts})`)
    
    setTimeout(() => {
      this.connect(sessionToken, userId).catch((err) => {
        console.error("[v2] Reconnection failed:", err)
      })
    }, delay)
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
  }

  send(event: SyncEvent): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.warn("[v2] WebSocket not connected, queueing event")
      this.messageQueue.push(event)
      return
    }

    try {
      const message: SyncEventMessage = {
        type: "sync_event",
        event,
      }
      this.ws.send(JSON.stringify(message))
    } catch (err) {
      console.error("[v2] Failed to send sync event:", err)
      this.messageQueue.push(event)
    }
  }

  onEvent(callback: (event: SyncEvent) => void): void {
    this.eventCallbacks.push(callback)
  }

  onStatusChange(callback: (status: "synced" | "syncing" | "error") => void): void {
    this.statusCallbacks.push(callback)
  }

  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN
  }

  private emitStatus(status: "synced" | "syncing" | "error"): void {
    this.statusCallbacks.forEach((cb) => cb(status))
  }
}

/**
 * Create sync events from vault operations
 */
export function createSyncEvent(
  userId: string,
  action: "create" | "update" | "delete",
  itemType: "password" | "pin" | "note",
  itemId: string,
  data?: Record<string, any>,
): SyncEvent {
  return {
    id: `sync_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    userId,
    timestamp: Date.now(),
    action,
    itemType,
    itemId,
    data,
  }
}
