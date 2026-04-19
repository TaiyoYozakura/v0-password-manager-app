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
  KeyRound,
  ShieldAlert,
  ArrowUpDown,
} from "lucide-react"
import { useAuth } from "@/components/providers/auth-provider"
import { deletePassword, listPasswords } from "@/lib/firebase/passwords"
import type { DecryptedPasswordEntry } from "@/lib/types"
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
import { FaviconImage } from "@/components/vault/favicon-image"
import { ConfirmModal } from "@/components/vault/confirm-modal"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

type SortKey = "date-desc" | "name-asc" | "tag-asc"

const PAGE_SIZE = 10
const URL_MAX = 24

function truncateUrl(url: string) {
  return url.length > URL_MAX ? `${url.slice(0, URL_MAX)}...` : url
}

export default function PasswordsPage() {
  const router = useRouter()
  const { user, key } = useAuth()
  const { copy } = useSecureClipboard()

  const [entries, setEntries] = useState<DecryptedPasswordEntry[] | null>(null)
  const [query, setQuery] = useState("")
  const [tagFilter, setTagFilter] = useState<string>("__all__")
  const [sort, setSort] = useState<SortKey>("date-desc")
  const [page, setPage] = useState(1)
  const [revealed, setRevealed] = useState<Record<string, boolean>>({})
  const [toDelete, setToDelete] = useState<DecryptedPasswordEntry | null>(null)
  const [deleting, setDeleting] = useState(false)

  const reload = async () => {
    if (!user || !key) return
    try {
      const data = await listPasswords(user.uid, key)
      setEntries(data)
    } catch {
      toast.error("Failed to load passwords")
      setEntries([])
    }
  }

  useEffect(() => {
    setEntries(null)
    void reload()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, key])

  const tags = useMemo(() => {
    if (!entries) return []
    return Array.from(new Set(entries.map((e) => e.tag))).sort()
  }, [entries])

  const filtered = useMemo(() => {
    if (!entries) return []
    const q = query.trim().toLowerCase()
    let list = entries
    if (q) {
      list = list.filter((e) =>
        [e.siteName, e.email, e.username, e.tag, e.siteUrl]
          .filter(Boolean)
          .some((v) => v.toLowerCase().includes(q)),
      )
    }
    if (tagFilter !== "__all__") {
      list = list.filter((e) => e.tag === tagFilter)
    }
    list = [...list]
    if (sort === "date-desc") {
      list.sort((a, b) => (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0))
    } else if (sort === "name-asc") {
      list.sort((a, b) => a.siteName.localeCompare(b.siteName))
    } else {
      list.sort((a, b) => a.tag.localeCompare(b.tag) || a.siteName.localeCompare(b.siteName))
    }
    return list
  }, [entries, query, tagFilter, sort])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const pageItems = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  useEffect(() => {
    setPage(1)
  }, [query, tagFilter, sort])

  const toggleReveal = (id: string) =>
    setRevealed((r) => ({ ...r, [id]: !r[id] }))

  const onCopy = (e: DecryptedPasswordEntry) => {
    void copy(e.password, "Password copied")
  }

  const onDelete = async () => {
    if (!user || !toDelete) return
    setDeleting(true)
    try {
      await deletePassword(user.uid, toDelete.id)
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
            <h1 className="text-pretty text-2xl font-semibold tracking-tight">Saved Passwords</h1>
            <p className="text-sm text-muted-foreground">Decrypted in-memory on your device.</p>
          </div>
          <Button asChild className="gap-2">
            <Link href="/passwords/new">
              <Plus className="size-4" aria-hidden /> Add Password
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
              placeholder="Search site, email, username, tag..."
              className="pl-9"
              aria-label="Search passwords"
            />
          </div>
          <div className="flex gap-2">
            <Select value={tagFilter} onValueChange={setTagFilter}>
              <SelectTrigger className="w-full sm:w-[180px]" aria-label="Filter by tag">
                <SelectValue placeholder="All tags" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">All tags</SelectItem>
                {tags.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
              <SelectTrigger className="w-full sm:w-[180px]" aria-label="Sort by">
                <ArrowUpDown className="mr-1 size-4" aria-hidden />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date-desc">Newest first</SelectItem>
                <SelectItem value="name-asc">Site Name A–Z</SelectItem>
                <SelectItem value="tag-asc">Tag</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <Card className="mt-4">
            <CardContent className="p-0">
              <div className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>#</TableHead>
                      <TableHead>Site</TableHead>
                      <TableHead>Email / Username</TableHead>
                      <TableHead>Tag</TableHead>
                      <TableHead>Password</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell><Skeleton className="h-4 w-6" /></TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Skeleton className="size-8 rounded-md" />
                            <Skeleton className="h-4 w-32" />
                          </div>
                        </TableCell>
                        <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-16 rounded-full" /></TableCell>
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

        {/* Empty */}
        {!loading && filtered.length === 0 && (
          <Card className="mt-6">
            <CardContent className="p-0">
              <Empty>
                <EmptyHeader>
                  <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
                    <KeyRound className="size-5" aria-hidden />
                  </div>
                  <EmptyTitle>
                    {entries && entries.length === 0
                      ? "No passwords saved yet."
                      : "No matches for your filters."}
                  </EmptyTitle>
                  <EmptyDescription>
                    {entries && entries.length === 0
                      ? "Your vault is empty. Start by adding your first password."
                      : "Try a different search term or clear the filters."}
                  </EmptyDescription>
                </EmptyHeader>
                <EmptyContent>
                  {entries && entries.length === 0 ? (
                    <Button asChild className="gap-2">
                      <Link href="/passwords/new">
                        <Plus className="size-4" aria-hidden /> Add your first password
                      </Link>
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      onClick={() => {
                        setQuery("")
                        setTagFilter("__all__")
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

        {/* Desktop table */}
        {!loading && filtered.length > 0 && (
          <>
            <Card className="mt-4 hidden md:block">
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[48px]">#</TableHead>
                      <TableHead>Site</TableHead>
                      <TableHead>Email / Username</TableHead>
                      <TableHead className="w-[140px]">Tag</TableHead>
                      <TableHead className="w-[220px]">Password</TableHead>
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
                            <div className="flex items-center gap-3">
                              <FaviconImage url={e.siteUrl} siteName={e.siteName} size={32} />
                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <p className="truncate text-sm font-medium">{e.siteName}</p>
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
                                {e.siteUrl && (
                                  <div className="flex items-center gap-1">
                                    <span
                                      className="font-mono text-xs text-muted-foreground"
                                      title={e.siteUrl}
                                    >
                                      {truncateUrl(e.siteUrl)}
                                    </span>
                                    <InlineCopyButton
                                      label="Copy URL"
                                      onClick={() => void copy(e.siteUrl, "URL copied")}
                                    />
                                  </div>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {e.email || e.username ? (
                              <div className="flex max-w-[240px] items-center gap-1">
                                <span className="truncate text-sm">{e.email || e.username}</span>
                                <InlineCopyButton
                                  label={e.email ? "Copy email" : "Copy username"}
                                  onClick={() =>
                                    void copy(
                                      (e.email || e.username) as string,
                                      e.email ? "Email copied" : "Username copied",
                                    )
                                  }
                                />
                              </div>
                            ) : (
                              <span className="text-sm text-muted-foreground">—</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <TagBadge tag={e.tag} />
                          </TableCell>
                          <TableCell>
                            <span className="font-mono text-sm">
                              {isRevealed ? e.password : "••••••••"}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="inline-flex gap-1">
                              <IconButton
                                label={isRevealed ? "Hide password" : "Show password"}
                                onClick={() => toggleReveal(e.id)}
                              >
                                {isRevealed ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                              </IconButton>
                              <IconButton
                                label="Copy password"
                                onClick={() => onCopy(e)}
                              >
                                <Copy className="size-4" />
                              </IconButton>
                              <IconButton
                                label="Edit"
                                onClick={() => router.push(`/passwords/${e.id}`)}
                              >
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

            {/* Mobile cards */}
            <div className="mt-4 flex flex-col gap-3 md:hidden">
              {pageItems.map((e) => {
                const isRevealed = !!revealed[e.id]
                return (
                  <Card key={e.id} className="overflow-hidden">
                    <CardContent className="flex flex-col gap-3 p-4">
                      <div className="flex items-start gap-3">
                        <FaviconImage url={e.siteUrl} siteName={e.siteName} size={40} />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <p className="truncate text-sm font-medium">{e.siteName}</p>
                            {!e.integrityOk && (
                              <ShieldAlert
                                className="size-4 text-destructive"
                                aria-label="Integrity check failed"
                              />
                            )}
                          </div>
                          {e.siteUrl && (
                            <div className="flex items-center gap-1">
                              <span
                                className="truncate font-mono text-xs text-muted-foreground"
                                title={e.siteUrl}
                              >
                                {truncateUrl(e.siteUrl)}
                              </span>
                              <InlineCopyButton
                                label="Copy URL"
                                onClick={() => void copy(e.siteUrl, "URL copied")}
                              />
                            </div>
                          )}
                        </div>
                        <TagBadge tag={e.tag} />
                      </div>
                      {(e.email || e.username) && (
                        <div className="flex items-center gap-1 text-sm">
                          <span className="text-muted-foreground">Account:</span>
                          <span className="min-w-0 flex-1 truncate font-medium">
                            {e.email || e.username}
                          </span>
                          <InlineCopyButton
                            label={e.email ? "Copy email" : "Copy username"}
                            onClick={() =>
                              void copy(
                                (e.email || e.username) as string,
                                e.email ? "Email copied" : "Username copied",
                              )
                            }
                          />
                        </div>
                      )}
                      <div className="flex items-center justify-between gap-3 rounded-md bg-secondary/40 px-3 py-2">
                        <span className="truncate font-mono text-sm">
                          {isRevealed ? e.password : "••••••••"}
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
                        <IconButton
                          label="Copy"
                          onClick={() => onCopy(e)}
                          fullWidth
                        >
                          <Copy className="size-4" />
                        </IconButton>
                        <IconButton
                          label="Edit"
                          onClick={() => router.push(`/passwords/${e.id}`)}
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

            {/* Pagination */}
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
          title="Delete this password?"
          description={
            <>
              This will permanently remove{" "}
              <span className="font-semibold">{toDelete?.siteName}</span> from your vault.
              This cannot be undone.
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
      variant={variant === "destructive" ? "ghost" : "ghost"}
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

function InlineCopyButton({
  label,
  onClick,
}: {
  label: string
  onClick: () => void
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onClick}
          aria-label={label}
          className="size-6 shrink-0 text-muted-foreground hover:text-foreground"
        >
          <Copy className="size-3.5" aria-hidden />
        </Button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  )
}
