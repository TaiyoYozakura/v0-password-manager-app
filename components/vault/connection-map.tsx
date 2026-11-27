"use client"

import { useMemo, useRef, useState } from "react"
import Link from "next/link"
import { AtSign, Globe2, Link2, Minus, Plus, RotateCcw, Search } from "lucide-react"
import { useVaultData } from "@/lib/use-vault-data"
import { getHostname, getNormalizedDomain } from "@/lib/utils/sanitize"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type Account = ReturnType<typeof useVaultData>["passwords"][number]
type SiteGroup = { key: string; label: string; host: string; accounts: Account[] }
type DragState = { pointerId: number; x: number; y: number; nodeId?: string }
type NodeOffset = { x: number; y: number }

function getSiteKey(account: Account) {
  return getNormalizedDomain(account.siteUrl) || "unassigned"
}

export function ConnectionMap() {
  const { identities, passwords, loading, error } = useVaultData()
  const [scale, setScale] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [nodeOffsets, setNodeOffsets] = useState<Record<string, NodeOffset>>({})
  const [dragging, setDragging] = useState(false)
  const dragRef = useRef<DragState | null>(null)
  const [search, setSearch] = useState("")
  const [identityFilter, setIdentityFilter] = useState("all")

  const sites = useMemo<SiteGroup[]>(() => {
    const grouped = new Map<string, SiteGroup>()
    for (const account of passwords) {
      const key = getSiteKey(account)
      const host = getNormalizedDomain(account.siteUrl)
      const group = grouped.get(key) ?? {
        key,
        label: host ? (account.siteName || host) : "Unassigned website",
        host,
        accounts: [],
      }
      group.accounts.push(account)
      grouped.set(key, group)
    }
    return [...grouped.values()].sort((a, b) => a.label.localeCompare(b.label))
  }, [passwords])

  const identityById = useMemo(() => new Map(identities.map((identity) => [identity.id, identity])), [identities])
  const needle = search.trim().toLowerCase()
  const identityMatchesSearch = (identity: (typeof identities)[number]) =>
    !needle || [identity.name, identity.email, identity.category, identity.notes].some((value) => value.toLowerCase().includes(needle))
  const siteMatchesSearch = (site: SiteGroup) =>
    !needle || [site.label, site.host, ...site.accounts.flatMap((account) => [account.siteName, account.email, account.username])].some((value) => value.toLowerCase().includes(needle))
  const matchingIdentityIds = new Set(identities.filter(identityMatchesSearch).map((identity) => identity.id))
  const matchingSiteKeys = new Set(sites.filter(siteMatchesSearch).map((site) => site.key))
  const filteredIdentities = identities.filter((identity) => {
    if (identityFilter !== "all" && identity.id !== identityFilter) return false
    const linkedSiteMatches = passwords.some((account) => account.emailIdentityId === identity.id && matchingSiteKeys.has(getSiteKey(account)))
    return identityMatchesSearch(identity) || linkedSiteMatches
  })
  const filteredSites = sites.filter((site) => {
    const linkedToSelected = identityFilter === "all" || site.accounts.some((account) => account.emailIdentityId === identityFilter)
    const linkedIdentityMatches = site.accounts.some((account) => account.emailIdentityId && matchingIdentityIds.has(account.emailIdentityId))
    return linkedToSelected && (siteMatchesSearch(site) || linkedIdentityMatches)
  })
  const visibleIdentityIds = new Set(filteredIdentities.map((identity) => identity.id))
  const visibleSiteKeys = new Set(filteredSites.map((site) => site.key))
  const connectionCounts = new Map<string, number>()
  for (const account of passwords) {
    const identityId = account.emailIdentityId
    const siteKey = getSiteKey(account)
    if (!identityId || !identityById.has(identityId) || !visibleIdentityIds.has(identityId) || !visibleSiteKeys.has(siteKey)) continue
    const key = `${identityId}::${siteKey}`
    connectionCounts.set(key, (connectionCounts.get(key) ?? 0) + 1)
  }

  if (loading) return <div className="flex min-h-60 items-center justify-center"><Spinner className="size-5" /></div>

  const graphLimit = 80
  const graphIdentities = filteredIdentities.slice(0, graphLimit)
  const graphSites = filteredSites.slice(0, graphLimit)
  const width = 1000
  const rowHeight = 112
  const height = Math.max(400, Math.max(graphIdentities.length, graphSites.length, 1) * rowHeight + 48)
  const identityIndex = new Map(graphIdentities.map((identity, index) => [identity.id, index]))
  const siteIndex = new Map(graphSites.map((site, index) => [site.key, index]))
  const identityX = 170
  const siteX = 820
  const nodeWidth = 230
  const nodeHeight = 68
  const identityY = (index: number) => 40 + index * rowHeight
  const siteY = (index: number) => 40 + index * rowHeight
  const identityPosition = (id: string, index: number) => {
    const offset = nodeOffsets[`identity:${id}`] ?? { x: 0, y: 0 }
    return { x: identityX + offset.x, y: identityY(index) + offset.y }
  }
  const sitePosition = (key: string, index: number) => {
    const offset = nodeOffsets[`site:${key}`] ?? { x: 0, y: 0 }
    return { x: siteX + offset.x, y: siteY(index) + offset.y }
  }

  const startNodeDrag = (event: React.PointerEvent<SVGCircleElement>, nodeId: string) => {
    event.stopPropagation()
    const svg = event.currentTarget.ownerSVGElement
    if (!svg) return
    dragRef.current = { pointerId: event.pointerId, x: event.clientX, y: event.clientY, nodeId }
    setDragging(true)
    svg.setPointerCapture(event.pointerId)
    event.preventDefault()
  }

  const moveNodeByKeyboard = (nodeId: string, event: React.KeyboardEvent<SVGCircleElement>) => {
    const delta = event.shiftKey ? 24 : 12
    const movement = {
      ArrowLeft: { x: -delta, y: 0 },
      ArrowRight: { x: delta, y: 0 },
      ArrowUp: { x: 0, y: -delta },
      ArrowDown: { x: 0, y: delta },
    }[event.key]
    if (!movement) return
    event.preventDefault()
    setNodeOffsets((current) => {
      const offset = current[nodeId] ?? { x: 0, y: 0 }
      return { ...current, [nodeId]: { x: offset.x + movement.x, y: offset.y + movement.y } }
    })
  }

  const onPointerDown = (event: React.PointerEvent<SVGSVGElement>) => {
    const target = event.target
    if (target instanceof Element && target.closest("[data-map-node], [data-drag-node]")) return
    dragRef.current = { pointerId: event.pointerId, x: event.clientX, y: event.clientY }
    setDragging(true)
    event.currentTarget.setPointerCapture(event.pointerId)
    event.preventDefault()
  }

  const onPointerMove = (event: React.PointerEvent<SVGSVGElement>) => {
    const active = dragRef.current
    if (!active || active.pointerId !== event.pointerId) return
    const rect = event.currentTarget.getBoundingClientRect()
    const dx = (event.clientX - active.x) * (width / rect.width)
    const dy = (event.clientY - active.y) * (height / rect.height)
    if (active.nodeId) {
      setNodeOffsets((current) => {
        const offset = current[active.nodeId!] ?? { x: 0, y: 0 }
        return { ...current, [active.nodeId!]: { x: offset.x + dx, y: offset.y + dy } }
      })
    } else {
      setPan((current) => ({ x: current.x + dx, y: current.y + dy }))
    }
    dragRef.current = { ...active, x: event.clientX, y: event.clientY }
  }

  const onPointerUp = (event: React.PointerEvent<SVGSVGElement>) => {
    if (dragRef.current?.pointerId !== event.pointerId) return
    dragRef.current = null
    setDragging(false)
  }

  const resetView = () => {
    setScale(1)
    setPan({ x: 0, y: 0 })
    setNodeOffsets({})
  }

  const linkedCount = passwords.filter((entry) => entry.emailIdentityId && identityById.has(entry.emailIdentityId)).length
  const hasGraphNodes = graphIdentities.length > 0 || graphSites.length > 0

  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 md:px-8 md:py-10">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div><p className="text-sm font-medium text-primary">VAULT RELATIONSHIPS</p><h1 className="mt-1 text-3xl font-semibold tracking-tight">Connection map</h1><p className="mt-2 max-w-2xl text-sm text-muted-foreground">Explore explicit links between encrypted email identities and website accounts. No account is connected automatically based on matching email text.</p></div>
        <div className="flex gap-2"><Button variant="outline" size="icon" aria-label="Zoom out" onClick={() => setScale((value) => Math.max(0.65, value - 0.15))}><Minus aria-hidden /></Button><Button variant="outline" size="icon" aria-label="Zoom in" onClick={() => setScale((value) => Math.min(1.5, value + 0.15))}><Plus aria-hidden /></Button><Button variant="outline" size="icon" aria-label="Reset or recenter map" onClick={resetView}><RotateCcw aria-hidden /></Button></div>
      </header>

      <div className="grid gap-3 sm:grid-cols-[1fr_minmax(14rem,0.55fr)]">
        <div className="relative"><Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden /><Input aria-label="Search identities, websites, or accounts" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search names, email, websites, or accounts" className="pl-9" /></div>
        <Select value={identityFilter} onValueChange={setIdentityFilter}><SelectTrigger aria-label="Filter by email identity"><SelectValue placeholder="Filter by email identity" /></SelectTrigger><SelectContent><SelectGroup><SelectItem value="all">All email identities</SelectItem>{identities.map((identity) => <SelectItem key={identity.id} value={identity.id}>{identity.name} · {identity.email}</SelectItem>)}</SelectGroup></SelectContent></Select>
      </div>
      {error && <p role="alert" className="text-sm text-destructive">Could not load your vault. Try refreshing this page.</p>}
      <div className="flex flex-wrap gap-2 text-sm"><Badge variant="secondary">{identities.length} identities</Badge><Badge variant="secondary">{sites.length} websites</Badge><Badge variant="secondary">{linkedCount} linked accounts</Badge><Badge variant="outline">{filteredIdentities.length + filteredSites.length} filtered nodes</Badge></div>

      <Card className="overflow-hidden">
        <CardHeader className="border-b border-border/70 pb-3"><CardTitle className="text-base">Relationship graph</CardTitle><p className="text-sm text-muted-foreground">Select a node to open it. Drag the canvas to pan or use each node’s handle to reposition it; use the controls to zoom and reset. The searchable list below remains available for large graphs.</p></CardHeader>
        <CardContent className="p-0">
          {!hasGraphNodes ? <div className="flex flex-col items-center gap-3 p-12 text-center"><Link2 className="size-8 text-muted-foreground" aria-hidden /><h2 className="font-medium">{needle || identityFilter !== "all" ? "No matching connections" : "Nothing to map yet"}</h2><p className="max-w-md text-sm text-muted-foreground">{needle || identityFilter !== "all" ? "Clear the search or choose another identity filter." : "Add an email identity and a website account, then link them from the password form."}</p>{!identities.length && <Button asChild variant="outline"><Link href="/identities">Add an identity</Link></Button>}</div> : (
            <div className="max-h-[680px] overflow-auto overscroll-contain">
              <svg viewBox={`0 0 ${width} ${height}`} role="group" aria-label="Graph of email identities connected to websites" className="min-w-[760px] select-none" style={{ height, width: "100%", touchAction: "none", cursor: dragging ? "grabbing" : "grab" }} onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerCancel={onPointerUp}>
                <defs><linearGradient id="connection-line" x1="0" x2="1"><stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.8" /><stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.3" /></linearGradient></defs>
                <g transform={`translate(${pan.x + width * (1 - scale) / 2} ${pan.y + height * (1 - scale) / 2}) scale(${scale})`}>
                  <text x={identityX} y="24" textAnchor="middle" className="fill-muted-foreground" fontSize="12" fontWeight="600">EMAIL IDENTITIES</text>
                  <text x={siteX} y="24" textAnchor="middle" className="fill-muted-foreground" fontSize="12" fontWeight="600">WEBSITES</text>
                  {[...connectionCounts.entries()].map(([pairKey, count]) => {
                    const separator = pairKey.indexOf("::")
                    const identityId = pairKey.slice(0, separator)
                    const siteKey = pairKey.slice(separator + 2)
                    const identityRow = identityIndex.get(identityId)
                    const siteRow = siteIndex.get(siteKey)
                    if (identityRow === undefined || siteRow === undefined) return null
                    const identityNode = identityPosition(identityId, identityRow)
                    const siteNode = sitePosition(siteKey, siteRow)
                    const x1 = identityNode.x + nodeWidth / 2
                    const x2 = siteNode.x - nodeWidth / 2
                    const y1 = identityNode.y + nodeHeight / 2
                    const y2 = siteNode.y + nodeHeight / 2
                    return <g key={pairKey}><path d={`M ${x1} ${y1} C ${x1 + 180} ${y1}, ${x2 - 180} ${y2}, ${x2} ${y2}`} fill="none" stroke="url(#connection-line)" strokeWidth="2" /><rect x={(x1 + x2) / 2 - 34} y={(y1 + y2) / 2 - 13} width="68" height="24" rx="12" className="fill-background stroke-border" /><text x={(x1 + x2) / 2} y={(y1 + y2) / 2 + 4} textAnchor="middle" className="fill-muted-foreground" fontSize="11">{count} {count === 1 ? "account" : "accounts"}</text></g>
                  })}
                  {graphIdentities.map((identity, index) => {
                    const position = identityPosition(identity.id, index)
                    const x = position.x - nodeWidth / 2
                    const y = position.y
                    const dragId = `identity:${identity.id}`
                    return <g key={identity.id}>
                      <a data-map-node="true" href={`/identities/${identity.id}`} aria-label={`Open identity ${identity.name}`}>
                        <title>{identity.name} — {identity.email}</title>
                        <rect x={x} y={y} width={nodeWidth} height={nodeHeight} rx="14" className="fill-card stroke-primary/45" strokeWidth="1.5" />
                        <circle cx={x + 26} cy={y + 34} r="15" className="fill-primary/10" />
                        <foreignObject x={x + 17} y={y + 25} width="18" height="18"><AtSign className="size-4 text-primary" /></foreignObject>
                        <text x={x + 51} y={y + 29} className="fill-card-foreground" fontSize="13" fontWeight="600">{identity.name.slice(0, 22)}</text>
                        <text x={x + 51} y={y + 48} className="fill-muted-foreground" fontSize="11">{identity.email.slice(0, 24)}</text>
                      </a>
                      <circle data-drag-node="true" cx={x + nodeWidth - 14} cy={y + 14} r="7" className="fill-primary stroke-card" strokeWidth="2" cursor="grab" role="button" tabIndex={0} aria-label={`Move ${identity.name} node; use arrow keys to reposition`} onPointerDown={(event) => startNodeDrag(event, dragId)} onKeyDown={(event) => moveNodeByKeyboard(dragId, event)}><title>Drag to reposition or use arrow keys</title></circle>
                    </g>
                  })}
                  {graphSites.map((site, index) => {
                    const position = sitePosition(site.key, index)
                    const x = position.x - nodeWidth / 2
                    const y = position.y
                    const dragId = `site:${site.key}`
                    return <g key={site.key}>
                      <a data-map-node="true" href={`/websites/${encodeURIComponent(site.key)}`} aria-label={`Open website group ${site.label}`}>
                        <title>{site.label} — {site.host || `${site.accounts.length} accounts`}</title>
                        <rect x={x} y={y} width={nodeWidth} height={nodeHeight} rx="14" className="fill-card stroke-border" strokeWidth="1.5" />
                        <circle cx={x + 26} cy={y + 34} r="15" className="fill-secondary" />
                        <foreignObject x={x + 17} y={y + 25} width="18" height="18"><Globe2 className="size-4 text-muted-foreground" /></foreignObject>
                        <text x={x + 51} y={y + 29} className="fill-card-foreground" fontSize="13" fontWeight="600">{site.label.slice(0, 22)}</text>
                        <text x={x + 51} y={y + 48} className="fill-muted-foreground" fontSize="11">{site.host || `${site.accounts.length} accounts`}</text>
                      </a>
                      <circle data-drag-node="true" cx={x + nodeWidth - 14} cy={y + 14} r="7" className="fill-muted-foreground stroke-card" strokeWidth="2" cursor="grab" role="button" tabIndex={0} aria-label={`Move ${site.label} node; use arrow keys to reposition`} onPointerDown={(event) => startNodeDrag(event, dragId)} onKeyDown={(event) => moveNodeByKeyboard(dragId, event)}><title>Drag to reposition or use arrow keys</title></circle>
                    </g>
                  })}
                </g>
              </svg>
            </div>
          )}
          {(filteredIdentities.length > graphLimit || filteredSites.length > graphLimit) && <p className="border-t border-border px-4 py-3 text-xs text-muted-foreground">Showing the first {graphLimit} nodes in each column. Search or filter to narrow the graph; all records remain available below.</p>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Connections and unlinked accounts</CardTitle><p className="text-sm text-muted-foreground">Connections are saved when you select an identity on a password record. Existing records are not auto-linked.</p></CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2">
          {filteredIdentities.slice(0, 40).map((identity) => {
            const identityMatchesSearch = !needle || [identity.name, identity.email, identity.category, identity.notes].some((value) => value.toLowerCase().includes(needle))
            const linked = passwords.filter((account) => account.emailIdentityId === identity.id && (!needle || identityMatchesSearch || [account.siteName, getHostname(account.siteUrl), account.email, account.username].some((value) => value.toLowerCase().includes(needle))))
            return <div key={identity.id} className="rounded-lg border border-border p-4"><div className="flex items-center gap-2"><AtSign className="size-4 text-primary" aria-hidden /><span className="font-medium">{identity.name}</span><Badge variant="secondary">{linked.length}</Badge></div><p className="mt-1 text-xs text-muted-foreground">{identity.email}</p>{linked.length ? <ul className="mt-3 flex flex-col gap-2">{linked.map((account) => <li key={account.id} className="flex items-center justify-between gap-3 text-sm"><Link href={`/passwords/${account.id}`} className="truncate text-primary underline-offset-4 hover:underline">{account.siteName}</Link><span className="truncate text-xs text-muted-foreground">{getHostname(account.siteUrl) || account.email || account.username || "Account"}</span></li>)}</ul> : <p className="mt-3 text-sm text-muted-foreground">No matching linked accounts</p>}</div>
          })}
          {passwords.filter((account) => (!account.emailIdentityId || !identityById.has(account.emailIdentityId)) && (identityFilter === "all" || identityFilter === account.emailIdentityId) && (!needle || [account.siteName, getHostname(account.siteUrl), account.email, account.username].some((value) => value.toLowerCase().includes(needle)))).length > 0 && <div className="rounded-lg border border-dashed border-border p-4 md:col-span-2"><div className="flex items-center gap-2"><Globe2 className="size-4 text-muted-foreground" aria-hidden /><span className="font-medium">Unlinked accounts</span><Badge variant="outline">{passwords.filter((account) => (!account.emailIdentityId || !identityById.has(account.emailIdentityId)) && (!needle || [account.siteName, getHostname(account.siteUrl), account.email, account.username].some((value) => value.toLowerCase().includes(needle)))).length}</Badge></div><ul className="mt-3 grid gap-2 sm:grid-cols-2">{passwords.filter((account) => (!account.emailIdentityId || !identityById.has(account.emailIdentityId)) && (!needle || [account.siteName, getHostname(account.siteUrl), account.email, account.username].some((value) => value.toLowerCase().includes(needle)))).map((account) => <li key={account.id}><Link href={`/passwords/${account.id}`} className="text-sm text-primary underline-offset-4 hover:underline">{account.siteName}</Link></li>)}</ul></div>}
        </CardContent>
      </Card>
    </section>
  )
}
