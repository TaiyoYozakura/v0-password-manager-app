import { useRouter } from "expo-router"
import { Screen } from "@/components/ui/screen"
import { PinForm } from "@/components/vault/pin-form"

export default function NewPinScreen() {
  const router = useRouter()
  return (
    <Screen scroll>
      <PinForm onSaved={() => router.back()} />
    </Screen>
  )
}
