import { ScrollView, View, type ViewProps } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

type Props = ViewProps & {
  scroll?: boolean
  className?: string
}

export function Screen({ scroll, className, children, ...rest }: Props) {
  const Inner = scroll ? ScrollView : View
  return (
    <SafeAreaView className="flex-1 bg-bg" edges={["top", "left", "right"]}>
      <Inner
        contentContainerStyle={scroll ? { padding: 16, paddingBottom: 48 } : undefined}
        className={`${scroll ? "" : "flex-1 p-4"} ${className ?? ""}`}
        {...(rest as Record<string, unknown>)}
      >
        {children}
      </Inner>
    </SafeAreaView>
  )
}
