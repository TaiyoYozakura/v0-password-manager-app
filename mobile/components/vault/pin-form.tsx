import { useEffect, useState } from "react"
import { Pressable, Text, View } from "react-native"
import Toast from "react-native-toast-message"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/components/providers/auth-provider"
import { decryptField } from "@/lib/crypto/encryption"
import { generatePin } from "@/lib/crypto/generate"
import {
  createPin,
  deletePin,
  getPin,
  updatePin,
  type PinInput,
} from "@/lib/firebase/pins"
import type { PinCategory } from "@/lib/types"

const CATEGORIES: PinCategory[] = ["Bank", "Card", "SIM", "Device", "Other"]

export function PinForm({
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
  const [form, setForm] = useState<PinInput>({
    label: "",
    category: "Bank",
    value: "",
    notes: "",
  })

  useEffect(() => {
    if (!id || !user || !masterKey) return
    let active = true
    getPin(user.uid, id)
      .then((entry) => {
        if (!active || !entry) return
        setForm({
          label: entry.label,
          category: entry.category,
          value: decryptField(entry.value, masterKey),
          notes: entry.notes ? decryptField(entry.notes, masterKey) : "",
        })
      })
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
  }, [id, user, masterKey])

  const submit = async () => {
    if (!user || !masterKey) return
    if (!form.label.trim()) {
      Toast.show({ type: "error", text1: "Label is required" })
      return
    }
    if (!form.value.trim()) {
      Toast.show({ type: "error", text1: "PIN value is required" })
      return
    }
    setSaving(true)
    try {
      if (id) {
        await updatePin(user.uid, id, form, masterKey)
        Toast.show({ type: "success", text1: "Saved" })
      } else {
        await createPin(user.uid, form, masterKey)
        Toast.show({ type: "success", text1: "PIN added" })
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
      await deletePin(user.uid, id)
      Toast.show({ type: "success", text1: "Deleted" })
      onDeleted?.()
    } catch (e) {
      Toast.show({ type: "error", text1: "Delete failed", text2: String((e as Error).message) })
    } finally {
      setSaving(false)
    }
  }

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
        label="Label"
        value={form.label}
        onChangeText={(v) => setForm({ ...form, label: v })}
        placeholder="ATM card"
      />
      <View>
        <Text className="mb-2 text-sm font-medium text-text">Category</Text>
        <View className="flex-row flex-wrap gap-2">
          {CATEGORIES.map((c) => {
            const active = form.category === c
            return (
              <Pressable
                key={c}
                onPress={() => setForm({ ...form, category: c })}
                className={`rounded-full border px-3 py-1.5 ${active ? "border-primary bg-primary/20" : "border-border bg-card"}`}
              >
                <Text className={`text-sm ${active ? "text-primary" : "text-muted"}`}>{c}</Text>
              </Pressable>
            )
          })}
        </View>
      </View>
      <Input
        label="PIN"
        value={form.value}
        onChangeText={(v) => setForm({ ...form, value: v.replace(/[^0-9]/g, "") })}
        secureTextEntry={!show}
        keyboardType="number-pad"
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
                  value: generatePin({ length: 6, noRepeating: false }),
                }))
              }
              className="rounded-md px-2 py-1 active:bg-surface"
            >
              <Text className="text-xs text-primary">Gen</Text>
            </Pressable>
          </View>
        }
      />
      <Input
        label="Notes"
        value={form.notes ?? ""}
        onChangeText={(v) => setForm({ ...form, notes: v })}
        multiline
        numberOfLines={3}
        className="min-h-20 align-top"
      />

      <Button label={id ? "Save changes" : "Add PIN"} loading={saving} onPress={submit} fullWidth />
      {id ? (
        <Button label="Delete" variant="danger" loading={saving} onPress={remove} fullWidth />
      ) : null}
    </View>
  )
}
