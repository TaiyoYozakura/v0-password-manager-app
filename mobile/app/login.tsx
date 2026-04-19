import * as Google from "expo-auth-session/providers/google"
import { Stack, useRouter } from "expo-router"
import * as WebBrowser from "expo-web-browser"
import { useEffect, useState } from "react"
import { Text, View } from "react-native"
import Toast from "react-native-toast-message"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Screen } from "@/components/ui/screen"
import { useAuth } from "@/components/providers/auth-provider"
import { signInWithGoogleIdToken } from "@/lib/firebase/auth"

WebBrowser.maybeCompleteAuthSession()

export default function LoginScreen() {
  const router = useRouter()
  const { status } = useAuth()
  const [busy, setBusy] = useState(false)

  const [request, response, promptAsync] = Google.useAuthRequest({
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
  })

  useEffect(() => {
    if (status === "needs-pin-setup") router.replace("/setup-pin")
    if (status === "locked") router.replace("/lock")
    if (status === "unlocked") router.replace("/dashboard")
  }, [status, router])

  useEffect(() => {
    if (response?.type === "success") {
      const idToken = response.authentication?.idToken
      if (!idToken) {
        Toast.show({ type: "error", text1: "Missing Google ID token" })
        setBusy(false)
        return
      }
      signInWithGoogleIdToken(idToken)
        .catch((e) => {
          Toast.show({ type: "error", text1: "Sign-in failed", text2: String(e?.message ?? e) })
        })
        .finally(() => setBusy(false))
    } else if (response?.type === "error") {
      setBusy(false)
      Toast.show({ type: "error", text1: "Sign-in cancelled" })
    }
  }, [response])

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <Screen>
        <View className="flex-1 items-center justify-center gap-6">
          <View className="items-center gap-2">
            <View className="size-16 items-center justify-center rounded-3xl bg-primary/20">
              <Text className="text-3xl">{"\u{1F510}"}</Text>
            </View>
            <Text className="text-2xl font-bold text-text">Vault</Text>
            <Text className="text-center text-base text-muted">
              End-to-end encrypted password manager
            </Text>
          </View>

          <Card className="w-full gap-4">
            <Text className="text-center text-sm text-muted">
              Sign in with Google to start. Your data is encrypted on this device with a PIN
              before it ever leaves your phone.
            </Text>
            <Button
              label={busy ? "Signing in..." : "Continue with Google"}
              loading={busy}
              disabled={!request}
              onPress={() => {
                setBusy(true)
                promptAsync()
              }}
              fullWidth
            />
          </Card>

          <Text className="px-4 text-center text-xs text-muted">
            By continuing you agree that vault data is stored encrypted in Firebase. Only you can
            decrypt it with your PIN.
          </Text>
        </View>
      </Screen>
    </>
  )
}
