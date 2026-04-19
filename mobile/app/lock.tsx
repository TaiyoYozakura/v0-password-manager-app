import * as LocalAuth from "expo-local-authentication"
import { Stack, useRouter } from "expo-router"
import { useEffect, useState } from "react"
import { Pressable, Text, View } from "react-native"
import Toast from "react-native-toast-message"
import { Button } from "@/components/ui/button"
import { Screen } from "@/components/ui/screen"
import { PinKeypad } from "@/components/vault/pin-keypad"
import { useAuth } from "@/components/providers/auth-provider"

const MAX_ATTEMPTS = 5

export default function LockScreen() {
  const router = useRouter()
  const { profile, status, unlockWithPin, unlockWithBiometric, signOut } = useAuth()
  const [pin, setPin] = useState("")
  const [attempts, setAttempts] = useState(0)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (status === "signed-out") router.replace("/login")
    if (status === "needs-pin-setup") router.replace("/setup-pin")
    if (status === "unlocked") router.replace("/dashboard")
  }, [status, router])

  // Auto-prompt biometric on mount if enabled
  useEffect(() => {
    if (profile?.biometricEnabled) tryBiometric()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.biometricEnabled])

  const tryBiometric = async () => {
    const has = await LocalAuth.hasHardwareAsync()
    const enrolled = await LocalAuth.isEnrolledAsync()
    if (!has || !enrolled) return
    const ok = await unlockWithBiometric()
    if (!ok) {
      // user cancelled or biometric failed; stay on PIN
    }
  }

  const submit = async () => {
    if (pin.length < 4) return
    setBusy(true)
    const ok = await unlockWithPin(pin)
    setBusy(false)
    if (ok) return
    setPin("")
    const next = attempts + 1
    setAttempts(next)
    Toast.show({ type: "error", text1: "Incorrect PIN" })
    if (next >= MAX_ATTEMPTS) {
      Toast.show({ type: "error", text1: "Too many attempts", text2: "Signing out" })
      await signOut()
    }
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <Screen>
        <View className="flex-1 justify-between">
          <View className="items-center gap-2 pt-12">
            <View className="size-16 items-center justify-center rounded-3xl bg-primary/20">
              <Text className="text-3xl">{"\u{1F512}"}</Text>
            </View>
            <Text className="text-2xl font-bold text-text">Vault locked</Text>
            <Text className="text-base text-muted">
              Welcome back{profile?.displayName ? `, ${profile.displayName.split(" ")[0]}` : ""}
            </Text>
          </View>

          <PinKeypad value={pin} onChange={setPin} onSubmit={submit} showSubmit={!busy} />

          <View className="gap-3">
            {profile?.biometricEnabled ? (
              <Button
                label="Use biometric"
                variant="outline"
                onPress={tryBiometric}
                fullWidth
              />
            ) : null}
            <Pressable onPress={() => signOut()} className="self-center py-3">
              <Text className="text-sm text-muted">Sign out</Text>
            </Pressable>
          </View>
        </View>
      </Screen>
    </>
  )
}
