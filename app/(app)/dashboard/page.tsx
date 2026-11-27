"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { ArrowUpRight, Check, CircleAlert, Clock3, Hash, KeyRound, Plus, ShieldCheck } from "lucide-react"
import { useAuth } from "@/components/providers/auth-provider"
import { listPasswords } from "@/lib/firebase/passwords"
import { listPins } from "@/lib/firebase/pins"
import type { DecryptedPasswordEntry, DecryptedPinEntry } from "@/lib/types"
import { isWeakPassword } from "@/lib/crypto/passwordStrength"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { TagBadge } from "@/components/vault/tag-badge"
import { FaviconImage } from "@/components/vault/favicon-image"
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
        const [savedPasswords, savedPins] = await Promise.all([listPasswords(user.uid, key), listPins(user.uid, key)])
        if (!active) return
        setPasswords(savedPasswords)
        setPins(savedPins)
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
    () => (passwords ?? []).filter((password) => isWeakPassword(password.password)).length,
    [passwords],
  )

  const recent = useMemo(() => {
    const passwordEntries = (passwords ?? []).map((password) => ({
      type: "password" as const,
      id: password.id,
      title: password.siteName || "Untitled",
      subtitle: password.email || password.username || password.siteUrl,
      tag: password.tag,
      date: password.createdAt?.getTime() ?? 0,
      href: `/passwords/${password.id}`,
      url: password.siteUrl,
    }))
    const pinEntries = (pins ?? []).map((pin) => ({
      type: "pin" as const,
      id: pin.id,
      title: pin.label || "Untitled",
      subtitle: pin.category,
      tag: pin.category,
      date: pin.createdAt?.getTime() ?? 0,
      href: `/pins/${pin.id}`,
      url: "",
    }))
    return [...passwordEntries, ...pinEntries].sort((a, b) => b.date - a.date).slice(0, 5)
  }, [passwords, pins])

  const firstName = user?.displayName?.split(" ")[0] || "there"
  const loading = passwords === null || pins === null

  return (
    <div className="mx-auto w-full max-w-[1440px] px-4 py-6 sm:px-6 md:px-8 md:py-9">
      <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">Your vault, in quiet order</p>
          <h1 className="text-balance text-3xl font-semibold tracking-[-0.045em] sm:text-[38px]">Welcome back, {firstName}.</h1>
          <p className="mt-2 text-sm text-muted-foreground">Everything important, kept close and only yours.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline" className="h-10 gap-2 rounded-lg border-border/80 bg-card/60">
            <Link href="/pins/new"><Hash className="size-4" aria-hidden /> Add PIN</Link>
          </Button>
          <Button asChild className="h-10 gap-2 rounded-lg shadow-sm shadow-primary/15">
            <Link href="/passwords/new"><Plus className="size-4" aria-hidden /> Add password</Link>
          </Button>
        </div>
      </div>

      <section aria-label="Vault security overview" className="relative isolate overflow-hidden rounded-2xl border border-border/80 bg-card p-5 shadow-[0_20px_60px_-45px_rgba(0,0,0,0.7)] sm:p-7">
        <div className="pointer-events-none absolute -right-16 -top-24 -z-10 size-72 rounded-full bg-primary/10 blur-3xl" aria-hidden />
        <div className="flex flex-col gap-7 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/12 text-primary ring-1 ring-primary/15">
              <ShieldCheck className="size-6" aria-hidden />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-base font-semibold tracking-tight">Your vault is protected</h2>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#a4d8cb]/10 px-2.5 py-1 text-[11px] font-medium text-[#7cc6b4]">
                  <span className="size-1.5 rounded-full bg-[#a4d8cb]" aria-hidden /> End-to-end encrypted
                </span>
              </div>
              <p className="mt-1.5 max-w-xl text-sm leading-6 text-muted-foreground">Your saved details are decrypted in memory on your device. Nothing here is shared or searchable outside your vault.</p>
            </div>
          </div>
          <div className="grid grid-cols-3 divide-x divide-border border-t border-border pt-5 lg:min-w-[370px] lg:border-l lg:border-t-0 lg:pl-7 lg:pt-0">
            <Metric label="Passwords" value={loading ? undefined : passwords?.length} icon={<KeyRound className="size-4" aria-hidden />} />
            <Metric label="PINs" value={loading ? undefined : pins?.length} icon={<Hash className="size-4" aria-hidden />} />
            <Metric label="Needs review" value={loading ? undefined : weakCount} tone={weakCount > 0 ? "warn" : "good"} icon={weakCount > 0 ? <CircleAlert className="size-4" aria-hidden /> : <Check className="size-4" aria-hidden />} />
          </div>
        </div>
      </section>

      <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1.7fr)_minmax(280px,0.8fr)]">
        <section aria-labelledby="recent-title" className="min-w-0">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">At a glance</p>
              <h2 id="recent-title" className="mt-1 text-lg font-semibold tracking-tight">Recently added</h2>
            </div>
            <Button asChild variant="ghost" size="sm" className="gap-1 text-muted-foreground hover:text-foreground">
              <Link href="/passwords">All passwords <ArrowUpRight className="size-3.5" aria-hidden /></Link>
            </Button>
          </div>

          <Card className="overflow-hidden rounded-xl border-border/80 bg-card/70 shadow-none">
            <CardContent className="p-0">
              {error && <p className="p-6 text-sm text-destructive" role="alert">{error}</p>}
              {loading && !error && (
                <ul className="divide-y divide-border/70">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <li key={index} className="flex items-center gap-3 p-4">
                      <Skeleton className="size-10 rounded-xl" />
                      <div className="flex-1 space-y-2"><Skeleton className="h-4 w-1/3" /><Skeleton className="h-3 w-1/5" /></div>
                      <Skeleton className="h-5 w-16 rounded-full" />
                    </li>
                  ))}
                </ul>
              )}
              {!loading && !error && recent.length === 0 && (
                <div className="flex flex-col items-center justify-center gap-3 px-6 py-12 text-center">
                  <div className="flex size-12 items-center justify-center rounded-2xl bg-accent text-accent-foreground"><KeyRound className="size-5" aria-hidden /></div>
                  <div><p className="text-sm font-medium">A fresh start.</p><p className="mt-1 text-sm text-muted-foreground">Your vault is ready for its first entry.</p></div>
                  <Button asChild size="sm" className="mt-1 gap-2"><Link href="/passwords/new"><Plus className="size-4" aria-hidden /> Add a password</Link></Button>
                </div>
              )}
              {!loading && !error && recent.length > 0 && (
                <ul className="divide-y divide-border/70">
                  {recent.map((entry) => (
                    <li key={`${entry.type}-${entry.id}`}>
                      <Link href={entry.href} className="group flex min-w-0 items-center gap-3 px-4 py-3.5 transition-colors hover:bg-accent/45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring sm:px-5">
                        {entry.type === "password" ? <FaviconImage url={entry.url} siteName={entry.title} size={40} /> : <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#f08cb8]/10 text-[#f08cb8]"><Hash className="size-4" aria-hidden /></div>}
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium group-hover:text-primary">{entry.title}</p>
                          <p className="truncate text-xs text-muted-foreground">{entry.subtitle || "No account label"}</p>
                        </div>
                        <TagBadge tag={entry.tag} />
                        <span className="hidden min-w-[76px] items-center justify-end gap-1 text-[11px] text-muted-foreground sm:flex"><Clock3 className="size-3" aria-hidden />{timeAgo(entry.date)}</span>
                        <ArrowUpRight className="size-4 text-muted-foreground/40 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary" aria-hidden />
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </section>

        <aside className="flex flex-col gap-4">
          <section className="rounded-xl border border-border/80 bg-card/55 p-5">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground"><ShieldCheck className="size-4 text-primary" aria-hidden /> Vault health</div>
            {loading ? <Skeleton className="mt-4 h-14 w-full" /> : (
              <div className="mt-5">
                <div className="flex items-end justify-between gap-3">
                  <p className="text-2xl font-semibold tracking-tight">{weakCount === 0 ? "Looking good" : "Worth a look"}</p>
                  <span className={`text-sm font-medium ${weakCount ? "text-[#f08cb8]" : "text-[#a4d8cb]"}`}>{weakCount} to review</span>
                </div>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{weakCount === 0 ? "No weak passwords detected by your current strength check." : "A few saved passwords may benefit from an update."}</p>
                {weakCount > 0 && <Button asChild variant="outline" size="sm" className="mt-4 rounded-lg"><Link href="/passwords">Review passwords <ArrowUpRight className="ml-1 size-3.5" aria-hidden /></Link></Button>}
              </div>
            )}
          </section>
          <section className="relative overflow-hidden rounded-xl border border-primary/20 bg-primary/[0.07] p-5">
            <div className="pointer-events-none absolute -bottom-14 -right-10 size-36 rounded-full bg-primary/10 blur-2xl" aria-hidden />
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">Quick access</p>
            <h2 className="mt-2 text-lg font-semibold tracking-tight">Need a stronger key?</h2>
            <p className="mt-1.5 text-sm leading-6 text-muted-foreground">Create a unique password in seconds with your built-in generator.</p>
            <Button asChild variant="outline" size="sm" className="relative mt-4 gap-2 rounded-lg border-primary/25 bg-background/70"><Link href="/generator">Open generator <ArrowUpRight className="size-3.5" aria-hidden /></Link></Button>
          </section>
        </aside>
      </div>
    </div>
  )
}

function Metric({ label, value, icon, tone = "default" }: { label: string; value?: number; icon: React.ReactNode; tone?: "default" | "good" | "warn" }) {
  const toneClass = tone === "good" ? "text-[#a4d8cb]" : tone === "warn" ? "text-[#f08cb8]" : "text-primary"
  return (
    <div className="flex flex-col items-start gap-2 px-4 first:pl-0 last:pr-0 sm:px-6">
      <div className={`flex items-center gap-1.5 text-[11px] text-muted-foreground ${toneClass}`}><span>{icon}</span><span className="whitespace-nowrap">{label}</span></div>
      <p className="text-2xl font-semibold tabular-nums tracking-tight">{typeof value === "number" ? value : <Skeleton className="h-7 w-10" />}</p>
    </div>
  )
}
