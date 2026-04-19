import * as Clipboard from "expo-clipboard"
import { useCallback, useEffect, useRef } from "react"
import Toast from "react-native-toast-message"

const CLEAR_AFTER_MS = 30_000

export function useSecureClipboard() {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current)
    }
  }, [])

  const copy = useCallback(async (value: string, label = "Copied") => {
    if (!value) return
    await Clipboard.setStringAsync(value)
    Toast.show({
      type: "success",
      text1: label,
      text2: "Clipboard auto-clears in 30s",
      position: "bottom",
      visibilityTime: 2000,
    })
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(async () => {
      try {
        const current = await Clipboard.getStringAsync()
        if (current === value) {
          await Clipboard.setStringAsync("")
        }
      } catch {
        // ignore
      }
    }, CLEAR_AFTER_MS)
  }, [])

  return { copy }
}
