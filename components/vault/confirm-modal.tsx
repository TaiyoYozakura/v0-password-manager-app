"use client"

import { useEffect, useState, type ReactNode } from "react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: ReactNode
  confirmText?: string
  cancelText?: string
  destructive?: boolean
  // When set, the user must type this string exactly to enable Confirm.
  typeToConfirm?: string
  onConfirm: () => void | Promise<void>
}

export function ConfirmModal({
  open,
  onOpenChange,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  destructive = false,
  typeToConfirm,
  onConfirm,
}: Props) {
  const [value, setValue] = useState("")
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!open) {
      setValue("")
      setBusy(false)
    }
  }, [open])

  const canConfirm = typeToConfirm ? value.trim() === typeToConfirm : true

  const handleConfirm = async (e: React.MouseEvent) => {
    if (!canConfirm) return
    e.preventDefault()
    setBusy(true)
    try {
      await onConfirm()
    } finally {
      setBusy(false)
      onOpenChange(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          {description && <AlertDialogDescription asChild><div>{description}</div></AlertDialogDescription>}
        </AlertDialogHeader>

        {typeToConfirm && (
          <div className="flex flex-col gap-2">
            <Label htmlFor="confirm-input" className="text-sm">
              Type <span className="font-mono font-semibold">{typeToConfirm}</span> to confirm
            </Label>
            <Input
              id="confirm-input"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              autoComplete="off"
              autoFocus
            />
          </div>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={busy}>{cancelText}</AlertDialogCancel>
          <AlertDialogAction
            disabled={!canConfirm || busy}
            onClick={handleConfirm}
            className={cn(
              destructive &&
                buttonVariants({ variant: "destructive" }),
            )}
          >
            {busy ? "Working..." : confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
