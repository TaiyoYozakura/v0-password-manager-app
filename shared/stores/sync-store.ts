import { create } from "zustand"
import { SyncEvent } from "@/lib/types/v2-vault"
import { WebSocketSyncClient, SyncClient } from "@/lib/api/v2-sync"

export interface SyncState {
  // Sync client and status
  syncClient: SyncClient | null
  isConnected: boolean
  syncStatus: "synced" | "syncing" | "error" | "disconnected"
  lastSyncedAt: number | null
  pendingChanges: number

  // Sync history
  syncEvents: SyncEvent[]
  error: string | null

  // Actions
  initializeSync: (sessionToken: string, userId: string) => Promise<void>
  disconnect: () => void
  recordEvent: (event: SyncEvent) => void
  setSyncStatus: (status: "synced" | "syncing" | "error" | "disconnected") => void
  setError: (error: string | null) => void
  clearHistory: () => void
}

/**
 * Global sync state store using Zustand
 * Manages real-time sync client and status
 */
export const useSyncStore = create<SyncState>((set, get) => ({
  syncClient: null,
  isConnected: false,
  syncStatus: "disconnected",
  lastSyncedAt: null,
  pendingChanges: 0,
  syncEvents: [],
  error: null,

  initializeSync: async (sessionToken: string, userId: string) => {
    try {
      set({ syncStatus: "syncing" })

      const client = new WebSocketSyncClient()

      // Set up event listener
      client.onEvent((event) => {
        set((state) => ({
          syncEvents: [...state.syncEvents, event],
          lastSyncedAt: Date.now(),
        }))
      })

      // Set up status listener
      client.onStatusChange((status) => {
        set({ syncStatus: status })
      })

      await client.connect(sessionToken, userId)

      set({
        syncClient: client,
        isConnected: true,
        syncStatus: "synced",
        error: null,
      })
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to initialize sync"
      console.error("[v2] Sync initialization error:", err)
      set({
        syncStatus: "error",
        error: message,
      })
      throw err
    }
  },

  disconnect: () => {
    const { syncClient } = get()
    if (syncClient) {
      syncClient.disconnect()
    }
    set({
      syncClient: null,
      isConnected: false,
      syncStatus: "disconnected",
      error: null,
    })
  },

  recordEvent: (event: SyncEvent) => {
    const { syncClient } = get()
    if (syncClient && syncClient.isConnected()) {
      syncClient.send(event)
    }
    set((state) => ({
      syncEvents: [...state.syncEvents, event],
      pendingChanges: state.pendingChanges + 1,
    }))
  },

  setSyncStatus: (status: "synced" | "syncing" | "error" | "disconnected") => {
    if (status === "synced") {
      set({ syncStatus: status, pendingChanges: 0, lastSyncedAt: Date.now() })
    } else {
      set({ syncStatus: status })
    }
  },

  setError: (error: string | null) => set({ error }),

  clearHistory: () => set({ syncEvents: [] }),
}))
