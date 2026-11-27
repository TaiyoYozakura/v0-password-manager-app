"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import toast from "react-hot-toast"
import { Eye, EyeOff, Wand2, Save, ArrowLeft } from "lucide-react"
import { useAuth } from "@/components/providers/auth-provider"
import {
  createPassword,
  getPassword,
  listPasswords,
  updatePassword,
  type PasswordInput,
} from "@/lib/firebase/passwords"
import { DEFAULT_TAGS } from "@/lib/types"
import { createEmailIdentity, listEmailIdentities, updateEmailIdentity, type EmailIdentity, type EmailIdentityInput } from "@/lib/firebase/email-identities"
import { LIMITS, isValidUrl, sanitizeSecret, sanitizeText } from "@/lib/utils/sanitize"
import { generatePassword } from "@/lib/crypto/generate"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import { StrengthBar } from "@/components/vault/strength-bar"
import { FaviconImage } from "@/components/vault/favicon-image"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectGroup,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface Props {
  mode: "create" | "edit"
  id?: string
}

export function PasswordForm({ mode, id }: Props) {
  const router = useRouter()
  const { user, key } = useAuth()

  const [loading, setLoading] = useState(mode === "edit")
  const [saving, setSaving] = useState(false)
  const [existingTags, setExistingTags] = useState<string[]>([])
  const [emailIdentities, setEmailIdentities] = useState<EmailIdentity[]>([])
  const [emailIdentityId, setEmailIdentityId] = useState("")
  const [identityDialogOpen, setIdentityDialogOpen] = useState(false)
  const [identityDialogMode, setIdentityDialogMode] = useState<"create" | "edit">("create")
  const [identitySaving, setIdentitySaving] = useState(false)
  const [newIdentity, setNewIdentity] = useState<EmailIdentityInput>({ name: "", email: "", category: "Personal", notes: "" })

  // Form state
  const [siteName, setSiteName] = useState("")
  const [siteUrl, setSiteUrl] = useState("")
  const [email, setEmail] = useState("")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [tag, setTag] = useState<string>("Other")
  const [customTag, setCustomTag] = useState("")
  const [usingCustomTag, setUsingCustomTag] = useState(false)
  const [notes, setNotes] = useState("")

  // UI state
  const [showPassword, setShowPassword] = useState(false)
  const [showGenerator, setShowGenerator] = useState(false)
  const [genLength, setGenLength] = useState(16)
  const [genUpper, setGenUpper] = useState(true)
  const [genLower, setGenLower] = useState(true)
  const [genNumbers, setGenNumbers] = useState(true)
  const [genSpecial, setGenSpecial] = useState(true)
  const [genExcludeAmbiguous, setGenExcludeAmbiguous] = useState(false)
  const [genPreview, setGenPreview] = useState("")

  const urlValid = !siteUrl || isValidUrl(siteUrl)
  const initializedRef = useRef(false)

  // Load entry for edit + existing tags list
  useEffect(() => {
    if (!user || !key) return
    let active = true
    ;(async () => {
      try {
        const [allForTags, entry, identities] = await Promise.all([
          listPasswords(user.uid, key),
          mode === "edit" && id ? getPassword(user.uid, id, key) : Promise.resolve(null),
          listEmailIdentities(user.uid, key),
        ])
        if (!active) return
        const tags = Array.from(new Set([...DEFAULT_TAGS, ...allForTags.map((e) => e.tag)]))
        setExistingTags(tags)
        setEmailIdentities(identities)

        if (mode === "edit" && entry && !initializedRef.current) {
          initializedRef.current = true
          setSiteName(entry.siteName)
          setSiteUrl(entry.siteUrl)
          setEmail(entry.email)
          setEmailIdentityId(entry.emailIdentityId ?? "")
          setUsername(entry.username)
          setPassword(entry.password)
          setNotes(entry.notes)
          if (tags.includes(entry.tag)) {
            setTag(entry.tag)
            setUsingCustomTag(false)
          } else {
            setCustomTag(entry.tag)
            setUsingCustomTag(true)
          }
        } else if (mode === "edit" && !entry) {
          toast.error("Password not found")
          router.replace("/passwords")
        }
      } catch {
        if (active) toast.error("Failed to load password")
      } finally {
        if (active) setLoading(false)
      }
    })()
    return () => {
      active = false
    }
  }, [mode, id, user, key, router])

  const regeneratePreview = () => {
    const pwd = generatePassword({
      length: genLength,
      uppercase: genUpper,
      lowercase: genLower,
      numbers: genNumbers,
      special: genSpecial,
      excludeAmbiguous: genExcludeAmbiguous,
    })
    setGenPreview(pwd)
  }

  useEffect(() => {
    if (showGenerator) regeneratePreview()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showGenerator, genLength, genUpper, genLower, genNumbers, genSpecial, genExcludeAmbiguous])

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !key) return
    if (!siteName.trim()) {
      toast.error("Site / App name is required")
      return
    }
    if (!password) {
      toast.error("Password is required")
      return
    }
    if (siteUrl && !urlValid) {
      toast.error("Invalid URL format")
      return
    }

    const finalTag = usingCustomTag
      ? sanitizeText(customTag, LIMITS.tag) || "Other"
      : tag || "Other"

    const input: PasswordInput = {
      siteName: sanitizeText(siteName, LIMITS.siteName),
      siteUrl: sanitizeText(siteUrl, LIMITS.url),
      tag: finalTag,
      password: sanitizeSecret(password, LIMITS.password),
      username: sanitizeText(username, LIMITS.username),
      email: sanitizeText(email, LIMITS.email),
      emailIdentityId: emailIdentityId || undefined,
      notes: sanitizeText(notes, LIMITS.notes),
    }

    setSaving(true)
    try {
      if (mode === "create") {
        await createPassword(user.uid, input, key)
        toast.success("Password saved")
      } else if (id) {
        await updatePassword(user.uid, id, input, key)
        toast.success("Password updated")
      }
      router.replace("/passwords")
    } catch {
      toast.error("Could not save password")
    } finally {
      setSaving(false)
    }
  }

  const selectedIdentity = emailIdentities.find((identity) => identity.id === emailIdentityId)

  const openCreateIdentity = () => {
    setNewIdentity({ name: "", email: "", category: "Personal", notes: "" })
    setIdentityDialogMode("create")
    setIdentityDialogOpen(true)
  }

  const openEditIdentity = () => {
    if (!selectedIdentity) return
    setNewIdentity({ name: selectedIdentity.name, email: selectedIdentity.email, category: selectedIdentity.category, notes: selectedIdentity.notes })
    setIdentityDialogMode("edit")
    setIdentityDialogOpen(true)
  }

  const saveIdentity = async () => {
    if (!user || !key) return
    const input: EmailIdentityInput = {
      name: sanitizeText(newIdentity.name, LIMITS.label),
      email: sanitizeText(newIdentity.email, LIMITS.email),
      category: sanitizeText(newIdentity.category, LIMITS.category),
      notes: sanitizeText(newIdentity.notes, LIMITS.notes),
    }
    if (!input.name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email)) {
      toast.error("Enter a display name and a valid email address")
      return
    }
    setIdentitySaving(true)
    try {
      let identityId: string
      if (identityDialogMode === "edit") {
        if (!selectedIdentity) {
          toast.error("Select an identity to edit")
          return
        }
        await updateEmailIdentity(user.uid, selectedIdentity.id, input, key)
        identityId = selectedIdentity.id
      } else {
        identityId = await createEmailIdentity(user.uid, input, key)
      }
      const updatedIdentities = await listEmailIdentities(user.uid, key)
      setEmailIdentities(updatedIdentities)
      setEmailIdentityId(identityId)
      setIdentityDialogOpen(false)
      setNewIdentity({ name: "", email: "", category: "Personal", notes: "" })
      toast.success(identityDialogMode === "edit" ? "Identity updated" : "Identity created and selected")
    } catch {
      toast.error("Could not create email identity")
    } finally {
      setIdentitySaving(false)
    }
  }

  const tagOptions = useMemo(() => existingTags, [existingTags])

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Spinner className="size-5" />
      </div>
    )
  }

  return (
    <>
    <form onSubmit={onSave} className="mx-auto w-full max-w-3xl px-4 py-6 md:px-8 md:py-10">
      <div className="mb-6 flex items-center gap-3">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
          aria-label="Back"
        >
          <ArrowLeft className="size-4" />
        </Button>
        <div>
          <h1 className="text-pretty text-2xl font-semibold tracking-tight">
            {mode === "create" ? "Add Password" : "Edit Password"}
          </h1>
          <p className="text-sm text-muted-foreground">
            All sensitive fields are encrypted with AES-256 on your device before saving.
          </p>
        </div>
      </div>

      <Card>
        <CardContent className="flex flex-col gap-5 p-5 md:p-6">
          {/* Website URL */}
          <div className="grid gap-2">
            <Label htmlFor="siteUrl">Website URL</Label>
            <div className="flex items-center gap-3">
              <FaviconImage url={siteUrl} siteName={siteName} size={40} />
              <Input
                id="siteUrl"
                type="url"
                inputMode="url"
                placeholder="https://example.com"
                maxLength={LIMITS.url}
                value={siteUrl}
                onChange={(e) => setSiteUrl(e.target.value)}
                aria-invalid={!urlValid}
                aria-describedby="siteUrl-help"
              />
            </div>
            <p id="siteUrl-help" className="text-xs text-muted-foreground">
              {siteUrl && !urlValid ? (
                <span className="text-destructive">Doesn&apos;t look like a valid URL.</span>
              ) : (
                "Optional. We'll try to fetch the site's favicon."
              )}
            </p>
          </div>

          {/* Site Name */}
          <div className="grid gap-2">
            <Label htmlFor="siteName">
              Site / App Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="siteName"
              required
              maxLength={LIMITS.siteName}
              value={siteName}
              onChange={(e) => setSiteName(e.target.value)}
              placeholder="e.g. GitHub"
              autoComplete="off"
            />
          </div>

          {/* Email + Username */}
          <div className="grid gap-5 md:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                inputMode="email"
                maxLength={LIMITS.email}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="off"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                maxLength={LIMITS.username}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Optional"
                autoComplete="off"
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="emailIdentity">Email identity</Label>
            <Select value={emailIdentityId || "__none__"} onValueChange={(value) => setEmailIdentityId(value === "__none__" ? "" : value)}>
              <SelectTrigger id="emailIdentity" aria-label="Link this account to an email identity"><SelectValue placeholder="No identity linked" /></SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="__none__">No identity linked</SelectItem>
                  {emailIdentities.map((identity) => <SelectItem key={identity.id} value={identity.id}>{identity.name} · {identity.email}</SelectItem>)}
                </SelectGroup>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">Optional. Choose which email identity you use to sign in to this account.</p>
            <div className="flex flex-wrap items-center gap-2">
              <Button type="button" variant="outline" size="sm" onClick={openCreateIdentity}>Create identity</Button>
              <Button type="button" variant="ghost" size="sm" onClick={openEditIdentity} disabled={!selectedIdentity}>Edit selected identity</Button>
              <Link href="/identities" className="text-xs text-primary underline-offset-4 hover:underline">Manage identities</Link>
            </div>
          </div>

          {/* Password */}
          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">
                Password <span className="text-destructive">*</span>
              </Label>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => setShowGenerator((v) => !v)}
                className="gap-2"
              >
                <Wand2 className="size-4" aria-hidden />
                {showGenerator ? "Hide generator" : "Generate"}
              </Button>
            </div>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                required
                maxLength={LIMITS.password}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pr-11 font-mono"
                autoComplete="new-password"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-1 top-1 size-8"
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </Button>
            </div>
            <StrengthBar password={password} />

            {showGenerator && (
              <div className="mt-3 rounded-md border border-dashed border-border bg-secondary/40 p-4">
                <div className="grid gap-4">
                  <div>
                    <div className="mb-2 flex items-center justify-between text-sm">
                      <Label htmlFor="genLength">Length</Label>
                      <span className="font-mono text-muted-foreground">{genLength}</span>
                    </div>
                    <Slider
                      id="genLength"
                      min={8}
                      max={64}
                      step={1}
                      value={[genLength]}
                      onValueChange={(v) => setGenLength(v[0])}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    <Toggle checked={genUpper} onChange={setGenUpper} label="Uppercase (A–Z)" />
                    <Toggle checked={genLower} onChange={setGenLower} label="Lowercase (a–z)" />
                    <Toggle checked={genNumbers} onChange={setGenNumbers} label="Numbers (0–9)" />
                    <Toggle checked={genSpecial} onChange={setGenSpecial} label="Special (!@#$...)" />
                    <Toggle
                      checked={genExcludeAmbiguous}
                      onChange={setGenExcludeAmbiguous}
                      label="Exclude 0 O I l 1"
                    />
                  </div>
                  <div className="rounded-md border border-border bg-background p-3 font-mono text-sm break-all">
                    {genPreview || "—"}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button type="button" variant="outline" size="sm" onClick={regeneratePreview}>
                      Regenerate
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => {
                        if (genPreview) {
                          setPassword(genPreview)
                          toast.success("Inserted generated password")
                        }
                      }}
                      disabled={!genPreview}
                    >
                      Use this password
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Tag */}
          <div className="grid gap-2">
            <Label>Tag</Label>
            <div className="flex flex-col gap-2 sm:flex-row">
              {!usingCustomTag ? (
                <Select value={tag} onValueChange={setTag}>
                  <SelectTrigger className="sm:w-[240px]">
                    <SelectValue placeholder="Select tag" />
                  </SelectTrigger>
                  <SelectContent>
                    {tagOptions.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  value={customTag}
                  onChange={(e) => setCustomTag(e.target.value)}
                  placeholder="Type a new tag"
                  maxLength={LIMITS.tag}
                  className="sm:w-[240px]"
                />
              )}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setUsingCustomTag((v) => !v)
                  if (usingCustomTag) setCustomTag("")
                }}
              >
                {usingCustomTag ? "Pick existing" : "Create new tag"}
              </Button>
            </div>
          </div>

          {/* Notes */}
          <div className="grid gap-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              maxLength={LIMITS.notes}
              placeholder="Optional. Recovery questions, hints, etc."
              rows={4}
            />
            <p className="text-right text-xs text-muted-foreground">
              {notes.length} / {LIMITS.notes}
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="mt-6 flex items-center justify-end gap-2">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button type="submit" disabled={saving} className="gap-2">
          {saving ? <Spinner className="size-4" /> : <Save className="size-4" aria-hidden />}
          {mode === "create" ? "Save password" : "Save changes"}
        </Button>
      </div>
    </form>
    <Dialog open={identityDialogOpen} onOpenChange={setIdentityDialogOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{identityDialogMode === "edit" ? "Edit email identity" : "Create an email identity"}</DialogTitle>
          <DialogDescription>Identity details are encrypted on this device. {identityDialogMode === "edit" ? "Changes apply to every account linked to this identity." : "The new identity will be selected for this account."}</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="grid gap-2"><Label htmlFor="quick-identity-name">Display name</Label><Input id="quick-identity-name" autoComplete="off" maxLength={LIMITS.label} required value={newIdentity.name} onChange={(event) => setNewIdentity({ ...newIdentity, name: event.target.value })} placeholder="Personal email" /></div>
          <div className="grid gap-2"><Label htmlFor="quick-identity-email">Email address</Label><Input id="quick-identity-email" type="email" autoComplete="off" maxLength={LIMITS.email} required value={newIdentity.email} onChange={(event) => setNewIdentity({ ...newIdentity, email: event.target.value })} placeholder="you@example.com" /></div>
          <div className="grid gap-2"><Label htmlFor="quick-identity-category">Category</Label><Input id="quick-identity-category" maxLength={LIMITS.category} value={newIdentity.category} onChange={(event) => setNewIdentity({ ...newIdentity, category: event.target.value })} placeholder="Personal, work, recovery..." /></div>
          <div className="grid gap-2"><Label htmlFor="quick-identity-notes">Description / notes</Label><Textarea id="quick-identity-notes" maxLength={LIMITS.notes} rows={3} value={newIdentity.notes} onChange={(event) => setNewIdentity({ ...newIdentity, notes: event.target.value })} placeholder="Optional details" /></div>
          <div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => setIdentityDialogOpen(false)}>Cancel</Button><Button type="button" disabled={identitySaving} onClick={() => void saveIdentity()}>{identitySaving ? <Spinner className="size-4" /> : identityDialogMode === "edit" ? "Save identity" : "Create and select"}</Button></div>
        </div>
      </DialogContent>
    </Dialog>
    </>
  )
}

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean
  onChange: (v: boolean) => void
  label: string
}) {
  const id = `toggle-${label.replace(/\s+/g, "-")}`
  return (
    <label htmlFor={id} className="flex cursor-pointer items-center gap-2 text-sm">
      <Checkbox id={id} checked={checked} onCheckedChange={(v) => onChange(Boolean(v))} />
      <span>{label}</span>
    </label>
  )
}
