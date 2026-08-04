'use client'

import { Button } from '@/components/ui/button'
import { History } from 'lucide-react'

interface Props {
  onClick: () => void
  className?: string
}

export function SavedPasswordTrigger({ onClick, className }: Props) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={onClick}
      className={className}
      aria-label="Open saved passwords list"
      title="Open saved passwords"
    >
      <History className="size-4" />
    </Button>
  )
}
