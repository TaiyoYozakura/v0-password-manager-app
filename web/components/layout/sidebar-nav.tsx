"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  KeyRound,
  Hash,
  Wand2,
  Settings,
  ShieldCheck,
  LogOut,
  Lock,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useAuth } from "@/components/providers/auth-provider"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const items = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/passwords", label: "Passwords", icon: KeyRound },
  { href: "/pins", label: "PINs", icon: Hash },
  { href: "/generator", label: "Generator", icon: Wand2 },
  { href: "/settings", label: "Settings", icon: Settings },
]

export function SidebarNav() {
  const pathname = usePathname()
  const { user, logout, lock, profile } = useAuth()

  return (
    <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-r border-border bg-sidebar text-sidebar-foreground md:flex">
      <div className="flex items-center gap-2 px-5 py-5">
        <div className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <ShieldCheck className="size-4" aria-hidden />
        </div>
        <span className="text-lg font-semibold tracking-tight">Vaultly</span>
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-3" aria-label="Main navigation">
        {items.map((item) => {
          const active = pathname === item.href || pathname?.startsWith(item.href + "/")
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              )}
              aria-current={active ? "page" : undefined}
            >
              <Icon className="size-4" aria-hidden />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      <div className="mt-auto flex flex-col gap-2 border-t border-sidebar-border p-3">
        <div className="flex items-center gap-3 rounded-md px-2 py-2">
          <Avatar className="size-8">
            <AvatarImage src={user?.photoURL || undefined} alt="" />
            <AvatarFallback>
              {(user?.displayName || user?.email || "?").slice(0, 1).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{user?.displayName || "Signed in"}</p>
            <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
          </div>
        </div>
        <div className="flex gap-2">
          {profile?.appLockPinHash && (
            <Button
              variant="outline"
              size="sm"
              className="flex-1 gap-2"
              onClick={lock}
              aria-label="Lock app"
            >
              <Lock className="size-4" aria-hidden />
              Lock
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            className="flex-1 gap-2"
            onClick={() => void logout()}
            aria-label="Sign out"
          >
            <LogOut className="size-4" aria-hidden />
            Sign out
          </Button>
        </div>
      </div>
    </aside>
  )
}
