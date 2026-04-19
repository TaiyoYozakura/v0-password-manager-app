import { Redirect } from "expo-router"
import { ActivityIndicator, View } from "react-native"
import { useAuth } from "@/components/providers/auth-provider"

export default function Index() {
  const { status } = useAuth()
  if (status === "loading") {
    return (
      <View className="flex-1 items-center justify-center bg-bg">
        <ActivityIndicator color="#14b8a6" />
      </View>
    )
  }
  if (status === "signed-out") return <Redirect href="/login" />
  if (status === "needs-pin-setup") return <Redirect href="/setup-pin" />
  if (status === "locked") return <Redirect href="/lock" />
  return <Redirect href="/dashboard" />
}
