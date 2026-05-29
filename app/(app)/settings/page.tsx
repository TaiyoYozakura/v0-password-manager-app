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
  Upload,
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
  updateLastBackupDate,
  isBackupDue,
} from "@/lib/firebase/profile"
import {
  deleteAllPasswords,
  listPasswords,
  savePassword,
} from "@/lib/firebase/passwords"
import { deleteAllPins, listPins, savePin } from "@/lib/firebase/pins"
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
import { ImportDialog } from "@/components/vault/import-dialog"
import { BackupReminder } from "@/components/vault/backup-reminder"
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

  // Auto-logout
  const [autoLogout, setAutoLogout] = useState<string>(String(profile?.autoLogoutMinutes ?? 15))
  const [savingLogout, setSavingLogout] = useState(false)

  // Export
  const [exportOpen, setExportOpen] = useState(false)
  const [exportPassphrase, setExportPassphrase] = useState("")
  const [exporting, setExporting] = useState(false)

  // Import
  const [importOpen, setImportOpen] = useState(false)

  // Backup reminder
  const [daysSinceBackup, setDaysSinceBackup] = useState<number | undefined>()

  // Danger zone
  const [showDeletePasswords, setShowDeletePasswords] = useState(false)
  const [showDeletePins, setShowDeletePins] = useState(false)
  const [showDeleteAccount, setShowDeleteAccount] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (profile?.lastBackupDate) {
      const daysSince = Math.floor((Date.now() - profile.lastBackupDate) / (1000 * 60 * 60 * 24))
      setDaysSinceBackup(daysSince)
    }
  }, [profile?.lastBackupDate])

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
    if (exportPassphrase.length < 8) {
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
      const encrypted = encryptWithPassphrase(json, exportPassphrase)
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
      
      // Update last backup date
      if (user) {
        await updateLastBackupDate(user.uid)
        await refreshProfile()
      }
      
      toast.success("Encrypted export downloaded")
      setExportOpen(false)
      setExportPassphrase("")
    } catch {
      toast.error("Export failed")
    } finally {
      setExporting(false)
    }
  }

  const onImportVault = async (passwords: any[], pins: any[]) => {
    if (!user || !key) return

    try {
      // Derive encryption key for encrypting imported data
      const encKey = deriveKey(user.uid, user.email!)

      // Import all passwords
      for (const p of passwords) {
        await savePassword(user.uid, {
          siteName: p.siteName,
          siteUrl: p.siteUrl,
          tag: p.tag,
          username: p.username,
          email: p.email,
          password: p.password,
          notes: p.notes,
        }, encKey)
      }

      // Import all pins
      for (const pn of pins) {
        await savePin(user.uid, {
          label: pn.label,
          category: pn.category,
          pin: pn.pin,
          notes: pn.notes,
        }, encKey)
      }

      await refreshProfile()
      toast.success(`Imported ${passwords.length} passwords and ${pins.length} PINs`)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Import failed"
      toast.error(message)
      throw err
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

      {/* Backup reminder */}
      <BackupReminder
        onExportClick={() => setExportOpen(true)}
        daysSinceBackup={daysSinceBackup}
      />

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

      {/* Export & Import */}
      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Download className="size-4" aria-hidden /> Backup & Restore
          </CardTitle>
          <CardDescription>
            Download or restore your encrypted vault backup.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <Button variant="outline" onClick={() => setExportOpen(true)} className="gap-2">
            <Download className="size-4" aria-hidden />
            Download backup
          </Button>
          <Button variant="outline" onClick={() => setImportOpen(true)} className="gap-2">
            <Upload className="size-4" aria-hidden />
            Restore from backup
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

      {/* Import dialog */}
      <ImportDialog
        open={importOpen}
        onOpenChange={setImportOpen}
        onImport={onImportVault}
      />

      {/* Export dialog */}
      <Dialog open={exportOpen} onOpenChange={setExportOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Export encrypted backup</DialogTitle>
            <DialogDescription>
              Choose a passphrase to protect your encrypted backup file.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-2">
            <Label htmlFor="export-pass">Export passphrase</Label>
            <Input
              id="export-pass"
              type="password"
              value={exportPassphrase}
              onChange={(e) => setExportPassphrase(e.target.value)}
              placeholder="At least 8 characters"
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setExportOpen(false)}
              disabled={exporting}
            >
              Cancel
            </Button>
            <Button onClick={onExport} disabled={exporting || !exportPassphrase} className="gap-2">
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
