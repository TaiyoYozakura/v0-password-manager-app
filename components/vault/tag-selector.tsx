import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { getTagIcon, getCommonTags } from "@/lib/utils/tag-icons"
import { cn } from "@/lib/utils"
import { X, Search } from "lucide-react"

interface Props {
  tags: string[]
  value: string
  onSelect: (tag: string) => void
  className?: string
}

export function TagSelector({ tags, value, onSelect, className }: Props) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")

  const commonTags = getCommonTags()
  
  // Filter common tags by search
  const filtered = commonTags.filter(tag =>
    tag.name.toLowerCase().includes(search.toLowerCase())
  )

  // Get unique tags from existing list
  const existingUnique = [...new Set(tags)]
    .sort()
    .filter(t => !filtered.some(ct => ct.name.toLowerCase() === t.toLowerCase()))

  return (
    <div className={cn("space-y-2", className)}>
      <div className="relative">
        <div className="flex gap-2 items-center">
          <div className="flex-1 relative">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Search or create custom tag..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onFocus={() => setOpen(true)}
              className="pl-8"
            />
          </div>
          {search && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                if (search.trim()) {
                  onSelect(search.trim())
                  setSearch("")
                }
              }}
            >
              Create "{search}"
            </Button>
          )}
        </div>
      </div>

      {open && (
        <div className="absolute z-50 w-full max-w-sm border border-border rounded-lg bg-background shadow-lg p-3 space-y-3">
          {/* Common Tags */}
          {filtered.length > 0 && (
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-2">Suggested Tags</p>
              <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                {filtered.map((tag) => {
                  const IconComponent = tag.icon
                  const isSelected = value.toLowerCase() === tag.name.toLowerCase()
                  return (
                    <button
                      key={tag.name}
                      onClick={() => {
                        onSelect(tag.name)
                        setSearch("")
                        setOpen(false)
                      }}
                      className={cn(
                        "flex items-center gap-2 p-2 rounded-md border text-sm transition-colors",
                        isSelected
                          ? "bg-primary/10 border-primary text-primary"
                          : "hover:bg-secondary border-border"
                      )}
                    >
                      <IconComponent className="h-4 w-4 flex-shrink-0" aria-hidden />
                      <span className="truncate">{tag.name}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Existing Custom Tags */}
          {existingUnique.length > 0 && (
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-2">Your Tags</p>
              <div className="flex flex-wrap gap-2">
                {existingUnique.map((tag) => {
                  const IconComponent = getTagIcon(tag)
                  const isSelected = value === tag
                  return (
                    <button
                      key={tag}
                      onClick={() => {
                        onSelect(tag)
                        setSearch("")
                        setOpen(false)
                      }}
                      className={cn(
                        "inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium border transition-colors",
                        isSelected
                          ? "bg-primary/10 border-primary text-primary"
                          : "hover:bg-secondary border-border"
                      )}
                    >
                      <IconComponent className="h-3 w-3 flex-shrink-0" aria-hidden />
                      {tag}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {filtered.length === 0 && existingUnique.length === 0 && search && (
            <p className="text-xs text-muted-foreground text-center py-2">
              Press the "Create" button to add a new tag
            </p>
          )}
        </div>
      )}

      {/* Show selected tag */}
      {value && (
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="gap-1.5">
            {(() => {
              const IconComponent = getTagIcon(value)
              return (
                <>
                  <IconComponent className="h-3.5 w-3.5" aria-hidden />
                  {value}
                </>
              )
            })()}
          </Badge>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              onSelect("")
              setOpen(false)
            }}
            className="h-6 w-6 p-0"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      )}

      {/* Close backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setOpen(false)}
        />
      )}
    </div>
  )
}
