"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { useRouter } from "next/navigation"
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
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import { TagSelector } from "@/components/vault/tag-selector"
import { SavedPasswordTrigger } from "@/components/vault/saved-password-trigger"
import { SavedPasswordsList } from "@/components/vault/saved-passwords-list"
import { SavePasswordPrompt } from "@/components/vault/save-password-prompt"
import type { DecryptedPasswordEntry } from "@/lib/types"

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
  const [savedPasswords, setSavedPasswords] = useState<DecryptedPasswordEntry[]>([])
  const [showSavedList, setShowSavedList] = useState(false)
  const [showSavePrompt, setShowSavePrompt] = useState(false)
  const [originalData, setOriginalData] = useState<Partial<PasswordInput> | null>(null)

  // Form state
  const [siteName, setSiteName] = useState("")
  const [siteUrl, setSiteUrl] = useState("")
  const [email, setEmail] = useState("")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [tag, setTag] = useState<string>("Other")
  const [customTag, setCustomTag] = useState("")
  const [tagIconUrl, setTagIconUrl] = useState<string | undefined>()
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
        const [allForTags, entry] = await Promise.all([
          listPasswords(user.uid, key),
          mode === "edit" && id ? getPassword(user.uid, id, key) : Promise.resolve(null),
        ])
        if (!active) return
        setSavedPasswords(allForTags)
        const tags = Array.from(new Set([...DEFAULT_TAGS, ...allForTags.map((e) => e.tag)]))
        setExistingTags(tags)

        if (mode === "edit" && entry && !initializedRef.current) {
          initializedRef.current = true
          setSiteName(entry.siteName)
          setSiteUrl(entry.siteUrl)
          setEmail(entry.email)
          setUsername(entry.username)
          setPassword(entry.password)
          setNotes(entry.notes)
          setTagIconUrl(entry.tagIconUrl)
          // Store original data for change detection
          setOriginalData({
            siteName: entry.siteName,
            siteUrl: entry.siteUrl,
            email: entry.email,
            username: entry.username,
            password: entry.password,
            notes: entry.notes,
            tag: entry.tag,
            tagIconUrl: entry.tagIconUrl,
          })
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

  // Check if form data has changed from original
  const hasChanged = () => {
    if (mode === "create") return true // Always show prompt for new passwords
    if (!originalData) return false

    const finalTag = usingCustomTag ? sanitizeText(customTag, LIMITS.tag) || "Other" : tag || "Other"

    return (
      originalData.password !== password ||
      originalData.siteName !== siteName ||
      originalData.siteUrl !== siteUrl ||
      originalData.email !== email ||
      originalData.username !== username ||
      originalData.notes !== notes ||
      originalData.tag !== finalTag
    )
  }

  const performSave = async (input: PasswordInput) => {
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
      tagIconUrl: tagIconUrl,
      password: sanitizeSecret(password, LIMITS.password),
      username: sanitizeText(username, LIMITS.username),
      email: sanitizeText(email, LIMITS.email),
      notes: sanitizeText(notes, LIMITS.notes),
    }

    // Show save prompt if data has changed
    if (hasChanged()) {
      setShowSavePrompt(true)
      // Store input for use in prompt confirmation
      ;(window as any).__pendingPasswordInput = input
    } else {
      toast.info("No changes to save")
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
            <div className="relative">
              <Input
                id="siteName"
                required
                maxLength={LIMITS.siteName}
                value={siteName}
                onChange={(e) => setSiteName(e.target.value)}
                placeholder="e.g. GitHub"
                autoComplete="off"
                className="pr-10"
              />
              <div className="absolute right-1 top-1/2 -translate-y-1/2">
                <SavedPasswordTrigger onClick={() => setShowSavedList(!showSavedList)} />
              </div>
              {/* Saved Passwords List */}
              <SavedPasswordsList
                entries={savedPasswords}
                open={showSavedList}
                onOpenChange={setShowSavedList}
                onSelect={(entry) => {
                  setSiteName(entry.siteName)
                  setSiteUrl(entry.siteUrl)
                  setEmail(entry.email)
                  setUsername(entry.username)
                  setPassword(entry.password)
                  setNotes(entry.notes)
                  if (existingTags.includes(entry.tag)) {
                    setTag(entry.tag)
                    setUsingCustomTag(false)
                  } else {
                    setCustomTag(entry.tag)
                    setUsingCustomTag(true)
                  }
                  setTagIconUrl(entry.tagIconUrl)
                }}
              />
            </div>
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
            <TagSelector
              tags={tagOptions}
              value={usingCustomTag ? customTag : tag}
              onSelect={(selectedTag, iconUrl) => {
                // Check if it's in existing tags or is new
                const isExisting = tagOptions.includes(selectedTag)
                if (isExisting) {
                  setTag(selectedTag)
                  setUsingCustomTag(false)
                  setTagIconUrl(undefined)
                } else {
                  setCustomTag(selectedTag)
                  setUsingCustomTag(true)
                  setTagIconUrl(iconUrl)
                }
              }}
              className="relative z-10"
            />
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

      {/* Save Password Prompt */}
      <SavePasswordPrompt
        open={showSavePrompt}
        onOpenChange={setShowSavePrompt}
        onConfirm={async () => {
          const pendingInput = (window as any).__pendingPasswordInput
          if (pendingInput) {
            await performSave(pendingInput)
            setShowSavePrompt(false)
          }
        }}
        siteName={siteName}
      />
    </form>
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
