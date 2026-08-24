"use client"

import { useCallback, useEffect, useRef } from "react"
import toast from "react-hot-toast"

const CLEAR_MS = 30_000

export function useSecureClipboard() {
  const clearTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const toastIdRef = useRef<string | null>(null)
  const lastCopiedRef = useRef<string | null>(null)

  const cancel = useCallback(() => {
    if (clearTimerRef.current) {
      clearTimeout(clearTimerRef.current)
      clearTimerRef.current = null
    }
    if (countdownRef.current) {
      clearInterval(countdownRef.current)
      countdownRef.current = null
    }
    if (toastIdRef.current) {
      toast.dismiss(toastIdRef.current)
      toastIdRef.current = null
    }
  }, [])

  const copy = useCallback(
    async (value: string, label = "Copied") => {
      try {
        await navigator.clipboard.writeText(value)
        lastCopiedRef.current = value

        cancel()

        let remaining = CLEAR_MS / 1000
        const id = toast.success(`${label}! Clears in ${remaining}s`, {
          duration: CLEAR_MS,
          id: "secure-clipboard",
        })
        toastIdRef.current = id

        countdownRef.current = setInterval(() => {
          remaining -= 1
          if (remaining > 0) {
            toast.success(`${label}! Clears in ${remaining}s`, {
              id: "secure-clipboard",
              duration: CLEAR_MS,
            })
          }
        }, 1000)

        clearTimerRef.current = setTimeout(async () => {
          try {
            // Only overwrite if the clipboard still contains the sensitive value
            const current = await navigator.clipboard.readText().catch(() => "")
            if (!current || current === lastCopiedRef.current) {
              await navigator.clipboard.writeText("")
            }
          } catch {
            // readText may be blocked; attempt blind overwrite
            try {
              await navigator.clipboard.writeText("")
            } catch {
              // ignore
            }
          } finally {
            lastCopiedRef.current = null
            if (countdownRef.current) {
              clearInterval(countdownRef.current)
              countdownRef.current = null
            }
            toast.success("Clipboard cleared", { id: "secure-clipboard", duration: 2000 })
            toastIdRef.current = null
          }
        }, CLEAR_MS)
      } catch {
        toast.error("Could not access clipboard")
      }
    },
    [cancel],
  )

  useEffect(() => {
    return () => {
      cancel()
    }
  }, [cancel])

  return { copy, cancel }
}
