import { create } from "zustand"
import { PINStrength, PINCategory } from "@/lib/api/v2-pin-manager"
import * as pinManager from "@/lib/api/v2-pin-manager"

export interface PINManagerState {
  // Current PIN
  currentPIN: string
  currentStrength: PINStrength | null

  // PIN history
  pinHistory: string[]

  // Generation options
  generationMethod: "numeric" | "alphanumeric" | "custom"
  pinLength: number
  customCharacters: string

  // Actions
  generateNumericPIN: (length?: number) => void
  generateAlphanumericPIN: (length?: number) => void
  generateCustomPIN: (length?: number, characters?: string) => void
  evaluateStrength: (pin: string) => void
  addToHistory: (pin: string) => void
  clearHistory: () => void
  suggestCategory: (label: string) => PINCategory
  validatePIN: (pin: string, allowAlphanumeric?: boolean) => boolean
  copyToClipboard: (text: string) => Promise<void>
}

/**
 * PIN Manager state store using Zustand
 * Manages PIN generation, validation, and history
 */
export const usePINManagerStore = create<PINManagerState>((set, get) => ({
  currentPIN: "",
  currentStrength: null,
  pinHistory: [],
  generationMethod: "numeric",
  pinLength: 6,
  customCharacters: "0123456789",

  generateNumericPIN: (length = 6) => {
    const { pinHistory } = get()
    const pin = pinManager.generateNumericPIN(length)
    const strength = pinManager.evaluatePINStrength(pin)

    set({
      currentPIN: pin,
      currentStrength: strength,
      generationMethod: "numeric",
      pinLength: length,
      pinHistory: [...pinHistory, pin].slice(-20),
    })
  },

  generateAlphanumericPIN: (length = 8) => {
    const { pinHistory } = get()
    const pin = pinManager.generateAlphanumericPIN(length)
    const strength = pinManager.evaluatePINStrength(pin)

    set({
      currentPIN: pin,
      currentStrength: strength,
      generationMethod: "alphanumeric",
      pinLength: length,
      pinHistory: [...pinHistory, pin].slice(-20),
    })
  },

  generateCustomPIN: (length = 8, characters = "0123456789") => {
    const { pinHistory } = get()
    const pin = pinManager.generateCustomPIN(length, characters)
    const strength = pinManager.evaluatePINStrength(pin)

    set({
      currentPIN: pin,
      currentStrength: strength,
      generationMethod: "custom",
      pinLength: length,
      customCharacters: characters,
      pinHistory: [...pinHistory, pin].slice(-20),
    })
  },

  evaluateStrength: (pin: string) => {
    const strength = pinManager.evaluatePINStrength(pin)
    set({ currentStrength: strength })
  },

  addToHistory: (pin: string) => {
    if (pinManager.validatePIN(pin)) {
      set((state) => ({
        pinHistory: [...state.pinHistory, pin].slice(-20),
      }))
    }
  },

  clearHistory: () => set({ pinHistory: [] }),

  suggestCategory: (label: string) => {
    return pinManager.suggestPINCategory(label)
  },

  validatePIN: (pin: string, allowAlphanumeric = false) => {
    return pinManager.validatePIN(pin, allowAlphanumeric)
  },

  copyToClipboard: async (text: string) => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(text)
      } else {
        const textArea = document.createElement("textarea")
        textArea.value = text
        document.body.appendChild(textArea)
        textArea.select()
        document.execCommand("copy")
        document.body.removeChild(textArea)
      }
    } catch (err) {
      console.error("[v2] Failed to copy to clipboard:", err)
      throw err
    }
  },
}))
