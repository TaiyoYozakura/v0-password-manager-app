import { create } from "zustand"
import { VaultData, PasswordItem, PINItem, NoteItem } from "@/lib/types/v2-vault"
import * as vaultApi from "@/lib/api/v2-vault"

export interface VaultState {
  // Vault data
  vaultData: VaultData | null
  isLoading: boolean
  isSyncing: boolean
  error: string | null
  lastSyncedAt: number | null

  // Actions
  setVaultData: (vaultData: VaultData) => void
  addPassword: (password: Omit<PasswordItem, "id" | "createdAt" | "updatedAt">) => void
  updatePassword: (id: string, updates: Partial<Omit<PasswordItem, "id" | "createdAt">>) => void
  deletePassword: (id: string) => void
  
  addPIN: (pin: Omit<PINItem, "id" | "createdAt" | "updatedAt">) => void
  updatePIN: (id: string, updates: Partial<Omit<PINItem, "id" | "createdAt">>) => void
  deletePIN: (id: string) => void
  
  addNote: (note: Omit<NoteItem, "id" | "createdAt" | "updatedAt">) => void
  updateNote: (id: string, updates: Partial<Omit<NoteItem, "id" | "createdAt">>) => void
  deleteNote: (id: string) => void
  
  setLoading: (loading: boolean) => void
  setSyncing: (syncing: boolean) => void
  setError: (error: string | null) => void
  clearVault: () => void
}

/**
 * Global vault store using Zustand
 * Manages all vault data operations and sync state
 */
export const useVaultStore = create<VaultState>((set) => ({
  vaultData: null,
  isLoading: false,
  isSyncing: false,
  error: null,
  lastSyncedAt: null,

  setVaultData: (vaultData: VaultData) =>
    set({
      vaultData,
      lastSyncedAt: vaultData.lastSyncedAt,
      error: null,
    }),

  addPassword: (password: Omit<PasswordItem, "id" | "createdAt" | "updatedAt">) =>
    set((state) => {
      if (!state.vaultData) return state
      return {
        vaultData: vaultApi.createPassword(state.vaultData, password),
      }
    }),

  updatePassword: (id: string, updates: Partial<Omit<PasswordItem, "id" | "createdAt">>) =>
    set((state) => {
      if (!state.vaultData) return state
      return {
        vaultData: vaultApi.updatePassword(state.vaultData, id, updates),
      }
    }),

  deletePassword: (id: string) =>
    set((state) => {
      if (!state.vaultData) return state
      return {
        vaultData: vaultApi.deletePassword(state.vaultData, id),
      }
    }),

  addPIN: (pin: Omit<PINItem, "id" | "createdAt" | "updatedAt">) =>
    set((state) => {
      if (!state.vaultData) return state
      return {
        vaultData: vaultApi.createPIN(state.vaultData, pin),
      }
    }),

  updatePIN: (id: string, updates: Partial<Omit<PINItem, "id" | "createdAt">>) =>
    set((state) => {
      if (!state.vaultData) return state
      return {
        vaultData: vaultApi.updatePIN(state.vaultData, id, updates),
      }
    }),

  deletePIN: (id: string) =>
    set((state) => {
      if (!state.vaultData) return state
      return {
        vaultData: vaultApi.deletePIN(state.vaultData, id),
      }
    }),

  addNote: (note: Omit<NoteItem, "id" | "createdAt" | "updatedAt">) =>
    set((state) => {
      if (!state.vaultData) return state
      return {
        vaultData: vaultApi.createNote(state.vaultData, note),
      }
    }),

  updateNote: (id: string, updates: Partial<Omit<NoteItem, "id" | "createdAt">>) =>
    set((state) => {
      if (!state.vaultData) return state
      return {
        vaultData: vaultApi.updateNote(state.vaultData, id, updates),
      }
    }),

  deleteNote: (id: string) =>
    set((state) => {
      if (!state.vaultData) return state
      return {
        vaultData: vaultApi.deleteNote(state.vaultData, id),
      }
    }),

  setLoading: (loading: boolean) => set({ isLoading: loading }),

  setSyncing: (syncing: boolean) => set({ isSyncing: syncing }),

  setError: (error: string | null) => set({ error }),

  clearVault: () =>
    set({
      vaultData: null,
      isLoading: false,
      isSyncing: false,
      error: null,
      lastSyncedAt: null,
    }),
}))
