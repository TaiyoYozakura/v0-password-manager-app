"use client"

import { useEffect, useMemo, useState } from "react"
import toast from "react-hot-toast"
import { Copy, RefreshCw, Save, Wand2 } from "lucide-react"
import { useAuth } from "@/components/providers/auth-provider"
import { generatePassword, generatePin } from "@/lib/crypto/generate"
import { createPassword } from "@/lib/firebase/passwords"
import { createPin } from "@/lib/firebase/pins"
import { DEFAULT_TAGS, PIN_CATEGORIES } from "@/lib/types"
import { useSecureClipboard } from "@/hooks/use-secure-clipboard"
import { StrengthBar } from "@/components/vault/strength-bar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Spinner } from "@/components/ui/spinner"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

export default function GeneratorPage() {
  const { user, key } = useAuth()
  const { copy } = useSecureClipboard()

  // Password generator state
  const [length, setLength] = useState(16)
  const [upper, setUpper] = useState(true)
  const [lower, setLower] = useState(true)
  const [numbers, setNumbers] = useState(true)
  const [special, setSpecial] = useState(true)
  const [excludeAmbiguous, setExcludeAmbiguous] = useState(false)
  const [password, setPassword] = useState("")

  // PIN generator state
  const [pinLength, setPinLength] = useState<4 | 6>(4)
  const [pin, setPin] = useState("")

  // Save dialogs
  const [savePwOpen, setSavePwOpen] = useState(false)
  const [pwSiteName, setPwSiteName] = useState("")
  const [pwTag, setPwTag] = useState<string>("Other")
  const [pwSaving, setPwSaving] = useState(false)

  const [savePinOpen, setSavePinOpen] = useState(false)
  const [pinLabel, setPinLabel] = useState("")
  const [pinCategory, setPinCategory] = useState<string>("Other")
  const [pinSaving, setPinSaving] = useState(false)

  const noneSelected = useMemo(
    () => !upper && !lower && !numbers && !special,
    [upper, lower, numbers, special],
  )

  const regen = () => {
    if (noneSelected) {
      setPassword("")
      return
    }
    setPassword(
      generatePassword({
        length,
        uppercase: upper,
        lowercase: lower,
        numbers,
        special,
        excludeAmbiguous,
      }),
    )
  }

  useEffect(() => {
    regen()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [length, upper, lower, numbers, special, excludeAmbiguous])

  const regenPin = () => setPin(generatePin(pinLength))

  useEffect(() => {
    regenPin()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pinLength])

  const onSavePassword = async () => {
    if (!user || !key) return
    if (!pwSiteName.trim()) {
      toast.error("Site / App name is required")
      return
    }
    if (!password) {
      toast.error("Generate a password first")
      return
    }
    setPwSaving(true)
    try {
      await createPassword(
        user.uid,
        {
          siteName: pwSiteName.trim().slice(0, 100),
          siteUrl: "",
          tag: pwTag || "Other",
          password,
          username: "",
          email: "",
          notes: "",
        },
        key,
      )
      toast.success("Saved to vault")
      setSavePwOpen(false)
      setPwSiteName("")
      setPwTag("Other")
    } catch {
      toast.error("Could not save")
    } finally {
      setPwSaving(false)
    }
  }

  const onSavePin = async () => {
    if (!user || !key) return
    if (!pinLabel.trim()) {
      toast.error("Label is required")
      return
    }
    if (!pin) {
      toast.error("Generate a PIN first")
      return
    }
    setPinSaving(true)
    try {
      await createPin(
        user.uid,
        {
          label: pinLabel.trim().slice(0, 100),
          category: pinCategory || "Other",
          pin,
          notes: "",
        },
        key,
      )
      toast.success("Saved to PIN vault")
      setSavePinOpen(false)
      setPinLabel("")
      setPinCategory("Other")
    } catch {
      toast.error("Could not save")
    } finally {
      setPinSaving(false)
    }
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6 md:px-8 md:py-10">
      <header>
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Wand2 className="size-5" aria-hidden />
          </div>
          <div>
            <h1 className="text-pretty text-2xl font-semibold tracking-tight">Generator</h1>
            <p className="text-sm text-muted-foreground">
              Cryptographically secure passwords and PINs.
            </p>
          </div>
        </div>
      </header>

      <Tabs defaultValue="password" className="mt-6">
        <TabsList>
          <TabsTrigger value="password">Password</TabsTrigger>
          <TabsTrigger value="pin">PIN</TabsTrigger>
        </TabsList>

        <TabsContent value="password" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Password generator</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-5">
              <div className="rounded-md border border-border bg-secondary/40 p-4">
                <p className="break-all font-mono text-base leading-relaxed md:text-lg">
                  {noneSelected ? (
                    <span className="text-muted-foreground">
                      Select at least one character set
                    </span>
                  ) : (
                    password
                  )}
                </p>
              </div>

              <StrengthBar password={password} />

              <div className="flex flex-wrap gap-2">
                <Button onClick={regen} variant="outline" className="gap-2" disabled={noneSelected}>
                  <RefreshCw className="size-4" aria-hidden /> Regenerate
                </Button>
                <Button
                  onClick={() => copy(password, "Password copied")}
                  className="gap-2"
                  disabled={!password}
                >
                  <Copy className="size-4" aria-hidden /> Copy
                </Button>
                <Button
                  onClick={() => setSavePwOpen(true)}
                  variant="secondary"
                  className="gap-2"
                  disabled={!password}
                >
                  <Save className="size-4" aria-hidden /> Save to vault
                </Button>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <Label htmlFor="length">Length</Label>
                  <span className="font-mono text-muted-foreground">{length}</span>
                </div>
                <Slider
                  id="length"
                  min={8}
                  max={64}
                  step={1}
                  value={[length]}
                  onValueChange={(v) => setLength(v[0])}
                />
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Toggle checked={upper} onChange={setUpper} label="Uppercase Letters (A–Z)" />
                <Toggle checked={lower} onChange={setLower} label="Lowercase Letters (a–z)" />
                <Toggle checked={numbers} onChange={setNumbers} label="Numbers (0–9)" />
                <Toggle checked={special} onChange={setSpecial} label="Special Characters (!@#$...)" />
                <Toggle
                  checked={excludeAmbiguous}
                  onChange={setExcludeAmbiguous}
                  label="Exclude Ambiguous (0 O I l 1)"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pin" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">PIN generator</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-5">
              <div className="rounded-md border border-border bg-secondary/40 p-6 text-center">
                <p className="font-mono text-4xl tracking-[0.35em]">{pin || "—"}</p>
              </div>

              <div>
                <Label className="mb-2 block text-sm">Length</Label>
                <RadioGroup
                  value={String(pinLength)}
                  onValueChange={(v) => setPinLength(Number(v) as 4 | 6)}
                  className="flex gap-4"
                >
                  <label className="flex cursor-pointer items-center gap-2 text-sm">
                    <RadioGroupItem value="4" id="pin-4" />
                    <span>4 digits</span>
                  </label>
                  <label className="flex cursor-pointer items-center gap-2 text-sm">
                    <RadioGroupItem value="6" id="pin-6" />
                    <span>6 digits</span>
                  </label>
                </RadioGroup>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button onClick={regenPin} variant="outline" className="gap-2">
                  <RefreshCw className="size-4" aria-hidden /> Generate PIN
                </Button>
                <Button
                  onClick={() => copy(pin, "PIN copied")}
                  className="gap-2"
                  disabled={!pin}
                >
                  <Copy className="size-4" aria-hidden /> Copy
                </Button>
                <Button
                  onClick={() => setSavePinOpen(true)}
                  variant="secondary"
                  className="gap-2"
                  disabled={!pin}
                >
                  <Save className="size-4" aria-hidden /> Save to PIN vault
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Save password dialog */}
      <Dialog open={savePwOpen} onOpenChange={setSavePwOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save to vault</DialogTitle>
            <DialogDescription>
              Give this password a site name and tag. It will be AES-256 encrypted before saving.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="pw-site">Site / App Name</Label>
              <Input
                id="pw-site"
                value={pwSiteName}
                onChange={(e) => setPwSiteName(e.target.value)}
                placeholder="e.g. GitHub"
                maxLength={100}
                autoFocus
              />
            </div>
            <div className="grid gap-2">
              <Label>Tag</Label>
              <Select value={pwTag} onValueChange={setPwTag}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DEFAULT_TAGS.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSavePwOpen(false)} disabled={pwSaving}>
              Cancel
            </Button>
            <Button onClick={onSavePassword} disabled={pwSaving} className="gap-2">
              {pwSaving && <Spinner className="size-4" />}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Save pin dialog */}
      <Dialog open={savePinOpen} onOpenChange={setSavePinOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save to PIN vault</DialogTitle>
            <DialogDescription>
              Give this PIN a label and category. It will be AES-256 encrypted before saving.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="pin-label">Label</Label>
              <Input
                id="pin-label"
                value={pinLabel}
                onChange={(e) => setPinLabel(e.target.value)}
                placeholder="e.g. GPay, SBI ATM"
                maxLength={100}
                autoFocus
              />
            </div>
            <div className="grid gap-2">
              <Label>Category</Label>
              <Select value={pinCategory} onValueChange={setPinCategory}>
                <SelectTrigger>
                  <SelectValue />
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
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSavePinOpen(false)} disabled={pinSaving}>
              Cancel
            </Button>
            <Button onClick={onSavePin} disabled={pinSaving} className="gap-2">
              {pinSaving && <Spinner className="size-4" />}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
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
  const id = `gen-${label.replace(/\s+/g, "-")}`
  return (
    <label htmlFor={id} className="flex cursor-pointer items-center gap-2 rounded-md border border-border bg-card p-3 text-sm transition-colors hover:bg-accent">
      <Checkbox id={id} checked={checked} onCheckedChange={(v) => onChange(Boolean(v))} />
      <span>{label}</span>
    </label>
  )
}
