"use client"

import { ShieldCheck, Lock, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/components/providers/auth-provider"

export function MobileHeader() {
  const { logout, lock, profile } = useAuth()
  return (
    <header className="sticky top-0 z-20 flex items-center justify-between border-b border-border bg-background/95 px-4 py-3 backdrop-blur md:hidden">
      <div className="flex items-center gap-2">
        <div className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <ShieldCheck className="size-4" aria-hidden />
        </div>
        <span className="text-base font-semibold tracking-tight">Vaultly</span>
      </div>
      <div className="flex items-center gap-1">
        {profile?.appLockPinHash && (
          <Button variant="ghost" size="icon" onClick={lock} aria-label="Lock app">
            <Lock className="size-4" aria-hidden />
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => void logout()}
          aria-label="Sign out"
        >
          <LogOut className="size-4" aria-hidden />
        </Button>
      </div>
    </header>
  )
}
