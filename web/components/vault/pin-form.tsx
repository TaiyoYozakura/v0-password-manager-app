"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"
import { ArrowLeft, Eye, EyeOff, Save } from "lucide-react"
import { useAuth } from "@/components/providers/auth-provider"
import { createPin, getPin, updatePin, type PinInput } from "@/lib/firebase/pins"
import { PIN_CATEGORIES } from "@/lib/types"
import { LIMITS, sanitizeSecret, sanitizeText } from "@/lib/utils/sanitize"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Spinner } from "@/components/ui/spinner"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface Props {
  mode: "create" | "edit"
  id?: string
}

export function PinForm({ mode, id }: Props) {
  const router = useRouter()
  const { user, key } = useAuth()

  const [loading, setLoading] = useState(mode === "edit")
  const [saving, setSaving] = useState(false)
  const [label, setLabel] = useState("")
  const [pin, setPin] = useState("")
  const [category, setCategory] = useState<string>("Other")
  const [notes, setNotes] = useState("")
  const [showPin, setShowPin] = useState(false)
  const initedRef = useRef(false)

  useEffect(() => {
    if (mode !== "edit" || !id || !user || !key) return
    let active = true
    ;(async () => {
      try {
        const entry = await getPin(user.uid, id, key)
        if (!active) return
        if (!entry) {
          toast.error("PIN not found")
          router.replace("/pins")
          return
        }
        if (!initedRef.current) {
          initedRef.current = true
          setLabel(entry.label)
          setPin(entry.pin)
          setCategory(entry.category)
          setNotes(entry.notes)
        }
      } catch {
        if (active) toast.error("Failed to load PIN")
      } finally {
        if (active) setLoading(false)
      }
    })()
    return () => {
      active = false
    }
  }, [mode, id, user, key, router])

  const onPinChange = (val: string) => {
    const cleaned = val.replace(/\D/g, "").slice(0, 6)
    setPin(cleaned)
  }

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !key) return
    if (!label.trim()) {
      toast.error("Label is required")
      return
    }
    if (pin.length < 4 || pin.length > 6) {
      toast.error("PIN must be 4–6 digits")
      return
    }
    const input: PinInput = {
      label: sanitizeText(label, LIMITS.label),
      category: sanitizeText(category, LIMITS.category) || "Other",
      pin: sanitizeSecret(pin, 6),
      notes: sanitizeText(notes, LIMITS.notes),
    }
    setSaving(true)
    try {
      if (mode === "create") {
        await createPin(user.uid, input, key)
        toast.success("PIN saved")
      } else if (id) {
        await updatePin(user.uid, id, input, key)
        toast.success("PIN updated")
      }
      router.replace("/pins")
    } catch {
      toast.error("Could not save PIN")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Spinner className="size-5" />
      </div>
    )
  }

  return (
    <form onSubmit={onSave} className="mx-auto w-full max-w-2xl px-4 py-6 md:px-8 md:py-10">
      <div className="mb-6 flex items-center gap-3">
        <Button type="button" variant="ghost" size="icon" onClick={() => router.back()} aria-label="Back">
          <ArrowLeft className="size-4" />
        </Button>
        <div>
          <h1 className="text-pretty text-2xl font-semibold tracking-tight">
            {mode === "create" ? "Add PIN" : "Edit PIN"}
          </h1>
          <p className="text-sm text-muted-foreground">
            PINs are AES-256 encrypted on your device before saving.
          </p>
        </div>
      </div>

      <Card>
        <CardContent className="flex flex-col gap-5 p-5 md:p-6">
          <div className="grid gap-2">
            <Label htmlFor="label">
              Label <span className="text-destructive">*</span>
            </Label>
            <Input
              id="label"
              required
              maxLength={LIMITS.label}
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g. GPay, SBI ATM, Phone Lock"
              autoComplete="off"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="pin">
              PIN <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <Input
                id="pin"
                type={showPin ? "text" : "password"}
                inputMode="numeric"
                pattern="[0-9]*"
                required
                value={pin}
                onChange={(e) => onPinChange(e.target.value)}
                className="pr-11 font-mono text-lg tracking-widest"
                autoComplete="off"
                placeholder="4–6 digits"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setShowPin((v) => !v)}
                aria-label={showPin ? "Hide PIN" : "Show PIN"}
                className="absolute right-1 top-1 size-8"
              >
                {showPin ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              {pin.length} / 6 digits
            </p>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="category">Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger id="category">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {PIN_CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              maxLength={LIMITS.notes}
              placeholder="Optional"
              rows={3}
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
          {mode === "create" ? "Save PIN" : "Save changes"}
        </Button>
      </div>
    </form>
  )
}
