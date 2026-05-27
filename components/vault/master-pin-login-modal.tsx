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
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface MasterPinLoginModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (email: string, pin: string) => Promise<void>
}

export function MasterPinLoginModal({
  open,
  onOpenChange,
  onSubmit,
}: MasterPinLoginModalProps) {
  const [email, setEmail] = useState("")
  const [pin, setPin] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async () => {
    if (!email || !pin) {
      setError("Please enter both email and Master PIN")
      return
    }

    if (pin.length !== 8) {
      setError("Master PIN must be 8 digits")
      return
    }

    setLoading(true)
    setError("")
    try {
      await onSubmit(email, pin)
      setEmail("")
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
          <DialogTitle>Sign in with Master PIN</DialogTitle>
          <DialogDescription>
            Enter your email and 8-digit Master PIN to access your vault
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="size-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              autoFocus
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="pin">Master PIN</Label>
            <Input
              id="pin"
              type="password"
              placeholder="••••••••"
              value={pin}
              onChange={(e) => setPin(e.target.value.slice(0, 8))}
              onKeyDown={handleKeyDown}
              disabled={loading}
              maxLength={8}
              inputMode="numeric"
              pattern="[0-9]*"
              className="font-mono tracking-wider"
            />
          </div>

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
              disabled={loading || !email || !pin}
              className="flex-1 gap-2"
            >
              {loading && <Spinner className="size-4" />}
              {loading ? "Verifying..." : "Sign in"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
