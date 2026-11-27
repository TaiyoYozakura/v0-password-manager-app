"use client"

import { ShieldCheck, Lock, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/components/providers/auth-provider"

export function MobileHeader() {
  const { logout, lock, profile } = useAuth()
  return (
    <header className="sticky top-0 z-20 flex items-center justify-between border-b border-border/80 bg-background/90 px-4 py-3 backdrop-blur-xl md:hidden">
      <div className="flex items-center gap-2.5">
        <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm shadow-primary/20">
          <ShieldCheck className="size-4" aria-hidden />
        </div>
        <span className="text-[15px] font-semibold tracking-[-0.04em]">vaultly</span>
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
