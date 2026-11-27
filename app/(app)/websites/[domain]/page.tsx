"use client"

import { useMemo } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { ArrowLeft, ExternalLink, KeyRound } from "lucide-react"
import { useVaultData } from "@/lib/use-vault-data"
import { getNormalizedDomain } from "@/lib/utils/sanitize"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Spinner } from "@/components/ui/spinner"
import { FaviconImage } from "@/components/vault/favicon-image"

export default function WebsiteAccountsPage() {
  const { domain: rawDomain } = useParams<{ domain: string }>()
  const domain = decodeURIComponent(rawDomain)
  const { passwords, identities, loading, error } = useVaultData()
  const accounts = useMemo(
    () => passwords.filter((account) => (getNormalizedDomain(account.siteUrl) || "unassigned") === domain),
    [passwords, domain],
  )
  const title = domain === "unassigned" ? "Unassigned website" : domain
  const faviconUrl = accounts[0]?.siteUrl ?? (domain === "unassigned" ? "" : `https://${domain}`)

  if (loading) return <div className="flex min-h-60 items-center justify-center"><Spinner className="size-5" /></div>

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-6 md:px-8 md:py-10">
      <header className="flex flex-wrap items-center gap-4">
        <Button asChild variant="ghost" size="icon" aria-label="Back to websites"><Link href="/websites"><ArrowLeft aria-hidden /></Link></Button>
        <FaviconImage url={faviconUrl} siteName={title} size={44} />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-primary">WEBSITE ACCOUNTS</p>
          <h1 className="truncate text-2xl font-semibold tracking-tight">{title}</h1>
          <p className="text-sm text-muted-foreground">{domain === "unassigned" ? "Credentials without a valid website URL" : `${accounts.length} saved account${accounts.length === 1 ? "" : "s"}`}</p>
        </div>
        {domain !== "unassigned" && <Button asChild variant="outline" size="sm"><a href={`https://${domain}`} target="_blank" rel="noreferrer">Open website <ExternalLink data-icon="inline-end" aria-hidden /></a></Button>}
      </header>

      {error && <p role="alert" className="text-sm text-destructive">Could not load your vault. Try refreshing this page.</p>}
      {accounts.length === 0 ? (
        <Card><CardContent className="flex flex-col items-center gap-3 p-10 text-center"><KeyRound className="size-8 text-muted-foreground" aria-hidden /><h2 className="font-medium">No accounts in this group</h2><Button asChild variant="outline"><Link href="/websites">Return to websites</Link></Button></CardContent></Card>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {accounts.map((account) => {
            const identity = identities.find((item) => item.id === account.emailIdentityId)
            return (
              <Card key={account.id}>
                <CardHeader className="flex flex-row items-center gap-3 space-y-0 pb-3">
                  <KeyRound className="size-5 shrink-0 text-muted-foreground" aria-hidden />
                  <div className="min-w-0 flex-1"><CardTitle className="truncate text-base">{account.email || account.username || "Account"}</CardTitle><p className="truncate text-sm text-muted-foreground">{account.siteName}</p></div>
                  <Badge variant="secondary">{account.tag}</Badge>
                </CardHeader>
                <CardContent className="flex flex-wrap items-center justify-between gap-3">
                  <div className="min-w-0 text-sm">{identity ? <Link href={`/identities/${identity.id}`} className="text-primary underline-offset-4 hover:underline">{identity.name}</Link> : <span className="text-muted-foreground">No email identity linked</span>}</div>
                  <Button asChild size="sm"><Link href={`/passwords/${account.id}`}>View credentials</Link></Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </main>
  )
}
