'use client'

import { useEffect, useRef } from 'react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  siteName?: string
}

export function SavePasswordPrompt({ open, onOpenChange, onConfirm, siteName }: Props) {
  const dialogRef = useRef<HTMLDivElement>(null)

  // Handle Esc key
  useEffect(() => {
    if (!open) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        onOpenChange(false)
      }
    }

    // Listen on document with capture to ensure we catch it
    document.addEventListener('keydown', handleKeyDown, true)
    return () => document.removeEventListener('keydown', handleKeyDown, true)
  }, [open, onOpenChange])

  // Handle click outside
  useEffect(() => {
    if (!open) return

    const handleClickOutside = (e: MouseEvent) => {
      if (dialogRef.current && !dialogRef.current.contains(e.target as Node)) {
        // Check if click is outside the dialog content
        const target = e.target as HTMLElement
        if (!target.closest('[role="alertdialog"]')) {
          onOpenChange(false)
        }
      }
    }

    document.addEventListener('mousedown', handleClickOutside, true)
    return () => document.removeEventListener('mousedown', handleClickOutside, true)
  }, [open, onOpenChange])

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent ref={dialogRef}>
        <AlertDialogHeader>
          <AlertDialogTitle>Save Password?</AlertDialogTitle>
          <AlertDialogDescription>
            {siteName ? (
              <>
                Do you want to save the password for <strong>{siteName}</strong>?
              </>
            ) : (
              'Do you want to save this password?'
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="flex justify-end gap-3">
          <AlertDialogCancel>Not now</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>Save</AlertDialogAction>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  )
}
