import { useLocalSearchParams, useRouter } from "expo-router"
import { Screen } from "@/components/ui/screen"
import { PinForm } from "@/components/vault/pin-form"

export default function EditPinScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  return (
    <Screen scroll>
      <PinForm id={id} onSaved={() => router.back()} onDeleted={() => router.back()} />
    </Screen>
  )
}
