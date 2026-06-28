import { VaultData, PasswordItem, PINItem, NoteItem } from "@/lib/types/v2-vault"

/**
 * Global search service for v2 password manager
 * Provides full-text search across all vault items
 */

export interface SearchResult {
  type: "password" | "pin" | "note"
  item: PasswordItem | PINItem | NoteItem
  matchFields: string[]
  relevance: number
}

export interface SearchOptions {
  limit?: number
  includePasswords?: boolean
  includePINs?: boolean
  includeNotes?: boolean
  caseSensitive?: boolean
}

/**
 * Normalize and tokenize search query
 */
function tokenizeQuery(query: string, caseSensitive: boolean = false): string[] {
  const normalized = caseSensitive ? query : query.toLowerCase()
  return normalized.split(/\s+/).filter((token) => token.length > 0)
}

/**
 * Check if a string matches search tokens
 */
function matchesTokens(text: string, tokens: string[], caseSensitive: boolean = false): boolean {
  const searchText = caseSensitive ? text : text.toLowerCase()
  return tokens.some((token) => searchText.includes(token))
}

/**
 * Calculate relevance score based on match location
 */
function calculateRelevance(text: string, token: string, caseSensitive: boolean = false): number {
  const searchText = caseSensitive ? text : text.toLowerCase()
  const searchToken = caseSensitive ? token : token.toLowerCase()
  
  const index = searchText.indexOf(searchToken)
  if (index === -1) return 0
  
  // Higher score for matches at the beginning
  if (index === 0) return 100
  if (searchText[index - 1] === " ") return 90
  return 80 - (index * 0.1)
}

/**
 * Search passwords by siteName, email, username, notes, and tags
 */
function searchPasswords(
  passwords: PasswordItem[],
  tokens: string[],
  caseSensitive: boolean = false,
  limit: number = 50,
): SearchResult[] {
  const results: SearchResult[] = []

  for (const password of passwords) {
    const matchFields: string[] = []
    let totalRelevance = 0

    tokens.forEach((token) => {
      if (matchesTokens(password.siteName, [token], caseSensitive)) {
        matchFields.push("siteName")
        totalRelevance += calculateRelevance(password.siteName, token, caseSensitive) * 1.5
      }

      if (password.email && matchesTokens(password.email, [token], caseSensitive)) {
        matchFields.push("email")
        totalRelevance += calculateRelevance(password.email, token, caseSensitive)
      }

      if (password.username && matchesTokens(password.username, [token], caseSensitive)) {
        matchFields.push("username")
        totalRelevance += calculateRelevance(password.username, token, caseSensitive)
      }

      if (password.siteUrl && matchesTokens(password.siteUrl, [token], caseSensitive)) {
        matchFields.push("url")
        totalRelevance += calculateRelevance(password.siteUrl, token, caseSensitive) * 0.8
      }

      if (password.notes && matchesTokens(password.notes, [token], caseSensitive)) {
        matchFields.push("notes")
        totalRelevance += calculateRelevance(password.notes, token, caseSensitive) * 0.5
      }

      if (password.tags) {
        for (const tag of password.tags) {
          if (matchesTokens(tag, [token], caseSensitive)) {
            matchFields.push("tags")
            totalRelevance += calculateRelevance(tag, token, caseSensitive) * 1.2
          }
        }
      }
    })

    if (matchFields.length > 0) {
      results.push({
        type: "password",
        item: password,
        matchFields: [...new Set(matchFields)],
        relevance: totalRelevance,
      })
    }
  }

  return results.sort((a, b) => b.relevance - a.relevance).slice(0, limit)
}

/**
 * Search PINs by label, category, notes, and tags
 */
function searchPINs(
  pins: PINItem[],
  tokens: string[],
  caseSensitive: boolean = false,
  limit: number = 50,
): SearchResult[] {
  const results: SearchResult[] = []

  for (const pin of pins) {
    const matchFields: string[] = []
    let totalRelevance = 0

    tokens.forEach((token) => {
      if (matchesTokens(pin.label, [token], caseSensitive)) {
        matchFields.push("label")
        totalRelevance += calculateRelevance(pin.label, token, caseSensitive) * 1.5
      }

      if (pin.category && matchesTokens(pin.category, [token], caseSensitive)) {
        matchFields.push("category")
        totalRelevance += calculateRelevance(pin.category, token, caseSensitive)
      }

      if (pin.notes && matchesTokens(pin.notes, [token], caseSensitive)) {
        matchFields.push("notes")
        totalRelevance += calculateRelevance(pin.notes, token, caseSensitive) * 0.5
      }

      if (pin.tags) {
        for (const tag of pin.tags) {
          if (matchesTokens(tag, [token], caseSensitive)) {
            matchFields.push("tags")
            totalRelevance += calculateRelevance(tag, token, caseSensitive) * 1.2
          }
        }
      }
    })

    if (matchFields.length > 0) {
      results.push({
        type: "pin",
        item: pin,
        matchFields: [...new Set(matchFields)],
        relevance: totalRelevance,
      })
    }
  }

  return results.sort((a, b) => b.relevance - a.relevance).slice(0, limit)
}

/**
 * Search notes by title, content, and tags
 */
function searchNotes(
  notes: NoteItem[],
  tokens: string[],
  caseSensitive: boolean = false,
  limit: number = 50,
): SearchResult[] {
  const results: SearchResult[] = []

  for (const note of notes) {
    const matchFields: string[] = []
    let totalRelevance = 0

    tokens.forEach((token) => {
      if (matchesTokens(note.title, [token], caseSensitive)) {
        matchFields.push("title")
        totalRelevance += calculateRelevance(note.title, token, caseSensitive) * 1.5
      }

      if (matchesTokens(note.content, [token], caseSensitive)) {
        matchFields.push("content")
        totalRelevance += calculateRelevance(note.content, token, caseSensitive)
      }

      if (note.tags) {
        for (const tag of note.tags) {
          if (matchesTokens(tag, [token], caseSensitive)) {
            matchFields.push("tags")
            totalRelevance += calculateRelevance(tag, token, caseSensitive) * 1.2
          }
        }
      }
    })

    if (matchFields.length > 0) {
      results.push({
        type: "note",
        item: note,
        matchFields: [...new Set(matchFields)],
        relevance: totalRelevance,
      })
    }
  }

  return results.sort((a, b) => b.relevance - a.relevance).slice(0, limit)
}

/**
 * Global search across all vault items
 */
export function globalSearch(
  vaultData: VaultData,
  query: string,
  options: SearchOptions = {},
): SearchResult[] {
  if (!query.trim()) return []

  const {
    limit = 50,
    includePasswords = true,
    includePINs = true,
    includeNotes = true,
    caseSensitive = false,
  } = options

  const tokens = tokenizeQuery(query, caseSensitive)
  if (tokens.length === 0) return []

  const results: SearchResult[] = []

  if (includePasswords) {
    results.push(...searchPasswords(vaultData.passwords, tokens, caseSensitive, limit))
  }

  if (includePINs) {
    results.push(...searchPINs(vaultData.pins, tokens, caseSensitive, limit))
  }

  if (includeNotes) {
    results.push(...searchNotes(vaultData.notes, tokens, caseSensitive, limit))
  }

  // Sort all results by relevance
  return results.sort((a, b) => b.relevance - a.relevance).slice(0, limit)
}

/**
 * Get items by tag across all types
 */
export function searchByTag(vaultData: VaultData, tag: string): SearchResult[] {
  const results: SearchResult[] = []

  vaultData.passwords.forEach((pwd) => {
    if (pwd.tags?.includes(tag)) {
      results.push({
        type: "password",
        item: pwd,
        matchFields: ["tags"],
        relevance: 100,
      })
    }
  })

  vaultData.pins.forEach((pin) => {
    if (pin.tags?.includes(tag)) {
      results.push({
        type: "pin",
        item: pin,
        matchFields: ["tags"],
        relevance: 100,
      })
    }
  })

  vaultData.notes.forEach((note) => {
    if (note.tags?.includes(tag)) {
      results.push({
        type: "note",
        item: note,
        matchFields: ["tags"],
        relevance: 100,
      })
    }
  })

  return results
}
