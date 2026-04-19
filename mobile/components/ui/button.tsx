import { ActivityIndicator, Pressable, Text, type PressableProps } from "react-native"

type Variant = "primary" | "secondary" | "ghost" | "danger" | "outline"
type Size = "sm" | "md" | "lg"

type Props = Omit<PressableProps, "children"> & {
  label: string
  variant?: Variant
  size?: Size
  loading?: boolean
  fullWidth?: boolean
}

const containerByVariant: Record<Variant, string> = {
  primary: "bg-primary active:bg-primaryDark",
  secondary: "bg-card active:bg-surface border border-border",
  ghost: "bg-transparent active:bg-card",
  danger: "bg-danger active:opacity-90",
  outline: "bg-transparent border border-primary active:bg-primary/10",
}

const textByVariant: Record<Variant, string> = {
  primary: "text-white",
  secondary: "text-text",
  ghost: "text-text",
  danger: "text-white",
  outline: "text-primary",
}

const sizeContainer: Record<Size, string> = {
  sm: "h-9 px-3 rounded-lg",
  md: "h-11 px-4 rounded-xl",
  lg: "h-14 px-5 rounded-2xl",
}

const sizeText: Record<Size, string> = {
  sm: "text-sm",
  md: "text-base",
  lg: "text-base",
}

export function Button({
  label,
  variant = "primary",
  size = "md",
  loading,
  disabled,
  fullWidth,
  ...rest
}: Props) {
  const isDisabled = disabled || loading
  return (
    <Pressable
      {...rest}
      disabled={isDisabled}
      accessibilityRole="button"
      className={`flex-row items-center justify-center gap-2 ${sizeContainer[size]} ${containerByVariant[variant]} ${fullWidth ? "w-full" : ""} ${isDisabled ? "opacity-50" : ""}`}
    >
      {loading ? <ActivityIndicator color="#ffffff" /> : null}
      <Text className={`font-semibold ${sizeText[size]} ${textByVariant[variant]}`}>{label}</Text>
    </Pressable>
  )
}
