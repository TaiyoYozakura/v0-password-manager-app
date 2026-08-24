import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface Props {
  tag: string
  className?: string
}

// Deterministic subtle coloring per tag using HSL from a hash, mixed with theme tokens.
function hashTag(tag: string): number {
  let h = 0
  for (let i = 0; i < tag.length; i++) h = (h << 5) - h + tag.charCodeAt(i)
  return Math.abs(h)
}

const palettes = [
  "bg-chart-1/15 text-chart-1 border-chart-1/30",
  "bg-chart-2/15 text-chart-2 border-chart-2/30",
  "bg-chart-3/20 text-chart-3 border-chart-3/30",
  "bg-chart-4/15 text-chart-4 border-chart-4/30",
  "bg-chart-5/15 text-chart-5 border-chart-5/30",
]

export function TagBadge({ tag, className }: Props) {
  const idx = hashTag(tag || "Other") % palettes.length
  return (
    <Badge
      variant="outline"
      className={cn("border font-medium capitalize", palettes[idx], className)}
    >
      {tag || "Other"}
    </Badge>
  )
}
