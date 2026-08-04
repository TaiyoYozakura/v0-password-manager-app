"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/components/providers/auth-provider"
import toast from "react-hot-toast"
import { Download, AlertCircle } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { MasterPinDialog } from "./master-pin-dialog"

interface ExportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ExportDialog({ open, onOpenChange }: ExportDialogProps) {
  const { user, profile } = useAuth()
  const [showPinDialog, setShowPinDialog] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [pinError, setPinError] = useState("")

  useEffect(() => {
    // Reset state when dialog opens
    if (open && !profile?.masterPinHash) {
      setShowPinDialog(true)
    }
  }, [open, profile?.masterPinHash])

  const handleExport = async (masterPin: string) => {
    if (!user) {
      toast.error("Not authenticated")
      return
    }

    setExporting(true)
    setPinError("")

    try {
      // Get Firebase ID token
      const idToken = await user.getIdToken()

      // Call export API with Master PIN
      const response = await fetch("/api/export/json", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken, masterPin }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Export failed")
      }

      const exportData = await response.json()

      // Generate a cleaner export file with passwords decrypted (frontend already has the key)
      // This is already handled by the API, so we just download it
      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: "application/json",
      })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `vaultly-export-${new Date().toISOString().slice(0, 10)}.json`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)

      toast.success("Passwords exported successfully")
      setShowPinDialog(false)
      onOpenChange(false)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Export failed"
      setPinError(message)
      toast.error(message)
    } finally {
      setExporting(false)
    }
  }

  if (!profile?.masterPinHash) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Export Passwords</DialogTitle>
            <DialogDescription>Set up a Master PIN first to export your passwords.</DialogDescription>
          </DialogHeader>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Master PIN Required</AlertTitle>
            <AlertDescription className="text-xs mt-1">
              Go to Settings to set up your Master PIN before exporting.
            </AlertDescription>
          </Alert>
          <DialogFooter>
            <Button onClick={() => onOpenChange(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <>
      <Dialog open={open && !showPinDialog} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Download className="size-5" aria-hidden />
              Export Passwords
            </DialogTitle>
            <DialogDescription>
              Download all your passwords in JSON format. Verify with your Master PIN.
            </DialogDescription>
          </DialogHeader>

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Security Note</AlertTitle>
            <AlertDescription className="text-xs mt-1">
              The exported file contains your passwords in plain text. Keep it secure and delete after importing.
            </AlertDescription>
          </Alert>

          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={exporting}>
              Cancel
            </Button>
            <Button onClick={() => setShowPinDialog(true)} disabled={exporting} className="gap-2">
              {exporting && <Spinner className="size-4" />}
              Continue to Master PIN
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <MasterPinDialog
        open={showPinDialog}
        title="Verify Master PIN"
        description="Enter your Master PIN to export your passwords."
        onSubmit={handleExport}
        onOpenChange={(newOpen) => {
          setShowPinDialog(newOpen)
          if (!newOpen) {
            onOpenChange(false)
            setPinError("")
          }
        }}
        errorMessage={pinError}
      />
    </>
  )
}
