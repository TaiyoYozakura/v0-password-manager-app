import { Redirect, Tabs } from "expo-router"
import { ActivityIndicator, Text, View } from "react-native"
import { useAuth } from "@/components/providers/auth-provider"

export default function AppLayout() {
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

  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: "#0b1220" },
        headerTintColor: "#e6edf7",
        headerShadowVisible: false,
        tabBarStyle: {
          backgroundColor: "#111a2e",
          borderTopColor: "#1f2a44",
          height: 64,
          paddingTop: 6,
          paddingBottom: 10,
        },
        tabBarActiveTintColor: "#14b8a6",
        tabBarInactiveTintColor: "#7c8aa8",
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => <TabIcon glyph="\u{1F3E0}" color={color} />,
        }}
      />
      <Tabs.Screen
        name="passwords"
        options={{
          title: "Passwords",
          tabBarIcon: ({ color }) => <TabIcon glyph="\u{1F511}" color={color} />,
        }}
      />
      <Tabs.Screen
        name="pins"
        options={{
          title: "PINs",
          tabBarIcon: ({ color }) => <TabIcon glyph="\u{1F4B3}" color={color} />,
        }}
      />
      <Tabs.Screen
        name="generator"
        options={{
          title: "Generate",
          tabBarIcon: ({ color }) => <TabIcon glyph="\u{2728}" color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color }) => <TabIcon glyph="\u{2699}" color={color} />,
        }}
      />
    </Tabs>
  )
}

function TabIcon({ glyph, color }: { glyph: string; color: string }) {
  return <Text style={{ color, fontSize: 20 }}>{glyph}</Text>
}
