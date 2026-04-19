import * as LocalAuth from "expo-local-authentication"
import { useEffect, useState } from "react"
import { Alert, Pressable, Text, View } from "react-native"
import Toast from "react-native-toast-message"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Screen } from "@/components/ui/screen"
import { useAuth } from "@/components/providers/auth-provider"
import { PinKeypad } from "@/components/vault/pin-keypad"

const TIMEOUT_OPTIONS = [1, 5, 15, 30] as const

export default function SettingsScreen() {
  const {
    profile,
    user,
    setBiometricEnabled,
    setAutoLogoutMinutes,
    changePin,
    lock,
    signOut,
  } = useAuth()

  const [biometricAvailable, setBiometricAvailable] = useState(false)
  const [changing, setChanging] = useState<"none" | "current" | "new">("none")
  const [oldPin, setOldPin] = useState("")
  const [newPin, setNewPin] = useState("")

  useEffect(() => {
    LocalAuth.hasHardwareAsync().then(async (has) => {
      const enrolled = await LocalAuth.isEnrolledAsync()
      setBiometricAvailable(has && enrolled)
    })
  }, [])

  const toggleBiometric = async (next: boolean) => {
    if (!biometricAvailable && next) {
      Toast.show({ type: "error", text1: "No biometric configured on this device" })
      return
    }
    if (next) {
      Alert.alert(
        "Enable biometric",
        "You'll be prompted for your PIN once to encrypt it for biometric unlock.",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Continue",
            onPress: () => setChanging("current"),
          },
        ],
      )
    } else {
      await setBiometricEnabled(false)
      Toast.show({ type: "success", text1: "Biometric disabled" })
    }
  }

  const onPinSubmit = async () => {
    if (changing === "current") {
      // Used both for enabling biometric (just need to confirm PIN once)
      // and for changing PIN (verify old, then collect new)
      if (oldPin.length < 4) return
      // Try a no-op: derive verifier compare via changePin would consume it,
      // so we instead route into either enableBiometric or new PIN entry.
      // Simplest: ask user what they want via two flows triggered from buttons.
      // Here we treat this stage as "verify PIN to enable biometric"
      try {
        await setBiometricEnabled(true, oldPin)
        Toast.show({ type: "success", text1: "Biometric enabled" })
      } catch (e) {
        Toast.show({ type: "error", text1: "Failed", text2: String((e as Error).message) })
      }
      setChanging("none")
      setOldPin("")
    }
  }

  const startChangePin = () => {
    setOldPin("")
    setNewPin("")
    Alert.prompt?.(
      "Current PIN",
      "Enter your current PIN to continue",
      async (current) => {
        if (!current) return
        Alert.prompt?.(
          "New PIN",
          "Enter your new PIN (4-8 digits)",
          async (next) => {
            if (!next || next.length < 4) {
              Toast.show({ type: "error", text1: "PIN too short" })
              return
            }
            try {
              await changePin(current, next)
              Toast.show({ type: "success", text1: "PIN changed" })
            } catch (e) {
              Toast.show({ type: "error", text1: "Failed", text2: String((e as Error).message) })
            }
          },
          "secure-text",
        )
      },
      "secure-text",
    )
  }

  if (changing !== "none") {
    return (
      <Screen>
        <View className="flex-1 justify-between">
          <View className="gap-2">
            <Text className="text-2xl font-bold text-text">Confirm PIN</Text>
            <Text className="text-base text-muted">
              Enter your current PIN to enable biometric unlock.
            </Text>
          </View>
          <PinKeypad value={oldPin} onChange={setOldPin} onSubmit={onPinSubmit} showSubmit />
          <Pressable onPress={() => setChanging("none")} className="self-center py-3">
            <Text className="text-sm text-muted">Cancel</Text>
          </Pressable>
        </View>
      </Screen>
    )
  }

  return (
    <Screen scroll>
      <Card className="mb-4 gap-1">
        <Text className="text-xs uppercase tracking-wide text-muted">Account</Text>
        <Text className="text-base font-semibold text-text">
          {profile?.displayName ?? "—"}
        </Text>
        <Text className="text-sm text-muted">{user?.email ?? ""}</Text>
      </Card>

      <Text className="mb-2 text-sm font-semibold text-text">Security</Text>
      <Card className="mb-4 gap-4">
        <Row
          label="Biometric unlock"
          hint={biometricAvailable ? "Use Face ID / Touch ID / fingerprint" : "Not available on this device"}
        >
          <Toggle
            value={!!profile?.biometricEnabled && biometricAvailable}
            onChange={toggleBiometric}
            disabled={!biometricAvailable}
          />
        </Row>
        <Pressable
          onPress={startChangePin}
          className="rounded-xl border border-border bg-surface px-3 py-3"
        >
          <Text className="text-base font-medium text-text">Change PIN</Text>
          <Text className="text-xs text-muted">
            Re-derives your encryption key. Existing items remain decryptable until re-saved.
          </Text>
        </Pressable>
      </Card>

      <Text className="mb-2 text-sm font-semibold text-text">Auto-lock</Text>
      <Card className="mb-4 flex-row gap-2">
        {TIMEOUT_OPTIONS.map((m) => {
          const active = profile?.autoLogoutMinutes === m
          return (
            <Pressable
              key={m}
              onPress={() => setAutoLogoutMinutes(m)}
              className={`flex-1 items-center rounded-xl border py-2 ${active ? "border-primary bg-primary/20" : "border-border bg-surface"}`}
            >
              <Text className={`text-sm ${active ? "text-primary" : "text-text"}`}>{m}m</Text>
            </Pressable>
          )
        })}
      </Card>

      <View className="gap-3">
        <Button label="Lock vault" variant="secondary" onPress={lock} fullWidth />
        <Button label="Sign out" variant="danger" onPress={signOut} fullWidth />
      </View>

      <Text className="mt-6 text-center text-xs text-muted">
        Vault uses AES-256 with a key derived from your PIN via PBKDF2 (100k iterations). Your PIN
        is never sent to the server.
      </Text>
    </Screen>
  )
}

function Row({
  label,
  hint,
  children,
}: {
  label: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <View className="flex-row items-center justify-between gap-3">
      <View className="flex-1">
        <Text className="text-base text-text">{label}</Text>
        {hint ? <Text className="text-xs text-muted">{hint}</Text> : null}
      </View>
      {children}
    </View>
  )
}

function Toggle({
  value,
  onChange,
  disabled,
}: {
  value: boolean
  onChange: (v: boolean) => void
  disabled?: boolean
}) {
  return (
    <Pressable
      disabled={disabled}
      onPress={() => onChange(!value)}
      className={`h-7 w-12 justify-center rounded-full p-1 ${value ? "bg-primary" : "bg-border"} ${disabled ? "opacity-40" : ""}`}
    >
      <View className={`size-5 rounded-full bg-white ${value ? "self-end" : "self-start"}`} />
    </Pressable>
  )
}
