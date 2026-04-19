import { useFocusEffect, useRouter } from "expo-router"
import { useCallback, useState } from "react"
import { Pressable, Text, View } from "react-native"
import { Card } from "@/components/ui/card"
import { Screen } from "@/components/ui/screen"
import { useAuth } from "@/components/providers/auth-provider"
import { listPasswords } from "@/lib/firebase/passwords"
import { listPins } from "@/lib/firebase/pins"
import type { PasswordEntry, PinEntry } from "@/lib/types"
import { relativeTime } from "@/lib/utils/time"

export default function DashboardScreen() {
  const { user, profile } = useAuth()
  const router = useRouter()
  const [passwords, setPasswords] = useState<PasswordEntry[]>([])
  const [pins, setPins] = useState<PinEntry[]>([])
  const [loading, setLoading] = useState(true)

  useFocusEffect(
    useCallback(() => {
      let active = true
      if (!user) return
      setLoading(true)
      Promise.all([listPasswords(user.uid), listPins(user.uid)])
        .then(([p, n]) => {
          if (!active) return
          setPasswords(p)
          setPins(n)
        })
        .finally(() => active && setLoading(false))
      return () => {
        active = false
      }
    }, [user]),
  )

  const weak = passwords.filter((p) => p.passwordStrength <= 1).length
  const strong = passwords.filter((p) => p.passwordStrength >= 3).length

  return (
    <Screen scroll>
      <View className="mb-4 gap-1">
        <Text className="text-sm text-muted">Welcome back</Text>
        <Text className="text-2xl font-bold text-text">
          {profile?.displayName?.split(" ")[0] ?? "User"}
        </Text>
      </View>

      <View className="mb-4 flex-row gap-3">
        <Stat label="Passwords" value={loading ? "—" : String(passwords.length)} />
        <Stat label="PINs" value={loading ? "—" : String(pins.length)} />
      </View>
      <View className="mb-4 flex-row gap-3">
        <Stat label="Weak" value={loading ? "—" : String(weak)} tone="danger" />
        <Stat label="Strong" value={loading ? "—" : String(strong)} tone="success" />
      </View>

      <Text className="mb-2 mt-2 text-base font-semibold text-text">Quick actions</Text>
      <View className="mb-4 flex-row gap-3">
        <ActionTile
          glyph={"\u002B"}
          label="Add password"
          onPress={() => router.push("/passwords/new")}
        />
        <ActionTile
          glyph={"\u002B"}
          label="Add PIN"
          onPress={() => router.push("/pins/new")}
        />
      </View>

      <Text className="mb-2 mt-2 text-base font-semibold text-text">Recent passwords</Text>
      {loading ? (
        <Card><Text className="text-muted">Loading...</Text></Card>
      ) : passwords.length === 0 ? (
        <Card><Text className="text-muted">No passwords yet. Add your first one.</Text></Card>
      ) : (
        passwords.slice(0, 5).map((p) => (
          <Pressable key={p.id} onPress={() => router.push(`/passwords/${p.id}`)} className="mb-2">
            <Card>
              <View className="flex-row items-center justify-between">
                <View className="flex-1 pr-3">
                  <Text className="text-base font-semibold text-text" numberOfLines={1}>
                    {p.title}
                  </Text>
                  {p.email || p.username ? (
                    <Text className="text-sm text-muted" numberOfLines={1}>
                      {p.email || p.username}
                    </Text>
                  ) : null}
                </View>
                <Text className="text-xs text-muted">{relativeTime(p.updatedAt)}</Text>
              </View>
            </Card>
          </Pressable>
        ))
      )}
    </Screen>
  )
}

function Stat({
  label,
  value,
  tone = "default",
}: {
  label: string
  value: string
  tone?: "default" | "danger" | "success"
}) {
  const color =
    tone === "danger" ? "text-danger" : tone === "success" ? "text-success" : "text-text"
  return (
    <Card className="flex-1">
      <Text className="text-xs uppercase tracking-wide text-muted">{label}</Text>
      <Text className={`mt-1 text-2xl font-bold ${color}`}>{value}</Text>
    </Card>
  )
}

function ActionTile({
  glyph,
  label,
  onPress,
}: {
  glyph: string
  label: string
  onPress: () => void
}) {
  return (
    <Pressable onPress={onPress} className="flex-1">
      <Card className="items-center gap-2">
        <View className="size-10 items-center justify-center rounded-full bg-primary/20">
          <Text className="text-lg text-primary">{glyph}</Text>
        </View>
        <Text className="text-sm font-medium text-text">{label}</Text>
      </Card>
    </Pressable>
  )
}
