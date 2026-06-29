import { create } from "zustand"
import { SearchResult, SearchOptions, globalSearch, searchByTag } from "@/lib/api/v2-search"
import { VaultData } from "@/lib/types/v2-vault"

export interface SearchState {
  // Search state
  query: string
  results: SearchResult[]
  isSearching: boolean
  selectedIndex: number
  filters: SearchOptions

  // Actions
  setQuery: (query: string, vaultData: VaultData | null) => void
  setFilters: (filters: SearchOptions) => void
  search: (query: string, vaultData: VaultData) => void
  searchByTag: (tag: string, vaultData: VaultData) => void
  selectResult: (index: number) => void
  clearResults: () => void
}

/**
 * Global search state store using Zustand
 * Manages search queries, results, and filters
 */
export const useSearchStore = create<SearchState>((set, get) => ({
  query: "",
  results: [],
  isSearching: false,
  selectedIndex: -1,
  filters: {
    limit: 50,
    includePasswords: true,
    includePINs: true,
    includeNotes: true,
    caseSensitive: false,
  },

  setQuery: (query: string, vaultData: VaultData | null) => {
    set({ query, isSearching: true, selectedIndex: -1 })

    if (!vaultData || !query.trim()) {
      set({ results: [], isSearching: false })
      return
    }

    const { filters } = get()
    const results = globalSearch(vaultData, query, filters)

    set({ results, isSearching: false })
  },

  setFilters: (filters: SearchOptions) => {
    set((state) => ({
      filters: { ...state.filters, ...filters },
    }))

    // Re-search with new filters if there's an active query
    const { query } = get()
    // This would need vaultData context to re-search
  },

  search: (query: string, vaultData: VaultData) => {
    set({ query, isSearching: true, selectedIndex: -1 })

    const { filters } = get()
    const results = globalSearch(vaultData, query, filters)

    set({ results, isSearching: false })
  },

  searchByTag: (tag: string, vaultData: VaultData) => {
    set({ query: `tag:${tag}`, isSearching: true, selectedIndex: -1 })

    const { results } = await import("@/lib/api/v2-search").then(({ searchByTag }) =>
      searchByTag(vaultData, tag),
    )

    set({ results, isSearching: false })
  },

  selectResult: (index: number) => {
    const { results } = get()
    if (index >= 0 && index < results.length) {
      set({ selectedIndex: index })
    }
  },

  clearResults: () =>
    set({
      query: "",
      results: [],
      isSearching: false,
      selectedIndex: -1,
    }),
}))
