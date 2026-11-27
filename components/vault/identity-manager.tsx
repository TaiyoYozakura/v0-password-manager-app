"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { AtSign, LockKeyhole, Pencil, Plus, Search, Trash2 } from "lucide-react"
import toast from "react-hot-toast"
import { useAuth } from "@/components/providers/auth-provider"
import {
  createEmailIdentity,
  deleteEmailIdentity,
  updateEmailIdentity,
  type EmailIdentity,
  type EmailIdentityInput,
} from "@/lib/firebase/email-identities"
import { useVaultData } from "@/lib/use-vault-data"
import { LIMITS, sanitizeText } from "@/lib/utils/sanitize"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Spinner } from "@/components/ui/spinner"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

const emptyIdentity: EmailIdentityInput = { name: "", email: "", category: "Personal", notes: "" }

export function IdentityManager() {
  const { user, key } = useAuth()
  const { identities, passwords, loading, error, reload } = useVaultData()
  const [search, setSearch] = useState("")
  const [editing, setEditing] = useState<EmailIdentity | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<EmailIdentityInput>(emptyIdentity)

  const visibleIdentities = useMemo(() => {
    const needle = search.trim().toLowerCase()
    return identities.filter((identity) =>
      !needle || [identity.name, identity.email, identity.category, identity.notes].some((value) => value.toLowerCase().includes(needle)),
    )
  }, [identities, search])

  const openCreate = () => {
    setEditing(null)
    setForm(emptyIdentity)
    setDialogOpen(true)
  }

  const openEdit = (identity: EmailIdentity) => {
    setEditing(identity)
    setForm({ name: identity.name, email: identity.email, category: identity.category, notes: identity.notes })
    setDialogOpen(true)
  }

  const save = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!user || !key) return
    const input: EmailIdentityInput = {
      name: sanitizeText(form.name, LIMITS.label),
      email: sanitizeText(form.email, LIMITS.email),
      category: sanitizeText(form.category, LIMITS.category),
      notes: sanitizeText(form.notes, LIMITS.notes),
    }
    if (!input.name || !input.email) {
      toast.error("Name and email are required")
      return
    }
    setSaving(true)
    try {
      if (editing) await updateEmailIdentity(user.uid, editing.id, input, key)
      else await createEmailIdentity(user.uid, input, key)
      setDialogOpen(false)
      reload()
      toast.success(editing ? "Email identity updated" : "Email identity added")
    } catch {
      toast.error("Could not save email identity")
    } finally {
      setSaving(false)
    }
  }

  const remove = async (identity: EmailIdentity) => {
    if (!user || !window.confirm(`Delete ${identity.name}? Linked accounts will become unassigned.`)) return
    try {
      await deleteEmailIdentity(user.uid, identity.id)
      reload()
      toast.success("Email identity deleted")
    } catch {
      toast.error("Could not delete email identity")
    }
  }

  if (loading) return <div className="flex min-h-60 items-center justify-center"><Spinner className="size-5" /></div>

  return (
    <section className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-6 md:px-8 md:py-10">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-primary">VAULT ORGANIZATION</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">Email identities</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">Keep the email accounts you use for sign-ins organized, then link each identity to its website accounts.</p>
        </div>
        <Button onClick={openCreate} className="gap-2"><Plus aria-hidden />Add identity</Button>
      </header>

      <Card className="border-primary/15 bg-primary/[0.03]">
        <CardContent className="flex items-start gap-3 p-4">
          <LockKeyhole className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
          <p className="text-sm text-muted-foreground">Identity names, email addresses, categories, and notes are encrypted on this device before they reach Firestore. Links use an opaque ID and never copy a password.</p>
        </CardContent>
      </Card>

      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
        <Input aria-label="Search email identities" placeholder="Search names, emails, categories..." value={search} onChange={(event) => setSearch(event.target.value)} className="pl-9" />
      </div>

      {error && <p role="alert" className="text-sm text-destructive">Could not load your encrypted vault data. Try refreshing this page.</p>}
      {visibleIdentities.length === 0 ? (
        <Card><CardContent className="flex flex-col items-center gap-3 p-10 text-center">
          <span className="flex size-12 items-center justify-center rounded-full bg-secondary"><AtSign className="size-5 text-muted-foreground" aria-hidden /></span>
          <h2 className="text-lg font-medium">{search ? "No identities match" : "No email identities yet"}</h2>
          <p className="max-w-md text-sm text-muted-foreground">{search ? "Try a different search." : "Add an identity to connect the emails you use with your website accounts."}</p>
          {!search && <Button variant="outline" onClick={openCreate} className="gap-2"><Plus aria-hidden />Create your first identity</Button>}
        </CardContent></Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {visibleIdentities.map((identity) => {
            const accountCount = passwords.filter((password) => password.emailIdentityId === identity.id).length
            return <Card key={identity.id} className="transition-colors hover:border-primary/35">
              <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0 pb-2">
                <div className="min-w-0">
                  <CardTitle className="truncate text-base">{identity.name}</CardTitle>
                  <p className="mt-1 truncate text-sm text-muted-foreground">{identity.email}</p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <Badge variant="secondary">{identity.category || "Other"}</Badge>
                  {!identity.integrityOk && <Badge variant="destructive">Integrity check failed</Badge>}
                </div>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                {identity.notes && <p className="line-clamp-2 text-sm text-muted-foreground">{identity.notes}</p>}
                <div className="flex items-center justify-between gap-3 border-t border-border pt-3">
                  <Link href={`/identities/${identity.id}`} className="text-sm text-primary underline-offset-4 hover:underline">{accountCount} linked {accountCount === 1 ? "account" : "accounts"}</Link>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" aria-label={`Edit ${identity.name}`} onClick={() => openEdit(identity)}><Pencil aria-hidden /></Button>
                    <Button variant="ghost" size="icon" aria-label={`Delete ${identity.name}`} onClick={() => void remove(identity)}><Trash2 aria-hidden /></Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          })}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit email identity" : "Add email identity"}</DialogTitle>
            <DialogDescription>Identity details are encrypted locally before saving.</DialogDescription>
          </DialogHeader>
          <form onSubmit={save} className="flex flex-col gap-4">
            <div className="grid gap-2"><Label htmlFor="identity-name">Display name</Label><Input id="identity-name" autoComplete="off" maxLength={LIMITS.label} required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Personal email" /></div>
            <div className="grid gap-2"><Label htmlFor="identity-email">Email address</Label><Input id="identity-email" type="email" autoComplete="off" maxLength={LIMITS.email} required value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} placeholder="you@example.com" /></div>
            <div className="grid gap-2"><Label htmlFor="identity-category">Category</Label><Input id="identity-category" maxLength={LIMITS.category} value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} placeholder="Personal, work, recovery..." /></div>
            <div className="grid gap-2"><Label htmlFor="identity-notes">Notes</Label><Textarea id="identity-notes" maxLength={LIMITS.notes} rows={3} value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} placeholder="Optional notes" /></div>
            <div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button><Button type="submit" disabled={saving}>{saving ? <Spinner className="size-4" /> : editing ? "Save changes" : "Add identity"}</Button></div>
          </form>
        </DialogContent>
      </Dialog>
    </section>
  )
}
