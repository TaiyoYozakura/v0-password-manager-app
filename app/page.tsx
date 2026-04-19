"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/providers/auth-provider"
import { Spinner } from "@/components/ui/spinner"

export default function RootPage() {
  const router = useRouter()
  const { user, loading } = useAuth()

  useEffect(() => {
    if (loading) return
    if (user) {
      router.replace("/dashboard")
    } else {
      router.replace("/login")
    }
  }, [user, loading, router])

  return (
    <div className="flex min-h-dvh items-center justify-center bg-background">
      <Spinner className="size-6" />
    </div>
  )
}
