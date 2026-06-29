"use client"

import { useState, useRef } from "react"
import { Upload, AlertCircle } from "lucide-react"
import toast from "react-hot-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { decryptVaultFile, validateVaultData } from "@/lib/import/handler"

interface ImportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onImport: (passwords: any[], pins: any[]) => Promise<void>
}

export function ImportDialog({ open, onOpenChange, onImport }: ImportDialogProps) {
  const [passphrase, setPassphrase] = useState("")
  const [importing, setImporting] = useState(false)
  const [errors, setErrors] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const onFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setErrors([])
    setImporting(true)

    try {
      const content = await file.text()
      const vault = await decryptVaultFile(content, passphrase)

      const validationErrors = validateVaultData(vault)
      if (validationErrors.length > 0) {
        setErrors(validationErrors)
        return
      }

      const passwordCount = vault.passwords.length
      const pinCount = vault.pins.length

      await onImport(vault.passwords, vault.pins)

      toast.success(`Imported ${passwordCount} passwords and ${pinCount} PINs`)
      setPassphrase("")
      setErrors([])
      onOpenChange(false)

      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Import failed"
      setErrors([message])
      toast.error(message)
    } finally {
      setImporting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Import vault from backup</DialogTitle>
          <DialogDescription>
            Upload your encrypted Vaultly export file and enter the passphrase used to create it.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="grid gap-2">
            <Label htmlFor="import-pass">Backup passphrase</Label>
            <Input
              id="import-pass"
              type="password"
              value={passphrase}
              onChange={(e) => setPassphrase(e.target.value)}
              placeholder="Enter the passphrase used during export"
              disabled={importing}
              autoFocus
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="import-file">Backup file</Label>
            <div className="flex items-center gap-2">
              <Input
                id="import-file"
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={onFileSelect}
                disabled={importing || !passphrase}
                className="cursor-pointer"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Select your vaultly-export-YYYY-MM-DD.json file
            </p>
          </div>

          {errors.length > 0 && (
            <Alert variant="destructive">
              <AlertCircle className="size-4" aria-hidden />
              <AlertDescription>
                <div className="space-y-1">
                  {errors.map((error, i) => (
                    <div key={i}>{error}</div>
                  ))}
                </div>
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              onOpenChange(false)
              setPassphrase("")
              setErrors([])
            }}
            disabled={importing}
          >
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
