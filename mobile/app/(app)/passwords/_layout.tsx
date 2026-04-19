import { Stack } from "expo-router"

export default function PasswordsLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: "#0b1220" },
        headerTintColor: "#e6edf7",
        headerShadowVisible: false,
        contentStyle: { backgroundColor: "#0b1220" },
      }}
    >
      <Stack.Screen name="index" options={{ title: "Passwords" }} />
      <Stack.Screen name="new" options={{ title: "Add password", presentation: "modal" }} />
      <Stack.Screen name="[id]" options={{ title: "Edit password" }} />
    </Stack>
  )
}
