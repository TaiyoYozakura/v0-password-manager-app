import { create } from 'zustand'
import AsyncStorage from '@react-native-async-storage/async-storage'
import type { DecryptedPasswordEntry, PinEntry, Note } from '../types'

interface VaultState {
  passwords: DecryptedPasswordEntry[]
  pins: PinEntry[]
  notes: Note[]
  searchQuery: string
  selectedTag: string | null
  isLoading: boolean
  error: string | null

  setPasswords: (passwords: DecryptedPasswordEntry[]) => void
  addPassword: (password: DecryptedPasswordEntry) => void
  updatePassword: (id: string, password: DecryptedPasswordEntry) => void
  deletePassword: (id: string) => void

  setPins: (pins: PinEntry[]) => void
  addPin: (pin: PinEntry) => void
  deletePin: (id: string) => void

  setSearchQuery: (query: string) => void
  setSelectedTag: (tag: string | null) => void
  setIsLoading: (loading: boolean) => void
  setError: (error: string | null) => void

  getFilteredPasswords: () => DecryptedPasswordEntry[]
  clearVault: () => void
}

export const useVaultStore = create<VaultState>((set, get) => ({
  passwords: [],
  pins: [],
  notes: [],
  searchQuery: '',
  selectedTag: null,
  isLoading: false,
  error: null,

  setPasswords: (passwords) =>
    set({
      passwords,
    }),

  addPassword: (password) =>
    set((state) => ({
      passwords: [password, ...state.passwords],
    })),

  updatePassword: (id, password) =>
    set((state) => ({
      passwords: state.passwords.map((p) => (p.id === id ? password : p)),
    })),

  deletePassword: (id) =>
    set((state) => ({
      passwords: state.passwords.filter((p) => p.id !== id),
    })),

  setPins: (pins) =>
    set({
      pins,
    }),

  addPin: (pin) =>
    set((state) => ({
      pins: [pin, ...state.pins],
    })),

  deletePin: (id) =>
    set((state) => ({
      pins: state.pins.filter((p) => p.id !== id),
    })),

  setSearchQuery: (query) =>
    set({
      searchQuery: query,
    }),

  setSelectedTag: (tag) =>
    set({
      selectedTag: tag,
    }),

  setIsLoading: (loading) =>
    set({
      isLoading: loading,
    }),

  setError: (error) =>
    set({
      error,
    }),

  getFilteredPasswords: () => {
    const state = get()
    let filtered = state.passwords

    // Filter by search query (name, username, email, notes)
    if (state.searchQuery.trim()) {
      const query = state.searchQuery.toLowerCase()
      filtered = filtered.filter(
        (p) =>
          p.siteName.toLowerCase().includes(query) ||
          p.username?.toLowerCase().includes(query) ||
          p.email?.toLowerCase().includes(query) ||
          p.notes?.toLowerCase().includes(query),
      )
    }

    // Filter by tag
    if (state.selectedTag) {
      filtered = filtered.filter((p) => p.tag === state.selectedTag)
    }

    return filtered
  },

  clearVault: () =>
    set({
      passwords: [],
      pins: [],
      notes: [],
      searchQuery: '',
      selectedTag: null,
    }),
}))
