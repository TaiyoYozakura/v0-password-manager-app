"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"
import {
  Plus,
  Search,
  Eye,
  EyeOff,
  Copy,
  Pencil,
  Trash2,
  Hash,
  ShieldAlert,
} from "lucide-react"
import { useAuth } from "@/components/providers/auth-provider"
import { deletePin, listPins } from "@/lib/firebase/pins"
import type { DecryptedPinEntry } from "@/lib/types"
import { PIN_CATEGORIES } from "@/lib/types"
import { useSecureClipboard } from "@/hooks/use-secure-clipboard"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty"
import { TagBadge } from "@/components/vault/tag-badge"
import { ConfirmModal } from "@/components/vault/confirm-modal"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

const PAGE_SIZE = 10

export default function PinsPage() {
  const router = useRouter()
  const { user, key } = useAuth()
  const { copy } = useSecureClipboard()

  const [entries, setEntries] = useState<DecryptedPinEntry[] | null>(null)
  const [query, setQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("__all__")
  const [page, setPage] = useState(1)
  const [revealed, setRevealed] = useState<Record<string, boolean>>({})
  const [toDelete, setToDelete] = useState<DecryptedPinEntry | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (!user || !key) return
    let active = true
    setEntries(null)
    ;(async () => {
      try {
        const data = await listPins(user.uid, key)
        if (active) setEntries(data)
      } catch {
        if (active) {
          toast.error("Failed to load PINs")
          setEntries([])
        }
      }
    })()
    return () => {
      active = false
    }
  }, [user, key])

  const filtered = useMemo(() => {
    if (!entries) return []
    const q = query.trim().toLowerCase()
    let list = entries
    if (q) {
      list = list.filter((e) =>
        [e.label, e.category].some((v) => v.toLowerCase().includes(q)),
      )
    }
    if (categoryFilter !== "__all__") {
      list = list.filter((e) => e.category === categoryFilter)
    }
    return list
  }, [entries, query, categoryFilter])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const pageItems = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  useEffect(() => {
    setPage(1)
  }, [query, categoryFilter])

  const toggleReveal = (id: string) =>
    setRevealed((r) => ({ ...r, [id]: !r[id] }))

  const onCopy = (e: DecryptedPinEntry) => {
    void copy(e.pin, "PIN copied")
  }

  const onDelete = async () => {
    if (!user || !toDelete) return
    setDeleting(true)
    try {
      await deletePin(user.uid, toDelete.id)
      toast.success("Deleted")
      setEntries((prev) => (prev ?? []).filter((e) => e.id !== toDelete.id))
    } catch {
      toast.error("Could not delete")
    } finally {
      setDeleting(false)
      setToDelete(null)
    }
  }

  const loading = entries === null

  return (
    <TooltipProvider delayDuration={200}>
      <div className="mx-auto w-full max-w-6xl px-4 py-6 md:px-8 md:py-10">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-pretty text-2xl font-semibold tracking-tight">Saved PINs</h1>
            <p className="text-sm text-muted-foreground">Decrypted in-memory on your device.</p>
          </div>
          <Button asChild className="gap-2">
            <Link href="/pins/new">
              <Plus className="size-4" aria-hidden /> Add PIN
            </Link>
          </Button>
        </header>

        <div className="mt-6 flex flex-col gap-3 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search label or category..."
              className="pl-9"
              aria-label="Search PINs"
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full sm:w-[200px]" aria-label="Filter by category">
              <SelectValue placeholder="All categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">All categories</SelectItem>
              {PIN_CATEGORIES.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {loading && (
          <Card className="mt-4">
            <CardContent className="p-0">
              <div className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>#</TableHead>
                      <TableHead>Label</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>PIN</TableHead>
                      <TableHead>Notes</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell><Skeleton className="h-4 w-6" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-16 rounded-full" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                        <TableCell className="text-right"><Skeleton className="ml-auto h-8 w-32" /></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="space-y-3 p-4 md:hidden">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-28 w-full rounded-md" />
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {!loading && filtered.length === 0 && (
          <Card className="mt-6">
            <CardContent className="p-0">
              <Empty>
                <EmptyHeader>
                  <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
                    <Hash className="size-5" aria-hidden />
                  </div>
                  <EmptyTitle>
                    {entries && entries.length === 0
                      ? "No PINs saved yet."
                      : "No matches for your filters."}
                  </EmptyTitle>
                  <EmptyDescription>
                    {entries && entries.length === 0
                      ? "Store ATM, phone, and app PINs securely."
                      : "Try a different search term or clear the filters."}
                  </EmptyDescription>
                </EmptyHeader>
                <EmptyContent>
                  {entries && entries.length === 0 ? (
                    <Button asChild className="gap-2">
                      <Link href="/pins/new">
                        <Plus className="size-4" aria-hidden /> Add your first PIN
                      </Link>
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      onClick={() => {
                        setQuery("")
                        setCategoryFilter("__all__")
                      }}
                    >
                      Clear filters
                    </Button>
                  )}
                </EmptyContent>
              </Empty>
            </CardContent>
          </Card>
        )}

        {!loading && filtered.length > 0 && (
          <>
            {/* Desktop */}
            <Card className="mt-4 hidden md:block">
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[48px]">#</TableHead>
                      <TableHead>Label</TableHead>
                      <TableHead className="w-[160px]">Category</TableHead>
                      <TableHead className="w-[160px]">PIN</TableHead>
                      <TableHead>Notes</TableHead>
                      <TableHead className="w-[200px] text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pageItems.map((e, idx) => {
                      const rowNum = (currentPage - 1) * PAGE_SIZE + idx + 1
                      const isRevealed = !!revealed[e.id]
                      return (
                        <TableRow key={e.id}>
                          <TableCell className="text-muted-foreground tabular-nums">
                            {rowNum}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{e.label}</span>
                              {!e.integrityOk && (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <ShieldAlert
                                      className="size-4 text-destructive"
                                      aria-label="Integrity check failed"
                                    />
                                  </TooltipTrigger>
                                  <TooltipContent>Integrity mismatch detected</TooltipContent>
                                </Tooltip>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <TagBadge tag={e.category} />
                          </TableCell>
                          <TableCell>
                            <span className="font-mono text-sm tracking-widest">
                              {isRevealed ? e.pin : "••••"}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="max-w-[280px] truncate text-sm text-muted-foreground">
                              {e.notes || "—"}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="inline-flex gap-1">
                              <IconButton
                                label={isRevealed ? "Hide PIN" : "Show PIN"}
                                onClick={() => toggleReveal(e.id)}
                              >
                                {isRevealed ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                              </IconButton>
                              <IconButton label="Copy PIN" onClick={() => onCopy(e)}>
                                <Copy className="size-4" />
                              </IconButton>
                              <IconButton label="Edit" onClick={() => router.push(`/pins/${e.id}`)}>
                                <Pencil className="size-4" />
                              </IconButton>
                              <IconButton
                                label="Delete"
                                variant="destructive"
                                onClick={() => setToDelete(e)}
                              >
                                <Trash2 className="size-4" />
                              </IconButton>
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Mobile */}
            <div className="mt-4 flex flex-col gap-3 md:hidden">
              {pageItems.map((e) => {
                const isRevealed = !!revealed[e.id]
                return (
                  <Card key={e.id} className="overflow-hidden">
                    <CardContent className="flex flex-col gap-3 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <div
                            className="flex size-9 items-center justify-center rounded-md bg-secondary text-secondary-foreground"
                            aria-hidden
                          >
                            <Hash className="size-4" />
                          </div>
                          <div>
                            <p className="font-medium">{e.label}</p>
                            {e.notes && (
                              <p className="line-clamp-1 text-xs text-muted-foreground">
                                {e.notes}
                              </p>
                            )}
                          </div>
                        </div>
                        <TagBadge tag={e.category} />
                      </div>
                      <div className="flex items-center justify-between rounded-md bg-secondary/40 px-3 py-2">
                        <span className="font-mono text-base tracking-widest">
                          {isRevealed ? e.pin : "••••"}
                        </span>
                      </div>
                      <div className="grid grid-cols-4 gap-1">
                        <IconButton
                          label={isRevealed ? "Hide" : "Show"}
                          onClick={() => toggleReveal(e.id)}
                          fullWidth
                        >
                          {isRevealed ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                        </IconButton>
                        <IconButton label="Copy" onClick={() => onCopy(e)} fullWidth>
                          <Copy className="size-4" />
                        </IconButton>
                        <IconButton
                          label="Edit"
                          onClick={() => router.push(`/pins/${e.id}`)}
                          fullWidth
                        >
                          <Pencil className="size-4" />
                        </IconButton>
                        <IconButton
                          label="Delete"
                          variant="destructive"
                          onClick={() => setToDelete(e)}
                          fullWidth
                        >
                          <Trash2 className="size-4" />
                        </IconButton>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            <div className="mt-4 flex flex-col items-center justify-between gap-3 sm:flex-row">
              <p className="text-xs text-muted-foreground">
                Showing {(currentPage - 1) * PAGE_SIZE + 1}–
                {Math.min(currentPage * PAGE_SIZE, filtered.length)} of {filtered.length} entries
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <span className="text-xs text-muted-foreground">
                  Page {currentPage} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          </>
        )}

        <ConfirmModal
          open={!!toDelete}
          onOpenChange={(open) => !open && setToDelete(null)}
          title="Delete this PIN?"
          description={
            <>
              This will permanently remove{" "}
              <span className="font-semibold">{toDelete?.label}</span> from your vault.
            </>
          }
          confirmText={deleting ? "Deleting..." : "Delete"}
          destructive
          onConfirm={onDelete}
        />
      </div>
    </TooltipProvider>
  )
}

function IconButton({
  label,
  onClick,
  children,
  variant = "ghost",
  fullWidth = false,
}: {
  label: string
  onClick: () => void
  children: React.ReactNode
  variant?: "ghost" | "destructive"
  fullWidth?: boolean
}) {
  const btn = (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={onClick}
      aria-label={label}
      className={
        variant === "destructive"
          ? `text-destructive hover:bg-destructive/10 hover:text-destructive ${
              fullWidth ? "w-full" : ""
            }`
          : fullWidth
            ? "w-full"
            : ""
      }
    >
      {children}
    </Button>
  )
  return (
    <Tooltip>
      <TooltipTrigger asChild>{btn}</TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  )
}
