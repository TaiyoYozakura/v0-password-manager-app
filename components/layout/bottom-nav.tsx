"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, KeyRound, Globe2, AtSign, Share2, Hash, Wand2, Settings } from "lucide-react"
import { cn } from "@/lib/utils"

const items = [
  { href: "/dashboard", label: "Home", icon: LayoutDashboard },
  { href: "/passwords", label: "Passwords", icon: KeyRound },
  { href: "/websites", label: "Sites", icon: Globe2 },
  { href: "/identities", label: "Emails", icon: AtSign },
  { href: "/connection-map", label: "Map", icon: Share2 },
  { href: "/pins", label: "PINs", icon: Hash },
  { href: "/generator", label: "Generate", icon: Wand2 },
  { href: "/settings", label: "Settings", icon: Settings },
]

export function BottomNav() {
  const pathname = usePathname()
  return (
    <nav
      aria-label="Main navigation"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 backdrop-blur md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="mx-auto grid w-full max-w-4xl grid-cols-4">
        {items.map((item) => {
          const active = pathname === item.href || pathname?.startsWith(item.href + "/")
          const Icon = item.icon
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  "flex min-w-[4.5rem] flex-col items-center gap-1 px-1 py-2.5 text-xs font-medium transition-colors",
                  active ? "text-primary" : "text-muted-foreground hover:text-foreground",
                )}
                aria-current={active ? "page" : undefined}
              >
                <Icon className="size-5" aria-hidden />
                <span className="text-[11px] leading-none">{item.label}</span>
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
