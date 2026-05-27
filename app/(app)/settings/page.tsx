"use client"

import { useEffect, useState } from "react"
import { useTheme } from "next-themes"
import toast from "react-hot-toast"
import { deleteUser } from "firebase/auth"
import {
  Sun,
  Moon,
  Monitor,
  Download,
  ShieldCheck,
  Trash2,
  KeyRound,
  Hash,
  Clock,
  ArrowLeft,
  UserX,
} from "lucide-react"
import { useAuth } from "@/components/providers/auth-provider"
import {
  setAppLockPin as persistAppLockPin,
  setAutoLogoutMinutes,
  setMasterPin,
  resetPinAttempts,
} from "@/lib/firebase/profile"
import { hashMasterPin } from "@/lib/crypto/bcrypt"
import {
  deleteAllPasswords,
  listPasswords,
} from "@/lib/firebase/passwords"
import { deleteAllPins, listPins } from "@/lib/firebase/pins"
import {
  encryptWithPassphrase,
  generateSalt,
  hashPin,
} from "@/lib/crypto/encryption"
import { getFirebase } from "@/lib/firebase/config"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Spinner } from "@/components/ui/spinner"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"
import { ConfirmModal } from "@/components/vault/confirm-modal"
import Link from "next/link"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export default function SettingsPage() {
  const { user, key, profile, refreshProfile, logout } = useAuth()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Change PIN state
  const [currentPin, setCurrentPin] = useState("")
  const [newPin, setNewPin] = useState("")
  const [confirmPin, setConfirmPin] = useState("")
  const [pinSaving, setPinSaving] = useState(false)

  // Master PIN state
  const [masterPinOpen, setMasterPinOpen] = useState(false)
  const [masterPin1, setMasterPin1] = useState("")
  const [masterPin2, setMasterPin2] = useState("")
  const [savingMasterPin, setSavingMasterPin] = useState(false)

  // Auto-logout
  const [autoLogout, setAutoLogout] = useState<string>(String(profile?.autoLogoutMinutes ?? 15))
  const [savingLogout, setSavingLogout] = useState(false)

  // Export
  const [exportOpen, setExportOpen] = useState(false)
  const [exportFormat, setExportFormat] = useState<"encrypted" | "csv">("encrypted")
  const [exportMasterPin, setExportMasterPin] = useState("")
  const [exporting, setExporting] = useState(false)

  // Danger zone
  const [showDeletePasswords, setShowDeletePasswords] = useState(false)
  const [showDeletePins, setShowDeletePins] = useState(false)
  const [showDeleteAccount, setShowDeleteAccount] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    setAutoLogout(String(profile?.autoLogoutMinutes ?? 15))
  }, [profile?.autoLogoutMinutes])

  const onChangePin = async () => {
    if (!user || !profile?.appLockPinHash || !profile.appLockPinSalt) return
    if (currentPin.length !== 4) {
      toast.error("Enter your current 4-digit PIN")
      return
    }
    const existing = hashPin(currentPin, profile.appLockPinSalt)
    if (existing !== profile.appLockPinHash) {
      toast.error("Current PIN is incorrect")
      return
    }
    if (newPin.length !== 4) {
      toast.error("New PIN must be 4 digits")
      return
    }
    if (newPin !== confirmPin) {
      toast.error("New PINs do not match")
      return
    }
    setPinSaving(true)
    try {
      const salt = generateSalt(16)
      const hash = hashPin(newPin, salt)
      await persistAppLockPin(user.uid, hash, salt)
      await refreshProfile()
      toast.success("App Lock PIN updated")
      setCurrentPin("")
      setNewPin("")
      setConfirmPin("")
    } catch {
      toast.error("Could not update PIN")
    } finally {
      setPinSaving(false)
    }
  }

  const onSetupMasterPin = async () => {
    if (!user) return
    if (masterPin1.length !== 8) {
      toast.error("Master PIN must be 8 digits")
      return
    }
    if (masterPin1 !== masterPin2) {
      toast.error("Master PINs do not match")
      return
    }
    setSavingMasterPin(true)
    try {
      const { hash, salt } = hashMasterPin(masterPin1)
      await setMasterPin(user.uid, hash, salt)
      await refreshProfile()
      toast.success("Master PIN set up successfully")
      setMasterPinOpen(false)
      setMasterPin1("")
      setMasterPin2("")
    } catch {
      toast.error("Could not set up Master PIN")
    } finally {
      setSavingMasterPin(false)
    }
  }

  const onSaveAutoLogout = async (value: string) => {
    if (!user) return
    const minutes = Number(value)
    setSavingLogout(true)
    try {
      await setAutoLogoutMinutes(user.uid, minutes)
      await refreshProfile()
      setAutoLogout(value)
      toast.success("Saved")
    } catch {
      toast.error("Could not save")
    } finally {
      setSavingLogout(false)
    }
  }

  const onExport = async () => {
    if (!user || !key) return

    if (exportFormat === "encrypted") {
      // Original encrypted export with passphrase
      if (exportMasterPin.length < 8) {
        toast.error("Use a passphrase of at least 8 characters")
        return
      }
      setExporting(true)
      try {
        const [passwords, pins] = await Promise.all([
          listPasswords(user.uid, key),
          listPins(user.uid, key),
        ])
        const payload = {
          version: 1,
          exportedAt: new Date().toISOString(),
          user: { uid: user.uid, email: user.email },
          passwords: passwords.map((p) => ({
            siteName: p.siteName,
            siteUrl: p.siteUrl,
            tag: p.tag,
            username: p.username,
            email: p.email,
            password: p.password,
            notes: p.notes,
            createdAt: p.createdAt?.toISOString() ?? null,
          })),
          pins: pins.map((p) => ({
            label: p.label,
            category: p.category,
            pin: p.pin,
            notes: p.notes,
            createdAt: p.createdAt?.toISOString() ?? null,
          })),
        }
        const json = JSON.stringify(payload, null, 2)
        const encrypted = encryptWithPassphrase(json, exportMasterPin)
        const blob = new Blob(
          [
            JSON.stringify(
              {
                format: "vaultly-export",
                version: 1,
                algorithm: "AES-256 (CryptoJS default)",
                data: encrypted,
              },
              null,
              2,
            ),
          ],
          { type: "application/json" },
        )
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `vaultly-export-${new Date().toISOString().slice(0, 10)}.json`
        document.body.appendChild(a)
        a.click()
        a.remove()
        URL.revokeObjectURL(url)
        toast.success("Encrypted export downloaded")
        setExportOpen(false)
        setExportMasterPin("")
      } catch {
        toast.error("Export failed")
      } finally {
        setExporting(false)
      }
    } else {
      // CSV export with Master PIN verification
      if (!exportMasterPin) {
        toast.error("Enter your Master PIN")
        return
      }
      setExporting(true)
      try {
        const idToken = await user?.getIdToken()
        if (!idToken) throw new Error("Not authenticated")

        const res = await fetch("/api/export/txt", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            idToken,
            masterPin: exportMasterPin,
            encryptionKey: key,
          }),
        })

        if (!res.ok) {
          const data = await res.json()
          throw new Error(data.error || "Export failed")
        }

        const blob = await res.blob()
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `vaultly-export-${new Date().toISOString().slice(0, 10)}.csv`
        document.body.appendChild(a)
        a.click()
        a.remove()
        URL.revokeObjectURL(url)
        toast.success("CSV export downloaded")
        setExportOpen(false)
        setExportMasterPin("")
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Export failed"
        toast.error(message)
      } finally {
        setExporting(false)
      }
    }
  }

  const onDeleteAllPasswords = async () => {
    if (!user) return
    try {
      await deleteAllPasswords(user.uid)
      toast.success("All passwords deleted")
    } catch {
      toast.error("Could not delete passwords")
    }
  }

  const onDeleteAllPins = async () => {
    if (!user) return
    try {
      await deleteAllPins(user.uid)
      toast.success("All PINs deleted")
    } catch {
      toast.error("Could not delete PINs")
    }
  }

  const onDeleteAccount = async () => {
    if (!user) return
    try {
      await deleteAllPasswords(user.uid)
      await deleteAllPins(user.uid)
      const { auth } = getFirebase()
      try {
        if (auth.currentUser) {
          await deleteUser(auth.currentUser)
        }
      } catch {
        toast.error("Re-authentication required. Sign out, sign back in, and retry.")
        return
      }
      toast.success("Account deleted")
      await logout()
    } catch {
      toast.error("Could not delete account")
    }
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6 md:px-8 md:py-10">
      <div className="mb-6 flex items-center gap-3">
        <Button asChild variant="ghost" size="icon" aria-label="Back to dashboard">
          <Link href="/dashboard">
            <ArrowLeft className="size-4" />
          </Link>
        </Button>
        <h1 className="text-pretty text-2xl font-semibold tracking-tight">Settings</h1>
      </div>

      {/* Profile */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Profile</CardTitle>
          <CardDescription>Signed in with Google.</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center gap-4">
          <Avatar className="size-14 ring-2 ring-border">
            <AvatarImage src={user?.photoURL || undefined} alt="" />
            <AvatarFallback>{(user?.displayName || user?.email || "?").slice(0, 1)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate font-medium">{user?.displayName || "—"}</p>
            <p className="truncate text-sm text-muted-foreground">{user?.email}</p>
          </div>
        </CardContent>
      </Card>

      {/* App Lock PIN */}
      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <ShieldCheck className="size-4" aria-hidden /> Change App Lock PIN
          </CardTitle>
          <CardDescription>Update your 4-digit unlock PIN.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <div className="grid gap-2">
            <Label>Current PIN</Label>
            <InputOTP
              maxLength={4}
              value={currentPin}
              onChange={setCurrentPin}
              inputMode="numeric"
              pattern="[0-9]*"
            >
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
              </InputOTPGroup>
            </InputOTP>
          </div>
          <div className="grid gap-2">
            <Label>New PIN</Label>
            <InputOTP
              maxLength={4}
              value={newPin}
              onChange={setNewPin}
              inputMode="numeric"
              pattern="[0-9]*"
            >
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
              </InputOTPGroup>
            </InputOTP>
          </div>
          <div className="grid gap-2">
            <Label>Confirm New PIN</Label>
            <InputOTP
              maxLength={4}
              value={confirmPin}
              onChange={setConfirmPin}
              inputMode="numeric"
              pattern="[0-9]*"
            >
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
              </InputOTPGroup>
            </InputOTP>
          </div>
          <div>
            <Button onClick={onChangePin} disabled={pinSaving} className="gap-2">
              {pinSaving && <Spinner className="size-4" />}
              Update PIN
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Master PIN */}
      {profile?.masterPinHash ? (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Hash className="size-4" aria-hidden /> Master PIN
            </CardTitle>
            <CardDescription>8-digit PIN for advanced exports and authentication.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-green-600 dark:text-green-400">✓ Master PIN is set up</p>
          </CardContent>
        </Card>
      ) : (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Hash className="size-4" aria-hidden /> Set up Master PIN
            </CardTitle>
            <CardDescription>Create an 8-digit PIN to unlock advanced export formats.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" onClick={() => setMasterPinOpen(true)} className="gap-2">
              <Hash className="size-4" aria-hidden />
              Set up Master PIN
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Theme */}
      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="text-base">Appearance</CardTitle>
          <CardDescription>Choose how the app looks on this device.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <ThemeBtn
              active={mounted && theme === "light"}
              onClick={() => setTheme("light")}
              icon={<Sun className="size-4" aria-hidden />}
              label="Light"
            />
            <ThemeBtn
              active={mounted && theme === "dark"}
              onClick={() => setTheme("dark")}
              icon={<Moon className="size-4" aria-hidden />}
              label="Dark"
            />
            <ThemeBtn
              active={mounted && theme === "system"}
              onClick={() => setTheme("system")}
              icon={<Monitor className="size-4" aria-hidden />}
              label="System"
            />
          </div>
        </CardContent>
      </Card>

      {/* Auto-logout */}
      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Clock className="size-4" aria-hidden /> Auto-logout
          </CardTitle>
          <CardDescription>Sign out automatically after a period of inactivity.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <Select value={autoLogout} onValueChange={onSaveAutoLogout} disabled={savingLogout}>
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5 minutes</SelectItem>
                <SelectItem value="15">15 minutes</SelectItem>
                <SelectItem value="30">30 minutes</SelectItem>
              </SelectContent>
            </Select>
            {savingLogout && <Spinner className="size-4" />}
          </div>
        </CardContent>
      </Card>

      {/* Export */}
      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Download className="size-4" aria-hidden /> Export Vault
          </CardTitle>
          <CardDescription>
            Download your vault as encrypted JSON or plaintext CSV.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <Button variant="outline" onClick={() => setExportOpen(true)} className="gap-2">
            <Download className="size-4" aria-hidden />
            Export vault
          </Button>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="mt-4 border-destructive/40">
        <CardHeader>
          <CardTitle className="text-base text-destructive">Danger zone</CardTitle>
          <CardDescription>These actions are permanent.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <Button
            variant="outline"
            onClick={() => setShowDeletePasswords(true)}
            className="gap-2 border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive"
          >
            <KeyRound className="size-4" aria-hidden /> Delete all passwords
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowDeletePins(true)}
            className="gap-2 border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive"
          >
            <Hash className="size-4" aria-hidden /> Delete all PINs
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowDeleteAccount(true)}
            className="gap-2 border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive"
          >
            <UserX className="size-4" aria-hidden /> Delete account
          </Button>
        </CardContent>
      </Card>

      {/* Confirm modals */}
      <ConfirmModal
        open={showDeletePasswords}
        onOpenChange={setShowDeletePasswords}
        title="Delete all passwords?"
        description="This permanently removes every password entry. This cannot be undone."
        confirmText="Delete all"
        destructive
        typeToConfirm="DELETE"
        onConfirm={onDeleteAllPasswords}
      />
      <ConfirmModal
        open={showDeletePins}
        onOpenChange={setShowDeletePins}
        title="Delete all PINs?"
        description="This permanently removes every PIN entry. This cannot be undone."
        confirmText="Delete all"
        destructive
        typeToConfirm="DELETE"
        onConfirm={onDeleteAllPins}
      />
      <ConfirmModal
        open={showDeleteAccount}
        onOpenChange={setShowDeleteAccount}
        title="Delete your account?"
        description="This deletes all your vault data and your Firebase Auth account. You&apos;ll be signed out."
        confirmText="Delete account"
        destructive
        typeToConfirm="DELETE"
        onConfirm={onDeleteAccount}
      />

      {/* Master PIN Setup Dialog */}
      <Dialog open={masterPinOpen} onOpenChange={setMasterPinOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Set up Master PIN</DialogTitle>
            <DialogDescription>
              Create an 8-digit PIN for advanced features like plaintext CSV exports.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <div className="grid gap-2">
              <Label htmlFor="master-pin-1">Master PIN</Label>
              <Input
                id="master-pin-1"
                type="password"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={8}
                value={masterPin1}
                onChange={(e) => setMasterPin1(e.target.value.slice(0, 8))}
                placeholder="••••••••"
                className="font-mono tracking-wider"
                autoFocus
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="master-pin-2">Confirm Master PIN</Label>
              <Input
                id="master-pin-2"
                type="password"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={8}
                value={masterPin2}
                onChange={(e) => setMasterPin2(e.target.value.slice(0, 8))}
                placeholder="••••••••"
                className="font-mono tracking-wider"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              This PIN is hashed with PBKDF2 and stored securely. It cannot be recovered if you forget it.
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setMasterPinOpen(false)}
              disabled={savingMasterPin}
            >
              Cancel
            </Button>
            <Button onClick={onSetupMasterPin} disabled={savingMasterPin || !masterPin1 || !masterPin2} className="gap-2">
              {savingMasterPin && <Spinner className="size-4" />}
              Set up PIN
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Export dialog */}
      <Dialog open={exportOpen} onOpenChange={setExportOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Export vault</DialogTitle>
            <DialogDescription>
              {exportFormat === "encrypted"
                ? "Password-protected encrypted JSON backup"
                : "Plaintext CSV (requires Master PIN verification)"}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <div className="grid gap-2">
              <Label>Export format</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={exportFormat === "encrypted" ? "default" : "outline"}
                  onClick={() => setExportFormat("encrypted")}
                  className="flex-1"
                  size="sm"
                >
                  Encrypted JSON
                </Button>
                <Button
                  type="button"
                  variant={exportFormat === "csv" ? "default" : "outline"}
                  onClick={() => setExportFormat("csv")}
                  className="flex-1"
                  size="sm"
                  disabled={!profile?.masterPinHash}
                >
                  CSV
                </Button>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="export-key">
                {exportFormat === "encrypted" ? "Export passphrase" : "Master PIN"}
              </Label>
              <Input
                id="export-key"
                type="password"
                inputMode={exportFormat === "csv" ? "numeric" : "text"}
                value={exportMasterPin}
                onChange={(e) => {
                  if (exportFormat === "csv") {
                    setExportMasterPin(e.target.value.slice(0, 8))
                  } else {
                    setExportMasterPin(e.target.value)
                  }
                }}
                placeholder={
                  exportFormat === "encrypted"
                    ? "At least 8 characters"
                    : "••••••••"
                }
                className={exportFormat === "csv" ? "font-mono tracking-wider" : ""}
                autoFocus
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setExportOpen(false)}
              disabled={exporting}
            >
              Cancel
            </Button>
            <Button onClick={onExport} disabled={exporting || !exportMasterPin} className="gap-2">
              {exporting ? <Spinner className="size-4" /> : <Download className="size-4" aria-hidden />}
              Download
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <p className="mt-8 flex items-center justify-center gap-2 text-center text-xs text-muted-foreground">
        <Trash2 className="size-3.5" aria-hidden />
        Destructive actions require typing DELETE to confirm.
      </p>
    </div>
  )
}

function ThemeBtn({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean
  onClick: () => void
  icon: React.ReactNode
  label: string
}) {
  return (
    <Button
      variant={active ? "default" : "outline"}
      onClick={onClick}
      className="gap-2"
      aria-pressed={active}
    >
      {icon}
      {label}
    </Button>
  )
}
