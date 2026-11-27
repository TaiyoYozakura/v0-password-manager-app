"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  KeyRound,
  Hash,
  Wand2,
  Globe2,
  AtSign,
  Share2,
  Settings,
  ShieldCheck,
  LogOut,
  Lock,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useAuth } from "@/components/providers/auth-provider"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const sections = [
  {
    label: "VAULT",
    items: [
      { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
      { href: "/passwords", label: "Passwords", icon: KeyRound },
      { href: "/websites", label: "Websites", icon: Globe2 },
      { href: "/identities", label: "Email identities", icon: AtSign },
      { href: "/pins", label: "PINs", icon: Hash },
    ],
  },
  {
    label: "TOOLS",
    items: [
      { href: "/connection-map", label: "Connection map", icon: Share2 },
      { href: "/generator", label: "Password generator", icon: Wand2 },
    ],
  },
]

export function SidebarNav() {
  const pathname = usePathname()
  const { user, logout, lock, profile } = useAuth()

  return (
    <aside className="sticky top-0 hidden h-dvh w-[264px] shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground md:flex">
      <Link href="/dashboard" className="group flex items-center gap-3 px-6 py-6" aria-label="Vaultly overview">
        <span className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-[0_8px_24px_-12px_color-mix(in_srgb,var(--primary)_75%,transparent)] transition-transform group-hover:rotate-[-5deg]">
          <ShieldCheck className="size-5" aria-hidden />
        </span>
        <span className="min-w-0">
          <span className="block text-[17px] font-semibold tracking-[-0.04em]">vaultly</span>
          <span className="block text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">Private by design</span>
        </span>
      </Link>

      <nav className="flex flex-1 flex-col gap-7 px-3 pt-4" aria-label="Main navigation">
        {sections.map((section) => (
          <div key={section.label}>
            <p className="mb-2 px-3 text-[10px] font-semibold tracking-[0.18em] text-muted-foreground/70">
              {section.label}
            </p>
            <div className="flex flex-col gap-1">
              {section.items.map((item) => {
                const active = pathname === item.href || pathname?.startsWith(item.href + "/")
                const Icon = item.icon
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring",
                      active
                        ? "bg-sidebar-accent text-sidebar-accent-foreground"
                        : "text-sidebar-foreground/65 hover:bg-sidebar-accent/70 hover:text-sidebar-foreground",
                    )}
                    aria-current={active ? "page" : undefined}
                  >
                    {active && <span className="absolute inset-y-2 left-0 w-[2px] rounded-full bg-sidebar-primary" aria-hidden />}
                    <Icon className={cn("size-[17px] transition-colors", active ? "text-sidebar-primary" : "text-muted-foreground group-hover:text-sidebar-foreground")} aria-hidden />
                    <span>{item.label}</span>
                  </Link>
                )
              })}
            </div>
          </div>
        ))}

        <div className="mt-auto pb-4">
          <Link
            href="/settings"
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring",
              pathname === "/settings" ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-sidebar-foreground/65 hover:bg-sidebar-accent/70 hover:text-sidebar-foreground",
            )}
            aria-current={pathname === "/settings" ? "page" : undefined}
          >
            <Settings className="size-[17px] text-muted-foreground" aria-hidden />
            Settings
          </Link>
        </div>
      </nav>

      <div className="border-t border-sidebar-border p-4">
        <div className="flex items-center gap-3 rounded-xl bg-secondary/55 p-3">
          <Avatar className="size-9 ring-1 ring-border">
            <AvatarImage src={user?.photoURL || undefined} alt="" />
            <AvatarFallback className="bg-accent text-xs font-semibold text-accent-foreground">
              {(user?.displayName || user?.email || "?").slice(0, 1).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold">{user?.displayName || "Signed in"}</p>
            <p className="truncate text-[11px] text-muted-foreground">{user?.email}</p>
          </div>
        </div>
        <div className="mt-2 flex gap-2">
          {profile?.appLockPinHash && (
            <Button variant="ghost" size="sm" className="flex-1 justify-start gap-2 text-xs text-muted-foreground hover:text-foreground" onClick={lock} aria-label="Lock app">
              <Lock className="size-3.5" aria-hidden /> Lock
            </Button>
          )}
          <Button variant="ghost" size="sm" className="flex-1 justify-start gap-2 text-xs text-muted-foreground hover:text-foreground" onClick={() => void logout()} aria-label="Sign out">
            <LogOut className="size-3.5" aria-hidden /> Sign out
          </Button>
        </div>
      </div>
    </aside>
  )
}
