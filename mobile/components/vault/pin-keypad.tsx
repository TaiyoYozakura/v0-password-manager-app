import { Pressable, Text, View } from "react-native"

type Props = {
  value: string
  maxLength?: number
  onChange: (next: string) => void
  onSubmit?: () => void
  showSubmit?: boolean
}

const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "back"] as const

export function PinKeypad({ value, maxLength = 8, onChange, onSubmit, showSubmit }: Props) {
  const press = (k: string) => {
    if (k === "back") {
      onChange(value.slice(0, -1))
    } else if (k === "" || !k) {
      // spacer
    } else if (value.length < maxLength) {
      onChange(value + k)
    }
  }

  return (
    <View className="w-full">
      <View className="mb-6 h-14 flex-row items-center justify-center gap-3">
        {Array.from({ length: maxLength }).map((_, i) => {
          const filled = i < value.length
          const active = i === value.length
          return (
            <View
              key={i}
              className={`size-3 rounded-full ${filled ? "bg-primary" : active ? "bg-primary/40" : "bg-border"}`}
            />
          )
        })}
      </View>
      <View className="flex-row flex-wrap">
        {KEYS.map((k, i) => (
          <View key={i} className="w-1/3 p-2">
            <Pressable
              onPress={() => press(k)}
              disabled={!k}
              className={`h-16 items-center justify-center rounded-2xl ${k ? "bg-card active:bg-surface" : "bg-transparent"}`}
            >
              {k === "back" ? (
                <Text className="text-base text-text">Del</Text>
              ) : k ? (
                <Text className="text-2xl font-semibold text-text">{k}</Text>
              ) : null}
            </Pressable>
          </View>
        ))}
      </View>
      {showSubmit ? (
        <Pressable
          onPress={onSubmit}
          disabled={value.length < 4}
          className={`mt-2 h-14 items-center justify-center rounded-2xl ${value.length >= 4 ? "bg-primary" : "bg-primary/40"}`}
        >
          <Text className="text-base font-semibold text-white">Continue</Text>
        </Pressable>
      ) : null}
    </View>
  )
}
