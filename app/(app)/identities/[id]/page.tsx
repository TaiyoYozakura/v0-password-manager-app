"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, AtSign, Globe2, Pencil, Search } from "lucide-react"
import { useVaultData } from "@/lib/use-vault-data"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Spinner } from "@/components/ui/spinner"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function IdentityDetailPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const { identities, passwords, loading, error } = useVaultData()
  const [search, setSearch] = useState("")
  const [tagFilter, setTagFilter] = useState("all")
  const identity = identities.find((item) => item.id === params.id)
  const accounts = passwords.filter((entry) => entry.emailIdentityId === params.id)
  const tags = useMemo(() => [...new Set(accounts.map((account) => account.tag))].sort(), [accounts])
  const visibleAccounts = useMemo(() => {
    const needle = search.trim().toLowerCase()
    return accounts.filter((account) => {
      const matchesTag = tagFilter === "all" || account.tag === tagFilter
      const matchesSearch = !needle || [account.siteName, account.siteUrl, account.email, account.username].some((value) => value.toLowerCase().includes(needle))
      return matchesTag && matchesSearch
    })
  }, [accounts, search, tagFilter])

  if (loading) return <div className="flex min-h-60 items-center justify-center"><Spinner className="size-5" /></div>
  if (error) return <section className="mx-auto max-w-4xl px-4 py-8"><p role="alert" className="text-sm text-destructive">Could not load this encrypted identity.</p></section>
  if (!identity) return <section className="mx-auto flex max-w-4xl flex-col gap-4 px-4 py-8"><p>Email identity not found.</p><Button variant="outline" className="w-fit" onClick={() => router.push("/identities")}>Back to identities</Button></section>

  return <section className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-6 md:px-8 md:py-10">
    <Button variant="ghost" className="w-fit gap-2" onClick={() => router.back()}><ArrowLeft aria-hidden />Back</Button>
    {!identity.integrityOk && <p role="alert" className="text-sm text-destructive">This identity failed its integrity check. Review it before relying on these details.</p>}
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-3"><span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"><AtSign aria-hidden /></span><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><CardTitle className="text-xl">{identity.name}</CardTitle><Badge variant="secondary">{identity.category || "Other"}</Badge></div><p className="mt-1 break-all text-sm text-muted-foreground">{identity.email}</p></div></div>
        <Button asChild variant="outline" size="sm" className="gap-2"><Link href="/identities"><Pencil aria-hidden />Manage</Link></Button>
      </CardHeader>
      {identity.notes && <CardContent className="border-t border-border pt-4 text-sm text-muted-foreground">{identity.notes}</CardContent>}
    </Card>
    <div className="flex items-center justify-between"><div><h2 className="text-lg font-semibold">Linked website accounts</h2><p className="text-sm text-muted-foreground">Only accounts explicitly linked to this identity appear here.</p></div><Badge variant="secondary">{accounts.length}</Badge></div>
    {accounts.length > 0 && <div className="grid gap-3 sm:grid-cols-[1fr_minmax(12rem,0.45fr)]"><div className="relative"><Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden /><Input aria-label="Search associated accounts" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search websites, email, or username" className="pl-9" /></div><Select value={tagFilter} onValueChange={setTagFilter}><SelectTrigger aria-label="Filter accounts by category"><SelectValue placeholder="All categories" /></SelectTrigger><SelectContent><SelectGroup><SelectItem value="all">All categories</SelectItem>{tags.map((tag) => <SelectItem key={tag} value={tag}>{tag}</SelectItem>)}</SelectGroup></SelectContent></Select></div>}
    {visibleAccounts.length === 0 ? <Card><CardContent className="p-8 text-center text-sm text-muted-foreground">{accounts.length ? "No accounts match these filters." : "No website accounts are linked yet. Edit a password entry to select this identity."}</CardContent></Card> : <div className="grid gap-3 sm:grid-cols-2">{visibleAccounts.map((account) => <Link key={account.id} href={`/passwords/${account.id}`} className="rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"><Card className="h-full transition-colors hover:border-primary/35"><CardContent className="flex items-center gap-3 p-4"><Globe2 className="size-5 shrink-0 text-muted-foreground" aria-hidden /><span className="min-w-0 flex-1"><span className="block truncate text-sm font-medium">{account.siteName}</span><span className="block truncate text-xs text-muted-foreground">{account.email || account.username || account.siteUrl || "Saved account"}</span></span></CardContent></Card></Link>)}</div>}
  </section>
}
