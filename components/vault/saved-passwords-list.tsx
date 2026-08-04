'use client'

import { useEffect, useState, useRef } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { X, Search } from 'lucide-react'
import { FaviconImage } from '@/components/vault/favicon-image'
import { TagBadge } from '@/components/vault/tag-badge'
import type { DecryptedPasswordEntry } from '@/lib/types'

interface Props {
  entries: DecryptedPasswordEntry[]
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (entry: DecryptedPasswordEntry) => void
}

export function SavedPasswordsList({ entries, open, onOpenChange, onSelect }: Props) {
  const [search, setSearch] = useState('')
  const [filteredEntries, setFilteredEntries] = useState<DecryptedPasswordEntry[]>([])
  const containerRef = useRef<HTMLDivElement>(null)

  // Filter by site name and tag only (not username)
  useEffect(() => {
    if (!search.trim()) {
      setFilteredEntries(entries)
      return
    }

    const query = search.toLowerCase()
    const filtered = entries.filter((entry) => {
      const nameMatch = entry.siteName.toLowerCase().includes(query)
      const tagMatch = entry.tag.toLowerCase().includes(query)
      return nameMatch || tagMatch
    })
    setFilteredEntries(filtered)
  }, [search, entries])

  // Handle Esc key
  useEffect(() => {
    if (!open) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        onOpenChange(false)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open, onOpenChange])

  // Handle click outside
  useEffect(() => {
    if (!open) return

    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        onOpenChange(false)
      }
    }

    // Use capture phase to detect clicks outside
    document.addEventListener('mousedown', handleClickOutside, true)
    return () => document.removeEventListener('mousedown', handleClickOutside, true)
  }, [open, onOpenChange])

  if (!open) return null

  const handleSelect = (entry: DecryptedPasswordEntry) => {
    onSelect(entry)
    onOpenChange(false)
    setSearch('')
  }

  return (
    <div
      ref={containerRef}
      className="absolute top-full left-0 right-0 z-50 mt-2 w-full"
      onClick={(e) => e.stopPropagation()}
    >
      <Card className="shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <h3 className="font-semibold">Saved Passwords</h3>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => onOpenChange(false)}
            aria-label="Close"
            className="h-6 w-6"
          >
            <X className="size-4" />
          </Button>
        </CardHeader>

        <CardContent className="flex flex-col gap-3">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or tag..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8"
              autoFocus
            />
          </div>

          {/* Entries List */}
          <ScrollArea className="h-64 pr-4">
            {filteredEntries.length > 0 ? (
              <div className="space-y-2">
                {filteredEntries.map((entry) => (
                  <button
                    key={entry.id}
                    onClick={() => handleSelect(entry)}
                    className="w-full rounded-md border border-border p-2 text-left hover:bg-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <div className="flex items-center gap-3">
                      <FaviconImage url={entry.siteUrl} siteName={entry.siteName} size={32} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{entry.siteName}</p>
                        <div className="flex items-center gap-2">
                          <TagBadge tag={entry.tag} customIconUrl={entry.tagIconUrl} className="text-xs" />
                          {entry.siteUrl && (
                            <p className="text-xs text-muted-foreground truncate">{entry.siteUrl}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center py-8">
                <p className="text-sm text-muted-foreground">No passwords found</p>
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}
