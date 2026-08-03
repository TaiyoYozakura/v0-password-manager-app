import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'

interface SettingsState {
  autoLockTimeout: number // minutes
  biometricEnabled: boolean
  darkModeEnabled: boolean
  notificationsEnabled: boolean
  autoFillEnabled: boolean
  masterPinEnabled: boolean
  masterPin: string | null
  lastBackupDate: string | null

  setAutoLockTimeout: (timeout: number) => void
  setBiometricEnabled: (enabled: boolean) => void
  setDarkModeEnabled: (enabled: boolean) => void
  setNotificationsEnabled: (enabled: boolean) => void
  setAutoFillEnabled: (enabled: boolean) => void
  setMasterPinEnabled: (enabled: boolean) => void
  setMasterPin: (pin: string) => void
  setLastBackupDate: (date: string) => void
  resetSettings: () => void
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      autoLockTimeout: 5,
      biometricEnabled: false,
      darkModeEnabled: true,
      notificationsEnabled: true,
      autoFillEnabled: true,
      masterPinEnabled: false,
      masterPin: null,
      lastBackupDate: null,

      setAutoLockTimeout: (timeout) =>
        set({
          autoLockTimeout: timeout,
        }),

      setBiometricEnabled: (enabled) =>
        set({
          biometricEnabled: enabled,
        }),

      setDarkModeEnabled: (enabled) =>
        set({
          darkModeEnabled: enabled,
        }),

      setNotificationsEnabled: (enabled) =>
        set({
          notificationsEnabled: enabled,
        }),

      setAutoFillEnabled: (enabled) =>
        set({
          autoFillEnabled: enabled,
        }),

      setMasterPinEnabled: (enabled) =>
        set({
          masterPinEnabled: enabled,
        }),

      setMasterPin: (pin) =>
        set({
          masterPin: pin,
        }),

      setLastBackupDate: (date) =>
        set({
          lastBackupDate: date,
        }),

      resetSettings: () =>
        set({
          autoLockTimeout: 5,
          biometricEnabled: false,
          darkModeEnabled: true,
          notificationsEnabled: true,
          autoFillEnabled: true,
          masterPinEnabled: false,
          masterPin: null,
          lastBackupDate: null,
        }),
    }),
    {
      name: 'settings-storage',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
)
