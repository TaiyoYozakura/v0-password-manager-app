"use client"

import { useEffect, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/providers/auth-provider"
import { SidebarNav } from "@/components/layout/sidebar-nav"
import { BottomNav } from "@/components/layout/bottom-nav"
import { MobileHeader } from "@/components/layout/mobile-header"
import { AppLockScreen } from "@/components/vault/app-lock-screen"
import { PinSetup } from "@/components/vault/pin-setup"
import { Spinner } from "@/components/ui/spinner"

export default function AppShellLayout({ children }: { children: ReactNode }) {
  const router = useRouter()
  const { user, loading, profile, profileLoaded, locked } = useAuth()

  useEffect(() => {
    if (loading) return
    if (!user) router.replace("/login")
  }, [user, loading, router])

  if (loading || !user) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background">
        <Spinner className="size-6" />
      </div>
    )
  }

  // First-time PIN setup gate
  const needsPinSetup = profileLoaded && !profile?.appLockPinHash

  return (
    <div className="flex min-h-dvh bg-background">
      <SidebarNav />
      <div className="flex min-w-0 flex-1 flex-col">
        <MobileHeader />
        <main className="min-w-0 flex-1 pb-20 md:pb-0">{children}</main>
      </div>
      <BottomNav />

      {needsPinSetup && <PinSetup />}
      {!needsPinSetup && locked && <AppLockScreen />}
    </div>
  )
}
