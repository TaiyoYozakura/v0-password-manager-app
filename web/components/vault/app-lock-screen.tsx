"use client"

import { useState } from "react"
import { Lock, LogOut } from "lucide-react"
import toast from "react-hot-toast"
import { useAuth } from "@/components/providers/auth-provider"
import { hashPin } from "@/lib/crypto/encryption"
import { Button } from "@/components/ui/button"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"

const MAX_ATTEMPTS = 5

export function AppLockScreen() {
  const { profile, unlock, logout } = useAuth()
  const [pin, setPin] = useState("")
  const [attempts, setAttempts] = useState(0)
  const [shake, setShake] = useState(false)

  if (!profile?.appLockPinHash || !profile?.appLockPinSalt) return null

  const onComplete = (value: string) => {
    const attempt = hashPin(value, profile.appLockPinSalt!)
    if (attempt === profile.appLockPinHash) {
      toast.success("Unlocked")
      setPin("")
      setAttempts(0)
      unlock()
      return
    }
    const next = attempts + 1
    setAttempts(next)
    setShake(true)
    setTimeout(() => setShake(false), 400)
    setPin("")
    if (next >= MAX_ATTEMPTS) {
      toast.error("Too many failed attempts. Signing out.")
      void logout()
    } else {
      toast.error(`Incorrect PIN. ${MAX_ATTEMPTS - next} attempt${MAX_ATTEMPTS - next === 1 ? "" : "s"} left.`)
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="App locked"
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/95 p-4 backdrop-blur"
    >
      <div className="mb-6 flex size-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
        <Lock className="size-6" aria-hidden />
      </div>
      <h2 className="text-pretty text-xl font-semibold tracking-tight">Vault is locked</h2>
      <p className="mt-1 max-w-sm text-pretty text-center text-sm text-muted-foreground">
        Enter your 4-digit App Lock PIN to continue.
      </p>

      <div className={shake ? "mt-6 animate-pulse" : "mt-6"}>
        <InputOTP
          maxLength={4}
          value={pin}
          onChange={(v) => {
            setPin(v)
            if (v.length === 4) onComplete(v)
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

      <p className="mt-4 text-xs text-muted-foreground">
        {MAX_ATTEMPTS - attempts} attempt{MAX_ATTEMPTS - attempts === 1 ? "" : "s"} remaining
      </p>

      <Button
        variant="ghost"
        className="mt-8 gap-2"
        onClick={() => void logout()}
        aria-label="Sign out"
      >
        <LogOut className="size-4" aria-hidden />
        Sign out
      </Button>
    </div>
  )
}
