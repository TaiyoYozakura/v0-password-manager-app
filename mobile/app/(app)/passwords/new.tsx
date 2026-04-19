import { useRouter } from "expo-router"
import { Screen } from "@/components/ui/screen"
import { PasswordForm } from "@/components/vault/password-form"

export default function NewPasswordScreen() {
  const router = useRouter()
  return (
    <Screen scroll>
      <PasswordForm onSaved={() => router.back()} />
    </Screen>
  )
}
