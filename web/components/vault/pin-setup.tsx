"use client"

import { useState } from "react"
import toast from "react-hot-toast"
import { ShieldCheck } from "lucide-react"
import { useAuth } from "@/components/providers/auth-provider"
import { setAppLockPin } from "@/lib/firebase/profile"
import { generateSalt, hashPin } from "@/lib/crypto/encryption"
import { Button } from "@/components/ui/button"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"

export function PinSetup() {
  const { user, refreshProfile } = useAuth()
  const [step, setStep] = useState<"create" | "confirm">("create")
  const [firstPin, setFirstPin] = useState("")
  const [confirmPin, setConfirmPin] = useState("")
  const [saving, setSaving] = useState(false)

  const save = async (pin: string) => {
    if (!user) return
    setSaving(true)
    try {
      const salt = generateSalt(16)
      const hash = hashPin(pin, salt)
      await setAppLockPin(user.uid, hash, salt)
      await refreshProfile()
      toast.success("App Lock PIN set")
    } catch {
      toast.error("Failed to save PIN")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Set App Lock PIN"
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/95 p-4 backdrop-blur"
    >
      <div className="mb-6 flex size-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
        <ShieldCheck className="size-6" aria-hidden />
      </div>

      {step === "create" ? (
        <>
          <h2 className="text-pretty text-xl font-semibold tracking-tight">Create an App Lock PIN</h2>
          <p className="mt-1 max-w-sm text-pretty text-center text-sm text-muted-foreground">
            Set a 4-digit PIN to unlock the vault when the tab has been inactive.
          </p>
          <div className="mt-6">
            <InputOTP
              maxLength={4}
              value={firstPin}
              onChange={(v) => {
                setFirstPin(v)
                if (v.length === 4) setStep("confirm")
              }}
              inputMode="numeric"
              pattern="[0-9]*"
              autoFocus
            >
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
              </InputOTPGroup>
            </InputOTP>
          </div>
        </>
      ) : (
        <>
          <h2 className="text-pretty text-xl font-semibold tracking-tight">Confirm your PIN</h2>
          <p className="mt-1 max-w-sm text-pretty text-center text-sm text-muted-foreground">
            Re-enter the 4 digits to confirm.
          </p>
          <div className="mt-6">
            <InputOTP
              maxLength={4}
              value={confirmPin}
              onChange={(v) => {
                setConfirmPin(v)
                if (v.length === 4) {
                  if (v === firstPin) {
                    void save(v)
                  } else {
                    toast.error("PINs don't match. Try again.")
                    setFirstPin("")
                    setConfirmPin("")
                    setStep("create")
                  }
                }
              }}
              inputMode="numeric"
              pattern="[0-9]*"
              autoFocus
              disabled={saving}
            >
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
              </InputOTPGroup>
            </InputOTP>
          </div>
          <Button
            variant="ghost"
            className="mt-6"
            onClick={() => {
              setFirstPin("")
              setConfirmPin("")
              setStep("create")
            }}
            disabled={saving}
          >
            Start over
          </Button>
        </>
      )}
    </div>
  )
}
