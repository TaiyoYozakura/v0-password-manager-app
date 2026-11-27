"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { ExternalLink, Globe2, KeyRound, Search } from "lucide-react"
import { useVaultData } from "@/lib/use-vault-data"
import { getNormalizedDomain } from "@/lib/utils/sanitize"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Spinner } from "@/components/ui/spinner"
import { FaviconImage } from "@/components/vault/favicon-image"

export function WebsiteGroups() {
  const { passwords, identities, loading, error } = useVaultData()
  const [search, setSearch] = useState("")

  const groups = useMemo(() => {
    const grouped = new Map<string, typeof passwords>()
    for (const account of passwords) {
      const hostname = getNormalizedDomain(account.siteUrl)
      const key = hostname || "unassigned"
      grouped.set(key, [...(grouped.get(key) ?? []), account])
    }
    return [...grouped.entries()].map(([key, accounts]) => ({
      key,
      title: key === "unassigned" ? "Unassigned website" : accounts[0]?.siteName || key,
      hostname: getNormalizedDomain(accounts[0]?.siteUrl ?? ""),
      accounts,
    })).sort((a, b) => a.title.localeCompare(b.title))
  }, [passwords])

  const visibleGroups = groups.filter((group) => {
    const needle = search.trim().toLowerCase()
    return !needle || [group.title, group.hostname, ...group.accounts.flatMap((entry) => [entry.siteName, entry.email, entry.username])].some((text) => text.toLowerCase().includes(needle))
  })

  if (loading) return <div className="flex min-h-60 items-center justify-center"><Spinner className="size-5" /></div>

  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 md:px-8 md:py-10">
      <header>
        <p className="text-sm font-medium text-primary">ACCOUNT DIRECTORY</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">Websites</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">Browse saved sign-ins by normalized website domain. Common www variants are combined, while other subdomains stay separate. Credentials stay encrypted in your vault and can be opened from each account.</p>
      </header>
      <div className="relative"><Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden /><Input aria-label="Search websites and accounts" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search websites, email, or username..." className="pl-9" /></div>
      {error && <p role="alert" className="text-sm text-destructive">Could not load your vault. Try refreshing this page.</p>}
      <div className="flex flex-wrap gap-2 text-sm text-muted-foreground"><Badge variant="secondary">{groups.filter((group) => group.key !== "unassigned").length} websites</Badge><Badge variant="secondary">{passwords.length} accounts</Badge>{groups.some((group) => group.key === "unassigned") && <Badge variant="outline">{groups.find((group) => group.key === "unassigned")?.accounts.length} unassigned</Badge>}</div>
      {visibleGroups.length === 0 ? <Card><CardContent className="flex flex-col items-center gap-3 p-10 text-center"><Globe2 className="size-8 text-muted-foreground" aria-hidden /><h2 className="font-medium">{search ? "No websites match" : "No saved accounts yet"}</h2><p className="text-sm text-muted-foreground">{search ? "Try a different search." : "Add a password entry to see its website group here."}</p>{!search && <Button asChild variant="outline"><Link href="/passwords/new">Add password</Link></Button>}</CardContent></Card> : (
        <div className="grid gap-4 lg:grid-cols-2">
          {visibleGroups.map((group) => <Card key={group.key}>
            <CardHeader className="flex flex-row items-center gap-3 space-y-0 pb-3">
              <FaviconImage url={group.accounts[0]?.siteUrl ?? ""} siteName={group.title} size={40} />
              <div className="min-w-0 flex-1"><CardTitle className="truncate text-base">{group.title}</CardTitle><p className="truncate text-xs text-muted-foreground">{group.hostname || "No website URL"}</p></div>
              <Badge variant="secondary">{group.accounts.length}</Badge>
              {group.hostname && <Button asChild variant="ghost" size="icon" aria-label={`Open ${group.hostname} website`}><a href={`https://${group.hostname}`} target="_blank" rel="noreferrer"><ExternalLink aria-hidden /></a></Button>}
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              <Button asChild variant="outline" size="sm" className="w-fit"><Link href={`/websites/${encodeURIComponent(group.key)}`}>View {group.accounts.length} accounts</Link></Button>
              {group.accounts.map((account) => {
                const identity = identities.find((item) => item.id === account.emailIdentityId)
                return <Link key={account.id} href={`/passwords/${account.id}`} className="flex min-w-0 items-center gap-3 rounded-lg border border-border/70 p-3 transition-colors hover:bg-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  <KeyRound className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                  <span className="min-w-0 flex-1"><span className="block truncate text-sm font-medium">{account.email || account.username || "Account"}</span><span className="block truncate text-xs text-muted-foreground">{account.siteName}</span></span>
                  {identity && <Badge variant="outline" className="max-w-32 truncate">{identity.name}</Badge>}
                </Link>
              })}
            </CardContent>
          </Card>)}
        </div>
      )}
    </section>
  )
}
