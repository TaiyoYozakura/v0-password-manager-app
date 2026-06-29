"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface MasterPinModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (pin: string) => Promise<void>
  title?: string
  description?: string
}

export function MasterPinModal({
  open,
  onOpenChange,
  onSubmit,
  title = "Enter Master PIN",
  description = "Verify your Master PIN to continue",
}: MasterPinModalProps) {
  const [pin, setPin] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async () => {
    if (!pin) {
      setError("Please enter your Master PIN")
      return
    }

    setLoading(true)
    setError("")
    try {
      await onSubmit(pin)
      setPin("")
      onOpenChange(false)
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Verification failed"
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSubmit()
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="size-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Input
            type="password"
            placeholder="••••••••"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading}
            maxLength={8}
            inputMode="numeric"
            pattern="[0-9]*"
            className="font-mono tracking-wider"
            autoFocus
          />

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={loading || !pin}
              className="flex-1 gap-2"
            >
              {loading && <Spinner className="size-4" />}
              {loading ? "Verifying..." : "Verify"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
