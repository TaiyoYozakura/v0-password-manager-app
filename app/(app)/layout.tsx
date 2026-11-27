"use client"

import { useEffect, type ReactNode } from "react"
import { usePathname, useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import { Moon, Sun } from "lucide-react"
import { useAuth } from "@/components/providers/auth-provider"
import { SidebarNav } from "@/components/layout/sidebar-nav"
import { BottomNav } from "@/components/layout/bottom-nav"
import { MobileHeader } from "@/components/layout/mobile-header"
import { AppLockScreen } from "@/components/vault/app-lock-screen"
import { PinSetup } from "@/components/vault/pin-setup"
import { Spinner } from "@/components/ui/spinner"
import { Button } from "@/components/ui/button"

const pageTitles: Record<string, string> = {
  "/dashboard": "Overview",
  "/passwords": "Passwords",
  "/websites": "Websites",
  "/identities": "Email identities",
  "/connection-map": "Connection map",
  "/pins": "PINs",
  "/generator": "Password generator",
  "/settings": "Settings",
}

function DesktopTopbar() {
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()
  const title = Object.entries(pageTitles).find(([path]) => pathname === path || pathname.startsWith(`${path}/`))?.[1] ?? "Vault"
  const dark = theme === "dark"

  return (
    <header className="sticky top-0 z-20 hidden h-[68px] items-center justify-between border-b border-border/70 bg-background/90 px-8 backdrop-blur-xl md:flex">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.17em] text-muted-foreground">Your private space</p>
        <h1 className="mt-0.5 text-sm font-semibold tracking-tight">{title}</h1>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="rounded-lg text-muted-foreground hover:text-foreground"
        onClick={() => setTheme(dark ? "light" : "dark")}
        aria-label={`Switch to ${dark ? "light" : "dark"} theme`}
        title={`Switch to ${dark ? "light" : "dark"} theme`}
      >
        {dark ? <Sun className="size-4" aria-hidden /> : <Moon className="size-4" aria-hidden />}
      </Button>
    </header>
  )
}

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

  const needsPinSetup = profileLoaded && !profile?.appLockPinHash

  return (
    <div className="flex min-h-dvh bg-background">
      <SidebarNav />
      <div className="flex min-w-0 flex-1 flex-col">
        <DesktopTopbar />
        <MobileHeader />
        <main className="min-w-0 flex-1 pb-20 md:pb-0">{children}</main>
      </div>
      <BottomNav />

      {needsPinSetup && <PinSetup />}
      {!needsPinSetup && locked && <AppLockScreen />}
    </div>
  )
}
