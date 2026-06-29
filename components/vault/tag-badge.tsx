import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { getTagIcon } from "@/lib/utils/tag-icons"

interface Props {
  tag: string
  className?: string
  showIcon?: boolean
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

export function TagBadge({ tag, className, showIcon = true }: Props) {
  const idx = hashTag(tag || "Other") % palettes.length
  const displayTag = tag || "Other"
  const IconComponent = showIcon ? getTagIcon(displayTag) : null

  return (
    <Badge
      variant="outline"
      className={cn("border font-medium capitalize inline-flex items-center gap-1.5", palettes[idx], className)}
    >
      {IconComponent && (
        <IconComponent className="size-3.5 flex-shrink-0" aria-hidden />
      )}
      {displayTag}
    </Badge>
  )
}
