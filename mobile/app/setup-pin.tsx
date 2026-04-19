import * as LocalAuth from "expo-local-authentication"
import { Stack, useRouter } from "expo-router"
import { useEffect, useState } from "react"
import { Pressable, Text, View } from "react-native"
import Toast from "react-native-toast-message"
import { Screen } from "@/components/ui/screen"
import { PinKeypad } from "@/components/vault/pin-keypad"
import { useAuth } from "@/components/providers/auth-provider"

export default function SetupPinScreen() {
  const router = useRouter()
  const { status, setupPin, signOut } = useAuth()
  const [stage, setStage] = useState<"create" | "confirm">("create")
  const [pin, setPin] = useState("")
  const [confirm, setConfirm] = useState("")
  const [enableBiometric, setEnableBiometric] = useState(true)
  const [biometricAvailable, setBiometricAvailable] = useState(false)

  useEffect(() => {
    LocalAuth.hasHardwareAsync().then(async (has) => {
      const enrolled = await LocalAuth.isEnrolledAsync()
      setBiometricAvailable(has && enrolled)
      if (!has || !enrolled) setEnableBiometric(false)
    })
  }, [])

  useEffect(() => {
    if (status === "signed-out") router.replace("/login")
    if (status === "unlocked") router.replace("/dashboard")
  }, [status, router])

  const submit = async () => {
    if (stage === "create") {
      if (pin.length < 4) {
        Toast.show({ type: "error", text1: "PIN must be at least 4 digits" })
        return
      }
      setStage("confirm")
      return
    }
    if (confirm !== pin) {
      Toast.show({ type: "error", text1: "PINs do not match" })
      setConfirm("")
      return
    }
    try {
      await setupPin(pin, enableBiometric && biometricAvailable)
      router.replace("/dashboard")
    } catch (e) {
      Toast.show({ type: "error", text1: "Setup failed", text2: String((e as Error).message) })
    }
  }

  const value = stage === "create" ? pin : confirm
  const setValue = stage === "create" ? setPin : setConfirm

  return (
    <>
      <Stack.Screen options={{ title: "Create PIN" }} />
      <Screen>
        <View className="flex-1 justify-between">
          <View className="gap-2">
            <Text className="text-2xl font-bold text-text">
              {stage === "create" ? "Create your PIN" : "Confirm your PIN"}
            </Text>
            <Text className="text-base text-muted">
              {stage === "create"
                ? "Choose a 4–8 digit PIN. We use it to derive your encryption key. We can't recover it."
                : "Enter the same PIN again to confirm."}
            </Text>
          </View>

          <PinKeypad value={value} onChange={setValue} onSubmit={submit} showSubmit />

          {stage === "create" && biometricAvailable ? (
            <Pressable
              onPress={() => setEnableBiometric((v) => !v)}
              className="flex-row items-center justify-between rounded-2xl border border-border bg-card p-4"
            >
              <View className="flex-1 pr-3">
                <Text className="text-base font-semibold text-text">
                  Enable biometric unlock
                </Text>
                <Text className="text-sm text-muted">
                  Use Face ID / Touch ID / fingerprint instead of typing your PIN every time.
                </Text>
              </View>
              <View
                className={`h-7 w-12 justify-center rounded-full p-1 ${enableBiometric ? "bg-primary" : "bg-border"}`}
              >
                <View
                  className={`size-5 rounded-full bg-white ${enableBiometric ? "self-end" : "self-start"}`}
                />
              </View>
            </Pressable>
          ) : null}

          <Pressable onPress={() => signOut()} className="self-center py-3">
            <Text className="text-sm text-muted">Sign out</Text>
          </Pressable>
        </View>
      </Screen>
    </>
  )
}
