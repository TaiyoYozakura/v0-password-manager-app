import Slider from "@react-native-community/slider"
import { useMemo, useState } from "react"
import { Pressable, Text, View } from "react-native"
import Toast from "react-native-toast-message"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Screen } from "@/components/ui/screen"
import { useSecureClipboard } from "@/hooks/use-secure-clipboard"
import {
  generatePassword,
  generatePin,
  type PasswordOptions,
  type PinOptions,
} from "@/lib/crypto/generate"
import {
  STRENGTH_COLORS,
  STRENGTH_LABELS,
  scorePassword,
} from "@/lib/crypto/passwordStrength"

type Tab = "password" | "pin"

export default function GeneratorScreen() {
  const { copy } = useSecureClipboard()
  const [tab, setTab] = useState<Tab>("password")
  const [pwOpts, setPwOpts] = useState<PasswordOptions>({
    length: 20,
    lowercase: true,
    uppercase: true,
    numbers: true,
    symbols: true,
    excludeSimilar: true,
  })
  const [pinOpts, setPinOpts] = useState<PinOptions>({ length: 6, noRepeating: false })
  const [pwOut, setPwOut] = useState(() => generatePassword(pwOpts))
  const [pinOut, setPinOut] = useState(() => generatePin(pinOpts))

  const pwScore = useMemo(() => scorePassword(pwOut), [pwOut])

  const regenPw = () => setPwOut(generatePassword(pwOpts))
  const regenPin = () => setPinOut(generatePin(pinOpts))

  return (
    <Screen scroll>
      <View className="mb-4 flex-row gap-2">
        <Pressable
          onPress={() => setTab("password")}
          className={`flex-1 items-center rounded-xl py-3 ${tab === "password" ? "bg-primary" : "bg-card border border-border"}`}
        >
          <Text className={`font-semibold ${tab === "password" ? "text-white" : "text-muted"}`}>
            Password
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setTab("pin")}
          className={`flex-1 items-center rounded-xl py-3 ${tab === "pin" ? "bg-primary" : "bg-card border border-border"}`}
        >
          <Text className={`font-semibold ${tab === "pin" ? "text-white" : "text-muted"}`}>
            PIN
          </Text>
        </Pressable>
      </View>

      {tab === "password" ? (
        <>
          <Card className="mb-4 gap-3">
            <Text className="font-mono text-lg text-text" selectable>
              {pwOut || "—"}
            </Text>
            <View className="h-1.5 overflow-hidden rounded-full bg-border">
              <View
                style={{
                  width: `${(pwScore / 4) * 100}%`,
                  backgroundColor: STRENGTH_COLORS[pwScore],
                }}
                className="h-full"
              />
            </View>
            <Text className="text-xs" style={{ color: STRENGTH_COLORS[pwScore] }}>
              {STRENGTH_LABELS[pwScore]}
            </Text>
            <View className="flex-row gap-2">
              <Button label="Regenerate" onPress={regenPw} variant="secondary" size="sm" />
              <Button
                label="Copy"
                onPress={() => copy(pwOut, "Password copied")}
                size="sm"
              />
            </View>
          </Card>

          <Card className="gap-4">
            <Row label={`Length: ${pwOpts.length}`}>
              <Slider
                style={{ flex: 1 }}
                minimumValue={8}
                maximumValue={64}
                step={1}
                value={pwOpts.length}
                onValueChange={(v) => setPwOpts({ ...pwOpts, length: Math.round(v) })}
                minimumTrackTintColor="#14b8a6"
                maximumTrackTintColor="#1f2a44"
                thumbTintColor="#14b8a6"
              />
            </Row>
            <Toggle
              label="Lowercase"
              value={pwOpts.lowercase}
              onChange={(v) => setPwOpts({ ...pwOpts, lowercase: v })}
            />
            <Toggle
              label="Uppercase"
              value={pwOpts.uppercase}
              onChange={(v) => setPwOpts({ ...pwOpts, uppercase: v })}
            />
            <Toggle
              label="Numbers"
              value={pwOpts.numbers}
              onChange={(v) => setPwOpts({ ...pwOpts, numbers: v })}
            />
            <Toggle
              label="Symbols"
              value={pwOpts.symbols}
              onChange={(v) => setPwOpts({ ...pwOpts, symbols: v })}
            />
            <Toggle
              label="Exclude similar (O/0, l/1, etc.)"
              value={pwOpts.excludeSimilar}
              onChange={(v) => setPwOpts({ ...pwOpts, excludeSimilar: v })}
            />
          </Card>
        </>
      ) : (
        <>
          <Card className="mb-4 gap-3">
            <Text className="font-mono text-3xl tracking-widest text-text" selectable>
              {pinOut || "—"}
            </Text>
            <View className="flex-row gap-2">
              <Button label="Regenerate" onPress={regenPin} variant="secondary" size="sm" />
              <Button
                label="Copy"
                onPress={() => {
                  if (!pinOut) {
                    Toast.show({ type: "error", text1: "Nothing to copy" })
                    return
                  }
                  copy(pinOut, "PIN copied")
                }}
                size="sm"
              />
            </View>
          </Card>

          <Card className="gap-4">
            <Row label={`Length: ${pinOpts.length}`}>
              <Slider
                style={{ flex: 1 }}
                minimumValue={4}
                maximumValue={12}
                step={1}
                value={pinOpts.length}
                onValueChange={(v) => setPinOpts({ ...pinOpts, length: Math.round(v) })}
                minimumTrackTintColor="#14b8a6"
                maximumTrackTintColor="#1f2a44"
                thumbTintColor="#14b8a6"
              />
            </Row>
            <Toggle
              label="No consecutive repeating digits"
              value={pinOpts.noRepeating}
              onChange={(v) => setPinOpts({ ...pinOpts, noRepeating: v })}
            />
          </Card>
        </>
      )}
    </Screen>
  )
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View>
      <Text className="mb-1 text-sm text-text">{label}</Text>
      <View className="flex-row items-center gap-2">{children}</View>
    </View>
  )
}

function Toggle({
  label,
  value,
  onChange,
}: {
  label: string
  value: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <Pressable
      onPress={() => onChange(!value)}
      className="flex-row items-center justify-between"
    >
      <Text className="flex-1 pr-3 text-base text-text">{label}</Text>
      <View
        className={`h-7 w-12 justify-center rounded-full p-1 ${value ? "bg-primary" : "bg-border"}`}
      >
        <View
          className={`size-5 rounded-full bg-white ${value ? "self-end" : "self-start"}`}
        />
      </View>
    </Pressable>
  )
}
