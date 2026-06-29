"use client"

import { useMemo, useState } from "react"
import { Lock } from "lucide-react"
import { getHostname } from "@/lib/utils/sanitize"
import { cn } from "@/lib/utils"

interface Props {
  url?: string
  siteName?: string
  size?: number
  className?: string
}

export function FaviconImage({ url, siteName, size = 32, className }: Props) {
  const [errored, setErrored] = useState(false)
  const hostname = useMemo(() => getHostname(url || ""), [url])
  const src = hostname ? `https://www.google.com/s2/favicons?sz=64&domain=${hostname}` : ""

  if (!src || errored) {
    return (
      <div
        className={cn(
          "flex shrink-0 items-center justify-center rounded-md bg-secondary text-secondary-foreground",
          className,
        )}
        style={{ width: size, height: size }}
        aria-hidden
      >
        <Lock className="size-4" aria-hidden />
      </div>
    )
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src || "/placeholder.svg"}
      width={size}
      height={size}
      alt=""
      aria-label={siteName ? `${siteName} favicon` : undefined}
      onError={() => setErrored(true)}
      className={cn("shrink-0 rounded-md bg-secondary object-contain p-1", className)}
      style={{ width: size, height: size }}
      referrerPolicy="no-referrer"
    />
  )
}
