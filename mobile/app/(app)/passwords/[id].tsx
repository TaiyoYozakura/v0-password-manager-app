import { useLocalSearchParams, useRouter } from "expo-router"
import { Screen } from "@/components/ui/screen"
import { PasswordForm } from "@/components/vault/password-form"

export default function EditPasswordScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  return (
    <Screen scroll>
      <PasswordForm
        id={id}
        onSaved={() => router.back()}
        onDeleted={() => router.back()}
      />
    </Screen>
  )
}
