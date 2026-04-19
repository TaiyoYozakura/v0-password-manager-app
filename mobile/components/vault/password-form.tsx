import { useEffect, useState } from "react"
import { Pressable, Text, View } from "react-native"
import Toast from "react-native-toast-message"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/components/providers/auth-provider"
import {
  STRENGTH_COLORS,
  STRENGTH_LABELS,
  scorePassword,
} from "@/lib/crypto/passwordStrength"
import { generatePassword } from "@/lib/crypto/generate"
import { decryptField } from "@/lib/crypto/encryption"
import {
  createPassword,
  deletePassword,
  getPassword,
  updatePassword,
  type PasswordInput,
} from "@/lib/firebase/passwords"
import type { PasswordEntry, PasswordTag } from "@/lib/types"

const TAGS: PasswordTag[] = ["Personal", "Work", "Banking", "Social", "Other"]

export function PasswordForm({
  id,
  onSaved,
  onDeleted,
}: {
  id?: string
  onSaved?: () => void
  onDeleted?: () => void
}) {
  const { user, masterKey } = useAuth()
  const [loading, setLoading] = useState(!!id)
  const [saving, setSaving] = useState(false)
  const [show, setShow] = useState(false)
  const [form, setForm] = useState<PasswordInput>({
    title: "",
    email: "",
    username: "",
    siteUrl: "",
    password: "",
    notes: "",
    tag: "Personal",
  })

  useEffect(() => {
    if (!id || !user || !masterKey) return
    let active = true
    getPassword(user.uid, id)
      .then((entry) => {
        if (!active || !entry) return
        const decrypted: PasswordInput = {
          title: entry.title,
          email: entry.email ?? "",
          username: entry.username ?? "",
          siteUrl: entry.siteUrl ?? "",
          password: decryptField(entry.password, masterKey),
          notes: entry.notes ? decryptField(entry.notes, masterKey) : "",
          tag: entry.tag,
        }
        setForm(decrypted)
      })
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
  }, [id, user, masterKey])

  const submit = async () => {
    if (!user || !masterKey) return
    if (!form.title.trim()) {
      Toast.show({ type: "error", text1: "Title is required" })
      return
    }
    if (!form.password) {
      Toast.show({ type: "error", text1: "Password is required" })
      return
    }
    setSaving(true)
    try {
      if (id) {
        await updatePassword(user.uid, id, form, masterKey)
        Toast.show({ type: "success", text1: "Saved" })
      } else {
        await createPassword(user.uid, form, masterKey)
        Toast.show({ type: "success", text1: "Password added" })
      }
      onSaved?.()
    } catch (e) {
      Toast.show({ type: "error", text1: "Save failed", text2: String((e as Error).message) })
    } finally {
      setSaving(false)
    }
  }

  const remove = async () => {
    if (!user || !id) return
    setSaving(true)
    try {
      await deletePassword(user.uid, id)
      Toast.show({ type: "success", text1: "Deleted" })
      onDeleted?.()
    } catch (e) {
      Toast.show({ type: "error", text1: "Delete failed", text2: String((e as Error).message) })
    } finally {
      setSaving(false)
    }
  }

  const score = scorePassword(form.password)

  if (loading) {
    return (
      <View className="p-6">
        <Text className="text-muted">Loading...</Text>
      </View>
    )
  }

  return (
    <View className="gap-4">
      <Input
        label="Title"
        value={form.title}
        onChangeText={(v) => setForm({ ...form, title: v })}
        placeholder="GitHub"
      />
      <Input
        label="Email"
        value={form.email ?? ""}
        onChangeText={(v) => setForm({ ...form, email: v })}
        placeholder="me@example.com"
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <Input
        label="Username"
        value={form.username ?? ""}
        onChangeText={(v) => setForm({ ...form, username: v })}
        autoCapitalize="none"
      />
      <Input
        label="URL"
        value={form.siteUrl ?? ""}
        onChangeText={(v) => setForm({ ...form, siteUrl: v })}
        placeholder="https://example.com"
        autoCapitalize="none"
        keyboardType="url"
      />
      <Input
        label="Password"
        value={form.password}
        onChangeText={(v) => setForm({ ...form, password: v })}
        secureTextEntry={!show}
        autoCapitalize="none"
        rightSlot={
          <View className="flex-row gap-1 pl-2">
            <Pressable
              onPress={() => setShow((s) => !s)}
              className="rounded-md px-2 py-1 active:bg-surface"
            >
              <Text className="text-xs text-primary">{show ? "Hide" : "Show"}</Text>
            </Pressable>
            <Pressable
              onPress={() =>
                setForm((f) => ({
                  ...f,
                  password: generatePassword({
                    length: 20,
                    lowercase: true,
                    uppercase: true,
                    numbers: true,
                    symbols: true,
                    excludeSimilar: true,
                  }),
                }))
              }
              className="rounded-md px-2 py-1 active:bg-surface"
            >
              <Text className="text-xs text-primary">Gen</Text>
            </Pressable>
          </View>
        }
      />
      <View>
        <View className="mb-1 flex-row justify-between">
          <Text className="text-xs text-muted">Strength</Text>
          <Text className="text-xs" style={{ color: STRENGTH_COLORS[score] }}>
            {STRENGTH_LABELS[score]}
          </Text>
        </View>
        <View className="h-1.5 overflow-hidden rounded-full bg-border">
          <View
            style={{
              width: `${(score / 4) * 100}%`,
              backgroundColor: STRENGTH_COLORS[score],
            }}
            className="h-full"
          />
        </View>
      </View>

      <View>
        <Text className="mb-2 text-sm font-medium text-text">Tag</Text>
        <View className="flex-row flex-wrap gap-2">
          {TAGS.map((t) => {
            const active = form.tag === t
            return (
              <Pressable
                key={t}
                onPress={() => setForm({ ...form, tag: t })}
                className={`rounded-full border px-3 py-1.5 ${active ? "border-primary bg-primary/20" : "border-border bg-card"}`}
              >
                <Text className={`text-sm ${active ? "text-primary" : "text-muted"}`}>{t}</Text>
              </Pressable>
            )
          })}
        </View>
      </View>

      <Input
        label="Notes"
        value={form.notes ?? ""}
        onChangeText={(v) => setForm({ ...form, notes: v })}
        multiline
        numberOfLines={4}
        className="min-h-24 align-top"
      />

      <Button label={id ? "Save changes" : "Add password"} loading={saving} onPress={submit} fullWidth />
      {id ? (
        <Button label="Delete" variant="danger" loading={saving} onPress={remove} fullWidth />
      ) : null}
    </View>
  )
}

// Re-export so screens can use it without importing types separately
export type { PasswordEntry }
