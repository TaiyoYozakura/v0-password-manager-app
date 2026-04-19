import { forwardRef } from "react"
import { Text, TextInput, type TextInputProps, View } from "react-native"

type Props = TextInputProps & {
  label?: string
  error?: string
  hint?: string
  rightSlot?: React.ReactNode
}

export const Input = forwardRef<TextInput, Props>(function Input(
  { label, error, hint, rightSlot, className, ...rest },
  ref,
) {
  return (
    <View className="w-full">
      {label ? (
        <Text className="mb-2 text-sm font-medium text-text">{label}</Text>
      ) : null}
      <View
        className={`flex-row items-center rounded-xl border bg-card px-3 ${error ? "border-danger" : "border-border"}`}
      >
        <TextInput
          ref={ref}
          placeholderTextColor="#7c8aa8"
          className={`min-h-11 flex-1 py-3 text-base text-text ${className ?? ""}`}
          {...rest}
        />
        {rightSlot}
      </View>
      {error ? (
        <Text className="mt-1 text-xs text-danger">{error}</Text>
      ) : hint ? (
        <Text className="mt-1 text-xs text-muted">{hint}</Text>
      ) : null}
    </View>
  )
})
