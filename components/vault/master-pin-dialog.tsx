"use client"

import { useState } from "react"
import toast from "react-hot-toast"
import { Lock, AlertCircle, Eye, EyeOff } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"
import { Spinner } from "@/components/ui/spinner"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface MasterPinDialogProps {
  open: boolean
  title: string
  description: string
  onSubmit: (pin: string) => Promise<void>
  onOpenChange: (open: boolean) => void
  isSetup?: boolean // If true, requires PIN confirmation
  errorMessage?: string
}

export function MasterPinDialog({
  open,
  title,
  description,
  onSubmit,
  onOpenChange,
  isSetup = false,
  errorMessage,
}: MasterPinDialogProps) {
  const [pin, setPin] = useState("")
  const [confirmPin, setConfirmPin] = useState("")
  const [showPin, setShowPin] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>("")

  const handleSubmit = async () => {
    setError("")

    if (pin.length < 4) {
      setError("PIN must be 4 digits")
      return
    }

    if (isSetup) {
      if (confirmPin.length < 4) {
        setError("Please confirm your PIN")
        return
      }
      if (pin !== confirmPin) {
        setError("PINs do not match")
        return
      }
    }

    setLoading(true)
    try {
      await onSubmit(pin)
      setPin("")
      setConfirmPin("")
      setError("")
      onOpenChange(false)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Operation failed"
      setError(message)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setPin("")
      setConfirmPin("")
      setError("")
    }
    onOpenChange(newOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="size-5" aria-hidden />
            {title}
          </DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {(error || errorMessage) && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription className="text-xs">{error || errorMessage}</AlertDescription>
            </Alert>
          )}

          <div className="grid gap-3">
            <Label>Master PIN</Label>
            <InputOTP
              maxLength={4}
              value={pin}
              onChange={setPin}
              disabled={loading}
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

          {isSetup && (
            <div className="grid gap-3">
              <Label>Confirm Master PIN</Label>
              <InputOTP
                maxLength={4}
                value={confirmPin}
                onChange={setConfirmPin}
                disabled={loading}
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
          )}

          {!isSetup && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              {showPin ? (
                <EyeOff className="size-4" />
              ) : (
                <Eye className="size-4" />
              )}
              <button
                onClick={() => setShowPin(!showPin)}
                className="underline hover:no-underline"
              >
                {showPin ? "Hide" : "Show"} PIN
              </button>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading || pin.length < 4} className="gap-2">
            {loading && <Spinner className="size-4" />}
            Continue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
