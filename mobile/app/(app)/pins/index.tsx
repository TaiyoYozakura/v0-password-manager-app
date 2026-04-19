import { useFocusEffect, useRouter } from "expo-router"
import { useCallback, useMemo, useState } from "react"
import { FlatList, Pressable, Text, TextInput, View } from "react-native"
import Toast from "react-native-toast-message"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Screen } from "@/components/ui/screen"
import { useAuth } from "@/components/providers/auth-provider"
import { useSecureClipboard } from "@/hooks/use-secure-clipboard"
import { decryptField } from "@/lib/crypto/encryption"
import { listPins } from "@/lib/firebase/pins"
import type { PinCategory, PinEntry } from "@/lib/types"
import { relativeTime } from "@/lib/utils/time"

const CATS: (PinCategory | "All")[] = ["All", "Bank", "Card", "SIM", "Device", "Other"]

export default function PinsListScreen() {
  const { user, masterKey } = useAuth()
  const router = useRouter()
  const { copy } = useSecureClipboard()
  const [items, setItems] = useState<PinEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [q, setQ] = useState("")
  const [cat, setCat] = useState<PinCategory | "All">("All")

  useFocusEffect(
    useCallback(() => {
      if (!user) return
      let active = true
      setLoading(true)
      listPins(user.uid)
        .then((p) => active && setItems(p))
        .finally(() => active && setLoading(false))
      return () => {
        active = false
      }
    }, [user]),
  )

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase()
    return items.filter((i) => {
      if (cat !== "All" && i.category !== cat) return false
      if (!needle) return true
      return i.label.toLowerCase().includes(needle)
    })
  }, [items, q, cat])

  const onCopy = async (entry: PinEntry) => {
    if (!masterKey) return
    try {
      const plain = decryptField(entry.value, masterKey)
      await copy(plain, "PIN copied")
    } catch {
      Toast.show({ type: "error", text1: "Decrypt failed" })
    }
  }

  return (
    <Screen>
      <View className="mb-3 rounded-xl border border-border bg-card px-3">
        <TextInput
          value={q}
          onChangeText={setQ}
          placeholder="Search label"
          placeholderTextColor="#7c8aa8"
          className="min-h-11 py-3 text-base text-text"
          autoCapitalize="none"
        />
      </View>

      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={CATS}
        keyExtractor={(c) => c}
        contentContainerStyle={{ gap: 8, paddingBottom: 8 }}
        renderItem={({ item: c }) => {
          const active = cat === c
          return (
            <Pressable
              onPress={() => setCat(c)}
              className={`rounded-full border px-3 py-1.5 ${active ? "border-primary bg-primary/20" : "border-border bg-card"}`}
            >
              <Text className={`text-sm ${active ? "text-primary" : "text-muted"}`}>{c}</Text>
            </Pressable>
          )
        }}
      />

      <FlatList
        data={filtered}
        keyExtractor={(i) => i.id}
        contentContainerStyle={{ paddingTop: 8, paddingBottom: 96, gap: 8 }}
        ListEmptyComponent={
          <Card>
            <Text className="text-muted">
              {loading ? "Loading..." : "No PINs match your filters."}
            </Text>
          </Card>
        }
        renderItem={({ item }) => (
          <Pressable onPress={() => router.push(`/pins/${item.id}`)}>
            <Card>
              <View className="flex-row items-start justify-between gap-3">
                <View className="flex-1">
                  <Text className="text-base font-semibold text-text" numberOfLines={1}>
                    {item.label}
                  </Text>
                  <Text className="text-xs text-muted">{relativeTime(item.updatedAt)}</Text>
                </View>
                <Text className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
                  {item.category}
                </Text>
              </View>
              <View className="mt-3 flex-row gap-2">
                <Pressable
                  onPress={() => onCopy(item)}
                  className="flex-1 items-center rounded-lg bg-surface py-2 active:bg-border"
                >
                  <Text className="text-sm text-primary">Copy PIN</Text>
                </Pressable>
              </View>
            </Card>
          </Pressable>
        )}
      />

      <View className="absolute bottom-4 left-4 right-4">
        <Button label="Add PIN" onPress={() => router.push("/pins/new")} fullWidth />
      </View>
    </Screen>
  )
}
