import { create } from "zustand"
import { PasswordGeneratorOptions, PasswordStrength } from "@/lib/api/v2-password-generator"
import * as pwdGen from "@/lib/api/v2-password-generator"

export interface PasswordGeneratorState {
  // Generated password
  currentPassword: string
  currentStrength: PasswordStrength | null

  // Generator options
  options: PasswordGeneratorOptions
  passwordHistory: string[]

  // Actions
  generate: (options?: PasswordGeneratorOptions) => void
  setOptions: (options: Partial<PasswordGeneratorOptions>) => void
  generatePassphrase: (wordCount?: number, separator?: string, capitalize?: boolean) => void
  evaluateStrength: (password: string) => void
  addToHistory: (password: string) => void
  clearHistory: () => void
  copyToClipboard: (text: string) => Promise<void>
}

/**
 * Password generator state store using Zustand
 * Manages password generation and strength evaluation
 */
export const usePasswordGeneratorStore = create<PasswordGeneratorState>((set, get) => ({
  currentPassword: "",
  currentStrength: null,
  options: {
    length: 16,
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: false,
    excludeAmbiguous: false,
    minUppercase: 0,
    minLowercase: 0,
    minNumbers: 0,
    minSymbols: 0,
  },
  passwordHistory: [],

  generate: (options?: PasswordGeneratorOptions) => {
    const { passwordHistory } = get()
    const opts = options || get().options

    const password = pwdGen.generatePassword(opts)
    const strength = pwdGen.evaluatePasswordStrength(password)

    set({
      currentPassword: password,
      currentStrength: strength,
      options: opts,
      passwordHistory: [...passwordHistory, password].slice(-20), // Keep last 20
    })
  },

  setOptions: (options: Partial<PasswordGeneratorOptions>) => {
    set((state) => ({
      options: { ...state.options, ...options },
    }))
  },

  generatePassphrase: (wordCount = 4, separator = "-", capitalize = true) => {
    const { passwordHistory } = get()
    const passphrase = pwdGen.generatePassphrase(wordCount, separator, capitalize)
    const strength = pwdGen.evaluatePasswordStrength(passphrase)

    set({
      currentPassword: passphrase,
      currentStrength: strength,
      passwordHistory: [...passwordHistory, passphrase].slice(-20),
    })
  },

  evaluateStrength: (password: string) => {
    const strength = pwdGen.evaluatePasswordStrength(password)
    set({ currentStrength: strength })
  },

  addToHistory: (password: string) => {
    set((state) => ({
      passwordHistory: [...state.passwordHistory, password].slice(-20),
    }))
  },

  clearHistory: () => set({ passwordHistory: [] }),

  copyToClipboard: async (text: string) => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(text)
      } else {
        // Fallback for older browsers
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
