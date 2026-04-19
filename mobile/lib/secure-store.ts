import * as SecureStore from "expo-secure-store"

const PIN_KEY = (uid: string) => `vault.pin.${uid}`

export async function saveBiometricPin(uid: string, pin: string) {
  await SecureStore.setItemAsync(PIN_KEY(uid), pin, {
    requireAuthentication: true,
    keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
    authenticationPrompt: "Unlock vault",
  })
}

export async function getBiometricPin(uid: string): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(PIN_KEY(uid), {
      requireAuthentication: true,
      keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
      authenticationPrompt: "Unlock vault",
    })
  } catch {
    return null
  }
}

export async function clearBiometricPin(uid: string) {
  try {
    await SecureStore.deleteItemAsync(PIN_KEY(uid))
  } catch {
    // ignore
  }
}
