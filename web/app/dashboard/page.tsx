"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { KeyRound, Hash, ShieldAlert, Plus, ArrowUpRight } from "lucide-react"
import { useAuth } from "@/components/providers/auth-provider"
import { listPasswords } from "@/lib/firebase/passwords"
import { listPins } from "@/lib/firebase/pins"
import type { DecryptedPasswordEntry, DecryptedPinEntry } from "@/lib/types"
import { isWeakPassword } from "@/lib/crypto/passwordStrength"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { TagBadge } from "@/components/vault/tag-badge"
import { FaviconImage } from "@/components/vault/favicon-image"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { timeAgo } from "@/lib/utils/time"

export default function DashboardPage() {
  const { user, key } = useAuth()
  const [passwords, setPasswords] = useState<DecryptedPasswordEntry[] | null>(null)
  const [pins, setPins] = useState<DecryptedPinEntry[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user || !key) return
    let active = true
    ;(async () => {
      try {
        const [p, pn] = await Promise.all([listPasswords(user.uid, key), listPins(user.uid, key)])
        if (!active) return
        setPasswords(p)
        setPins(pn)
      } catch {
        if (!active) return
        setError("Could not load your vault")
      }
    })()
    return () => {
      active = false
    }
  }, [user, key])

  const weakCount = useMemo(
    () => (passwords ?? []).filter((p) => isWeakPassword(p.password)).length,
    [passwords],
  )

  const recent = useMemo(() => {
    const pw = (passwords ?? []).map((p) => ({
      type: "password" as const,
      id: p.id,
      title: p.siteName || "Untitled",
      subtitle: p.siteUrl,
      tag: p.tag,
      date: p.createdAt?.getTime() ?? 0,
      href: `/passwords/${p.id}`,
      url: p.siteUrl,
    }))
    const pn = (pins ?? []).map((p) => ({
      type: "pin" as const,
      id: p.id,
      title: p.label || "Untitled",
      subtitle: p.category,
      tag: p.category,
      date: p.createdAt?.getTime() ?? 0,
      href: `/pins/${p.id}`,
      url: "",
    }))
    return [...pw, ...pn].sort((a, b) => b.date - a.date).slice(0, 5)
  }, [passwords, pins])

  const firstName = user?.displayName?.split(" ")[0] || "there"
  const loading = passwords === null || pins === null

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 md:px-8 md:py-10">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Avatar className="size-12 ring-2 ring-border">
            <AvatarImage src={user?.photoURL || undefined} alt="" />
            <AvatarFallback>{firstName.slice(0, 1).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-pretty text-2xl font-semibold tracking-tight">Welcome back, {firstName}</h1>
            <p className="text-sm text-muted-foreground">Here&apos;s a snapshot of your vault.</p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button asChild variant="outline" className="gap-2">
            <Link href="/pins/new">
              <Plus className="size-4" aria-hidden /> Add PIN
            </Link>
          </Button>
          <Button asChild className="gap-2">
            <Link href="/passwords/new">
              <Plus className="size-4" aria-hidden /> Add Password
            </Link>
          </Button>
        </div>
      </header>

      <section aria-label="Stats" className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Total Passwords"
          value={loading ? undefined : passwords!.length}
          icon={<KeyRound className="size-4" aria-hidden />}
        />
        <StatCard
          title="Total PINs"
          value={loading ? undefined : pins!.length}
          icon={<Hash className="size-4" aria-hidden />}
        />
        <StatCard
          title="Weak Passwords"
          value={loading ? undefined : weakCount}
          icon={<ShieldAlert className="size-4" aria-hidden />}
          accent={weakCount > 0 ? "warn" : "ok"}
          hint={weakCount > 0 ? "Under 8 chars or no special chars" : "All passwords look healthy"}
        />
      </section>

      <section aria-label="Recently added" className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-semibold tracking-tight">Recently added</h2>
          <Button asChild variant="ghost" size="sm" className="gap-1 text-muted-foreground">
            <Link href="/passwords">
              View all <ArrowUpRight className="size-3.5" aria-hidden />
            </Link>
          </Button>
        </div>

        <Card>
          <CardContent className="p-0">
            {error && (
              <div className="p-6 text-sm text-destructive" role="alert">
                {error}
              </div>
            )}
            {loading && !error && (
              <ul className="divide-y divide-border">
                {Array.from({ length: 4 }).map((_, i) => (
                  <li key={i} className="flex items-center gap-3 p-4">
                    <Skeleton className="size-10 rounded-md" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-1/3" />
                      <Skeleton className="h-3 w-1/5" />
                    </div>
                    <Skeleton className="h-5 w-16 rounded-full" />
                  </li>
                ))}
              </ul>
            )}
            {!loading && !error && recent.length === 0 && (
              <div className="flex flex-col items-center justify-center gap-3 p-10 text-center">
                <p className="text-sm text-muted-foreground">Your vault is empty. Let&apos;s add your first entry.</p>
                <Button asChild>
                  <Link href="/passwords/new">
                    <Plus className="size-4" aria-hidden /> Add password
                  </Link>
                </Button>
              </div>
            )}
            {!loading && !error && recent.length > 0 && (
              <ul className="divide-y divide-border">
                {recent.map((r) => (
                  <li key={`${r.type}-${r.id}`}>
                    <Link
                      href={r.href}
                      className="flex items-center gap-3 p-4 transition-colors hover:bg-accent hover:text-accent-foreground"
                    >
                      {r.type === "password" ? (
                        <FaviconImage url={r.url} siteName={r.title} size={40} />
                      ) : (
                        <div
                          className="flex size-10 shrink-0 items-center justify-center rounded-md bg-secondary text-secondary-foreground"
                          aria-hidden
                        >
                          <Hash className="size-4" />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{r.title}</p>
                        <p className="truncate text-xs text-muted-foreground">{r.subtitle}</p>
                      </div>
                      <TagBadge tag={r.tag} />
                      <span className="hidden min-w-[88px] text-right text-xs text-muted-foreground sm:block">
                        {timeAgo(r.date)}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  )
}

function StatCard({
  title,
  value,
  icon,
  accent = "default",
  hint,
}: {
  title: string
  value: number | undefined
  icon: React.ReactNode
  accent?: "default" | "ok" | "warn"
  hint?: string
}) {
  const accentClass =
    accent === "warn"
      ? "bg-destructive/10 text-destructive"
      : accent === "ok"
        ? "bg-chart-2/15 text-chart-2"
        : "bg-secondary text-secondary-foreground"
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div
          className={`flex size-8 items-center justify-center rounded-md ${accentClass}`}
          aria-hidden
        >
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-semibold tabular-nums">
          {typeof value === "number" ? value : <Skeleton className="h-8 w-16" />}
        </div>
        {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
      </CardContent>
    </Card>
  )
}
