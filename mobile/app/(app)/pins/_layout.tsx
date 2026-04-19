import { Stack } from "expo-router"

export default function PinsLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: "#0b1220" },
        headerTintColor: "#e6edf7",
        headerShadowVisible: false,
        contentStyle: { backgroundColor: "#0b1220" },
      }}
    >
      <Stack.Screen name="index" options={{ title: "PINs" }} />
      <Stack.Screen name="new" options={{ title: "Add PIN", presentation: "modal" }} />
      <Stack.Screen name="[id]" options={{ title: "Edit PIN" }} />
    </Stack>
  )
}
