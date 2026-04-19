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
import { listPasswords } from "@/lib/firebase/passwords"
import type { PasswordEntry, PasswordTag } from "@/lib/types"
import { relativeTime } from "@/lib/utils/time"

const TAGS: (PasswordTag | "All")[] = ["All", "Personal", "Work", "Banking", "Social", "Other"]
const URL_MAX = 24

function truncateUrl(u: string) {
  return u.length > URL_MAX ? `${u.slice(0, URL_MAX)}...` : u
}

export default function PasswordsListScreen() {
  const { user, masterKey } = useAuth()
  const router = useRouter()
  const { copy } = useSecureClipboard()
  const [items, setItems] = useState<PasswordEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [q, setQ] = useState("")
  const [tag, setTag] = useState<PasswordTag | "All">("All")

  useFocusEffect(
    useCallback(() => {
      if (!user) return
      let active = true
      setLoading(true)
      listPasswords(user.uid)
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
      if (tag !== "All" && i.tag !== tag) return false
      if (!needle) return true
      const hay = `${i.title} ${i.email ?? ""} ${i.username ?? ""} ${i.siteUrl ?? ""}`.toLowerCase()
      return hay.includes(needle)
    })
  }, [items, q, tag])

  const onCopyPassword = async (entry: PasswordEntry) => {
    if (!masterKey) return
    try {
      const plain = decryptField(entry.password, masterKey)
      await copy(plain, "Password copied")
    } catch {
      Toast.show({ type: "error", text1: "Decrypt failed" })
    }
  }

  return (
    <Screen>
      <View className="mb-3">
        <View className="rounded-xl border border-border bg-card px-3">
          <TextInput
            value={q}
            onChangeText={setQ}
            placeholder="Search title, email, URL"
            placeholderTextColor="#7c8aa8"
            className="min-h-11 py-3 text-base text-text"
            autoCapitalize="none"
          />
        </View>
      </View>

      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={TAGS}
        keyExtractor={(t) => t}
        contentContainerStyle={{ gap: 8, paddingBottom: 8 }}
        renderItem={({ item: t }) => {
          const active = tag === t
          return (
            <Pressable
              onPress={() => setTag(t)}
              className={`rounded-full border px-3 py-1.5 ${active ? "border-primary bg-primary/20" : "border-border bg-card"}`}
            >
              <Text className={`text-sm ${active ? "text-primary" : "text-muted"}`}>{t}</Text>
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
              {loading ? "Loading..." : "No passwords match your filters."}
            </Text>
          </Card>
        }
        renderItem={({ item }) => (
          <Pressable onPress={() => router.push(`/passwords/${item.id}`)}>
            <Card>
              <View className="flex-row items-start justify-between gap-3">
                <View className="flex-1">
                  <Text className="text-base font-semibold text-text" numberOfLines={1}>
                    {item.title}
                  </Text>
                  {item.email || item.username ? (
                    <Text className="text-sm text-muted" numberOfLines={1}>
                      {item.email || item.username}
                    </Text>
                  ) : null}
                  {item.siteUrl ? (
                    <Text className="font-mono text-xs text-muted">
                      {truncateUrl(item.siteUrl)}
                    </Text>
                  ) : null}
                </View>
                <View className="items-end gap-1">
                  <Text className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
                    {item.tag}
                  </Text>
                  <Text className="text-xs text-muted">{relativeTime(item.updatedAt)}</Text>
                </View>
              </View>
              <View className="mt-3 flex-row gap-2">
                <Pressable
                  onPress={() => onCopyPassword(item)}
                  className="flex-1 items-center rounded-lg bg-surface py-2 active:bg-border"
                >
                  <Text className="text-sm text-primary">Copy password</Text>
                </Pressable>
                {item.email || item.username ? (
                  <Pressable
                    onPress={() =>
                      copy(
                        (item.email || item.username) as string,
                        item.email ? "Email copied" : "Username copied",
                      )
                    }
                    className="flex-1 items-center rounded-lg bg-surface py-2 active:bg-border"
                  >
                    <Text className="text-sm text-text">
                      Copy {item.email ? "email" : "user"}
                    </Text>
                  </Pressable>
                ) : null}
              </View>
            </Card>
          </Pressable>
        )}
      />

      <View className="absolute bottom-4 left-4 right-4">
        <Button label="Add password" onPress={() => router.push("/passwords/new")} fullWidth />
      </View>
    </Screen>
  )
}
