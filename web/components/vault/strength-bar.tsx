"use client"

import { useMemo } from "react"
import { scorePassword } from "@/lib/crypto/passwordStrength"
import { cn } from "@/lib/utils"

interface Props {
  password: string
  className?: string
}

export function StrengthBar({ password, className }: Props) {
  const result = useMemo(() => scorePassword(password), [password])
  const segments = 4
  const activeCount =
    result.level === "empty"
      ? 0
      : result.level === "weak"
        ? 1
        : result.level === "fair"
          ? 2
          : result.level === "strong"
            ? 3
            : 4

  const activeColor =
    result.level === "weak"
      ? "bg-destructive"
      : result.level === "fair"
        ? "bg-chart-4"
        : result.level === "strong"
          ? "bg-chart-2"
          : result.level === "very-strong"
            ? "bg-chart-2"
            : "bg-muted"

  const textColor =
    result.level === "weak"
      ? "text-destructive"
      : result.level === "fair"
        ? "text-chart-4"
        : result.level === "strong" || result.level === "very-strong"
          ? "text-chart-2"
          : "text-muted-foreground"

  return (
    <div className={cn("flex flex-col gap-1.5", className)} aria-live="polite">
      <div className="flex gap-1.5">
        {Array.from({ length: segments }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "h-1.5 flex-1 rounded-full transition-colors",
              i < activeCount ? activeColor : "bg-muted",
            )}
          />
        ))}
      </div>
      <div className="flex items-center justify-between text-xs">
        <span className={cn("font-medium", textColor)}>{result.label}</span>
        <span className="text-muted-foreground">{password.length} chars</span>
      </div>
    </div>
  )
}
