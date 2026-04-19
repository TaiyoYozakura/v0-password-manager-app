"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import toast from "react-hot-toast"
import { ShieldCheck, Lock, KeyRound } from "lucide-react"
import { useAuth } from "@/components/providers/auth-provider"
import { signInWithGoogle } from "@/lib/firebase/auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function LoginPage() {
  const router = useRouter()
  const { user, loading, firebaseConfigured } = useAuth()
  const [signingIn, setSigningIn] = useState(false)

  useEffect(() => {
    if (!loading && user) {
      router.replace("/dashboard")
    }
  }, [user, loading, router])

  const onSignIn = async () => {
    if (!firebaseConfigured) {
      toast.error("Firebase is not configured. Add NEXT_PUBLIC_FIREBASE_* env vars.")
      return
    }
    setSigningIn(true)
    try {
      await signInWithGoogle()
      toast.success("Signed in")
      router.replace("/dashboard")
    } catch (err) {
      const message =
        err instanceof Error && err.message.includes("popup") ? "Sign-in popup was closed" : "Sign-in failed"
      toast.error(message)
    } finally {
      setSigningIn(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <Spinner className="size-6" />
      </div>
    )
  }

  return (
    <main className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-background px-4 py-10">
      {/* Decorative grid */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_75%)]"
      >
        <div className="absolute inset-0 bg-[linear-gradient(to_right,color-mix(in_oklab,var(--color-border)_70%,transparent)_1px,transparent_1px),linear-gradient(to_bottom,color-mix(in_oklab,var(--color-border)_70%,transparent)_1px,transparent_1px)] bg-[size:32px_32px]" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="mb-6 flex items-center justify-center gap-2">
          <div className="flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <ShieldCheck className="size-5" aria-hidden />
          </div>
          <span className="text-2xl font-semibold tracking-tight">Vaultly</span>
        </div>

        <Card className="border-border/80 shadow-xl">
          <CardContent className="flex flex-col gap-6 p-6 sm:p-8">
            <div className="flex flex-col gap-2 text-center">
              <h1 className="text-pretty text-2xl font-semibold tracking-tight">
                Your private vault for passwords and PINs
              </h1>
              <p className="text-pretty text-sm text-muted-foreground leading-relaxed">
                Everything you save is encrypted with AES-256 on your device before it ever
                touches the cloud. Only you can read it.
              </p>
            </div>

            {!firebaseConfigured && (
              <Alert variant="destructive">
                <AlertTitle>Firebase not configured</AlertTitle>
                <AlertDescription>
                  Add your <code>NEXT_PUBLIC_FIREBASE_*</code> environment variables, then reload.
                </AlertDescription>
              </Alert>
            )}

            <Button
              onClick={onSignIn}
              disabled={signingIn || !firebaseConfigured}
              className="h-11 w-full gap-3 text-sm font-medium"
              size="lg"
            >
              {signingIn ? (
                <Spinner className="size-4" />
              ) : (
                <Image
                  src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                  alt=""
                  width={18}
                  height={18}
                  aria-hidden
                  unoptimized
                />
              )}
              {signingIn ? "Signing in..." : "Sign in with Google"}
            </Button>

            <div className="grid gap-3 border-t border-border pt-5 text-sm">
              <Feature
                icon={<Lock className="size-4" aria-hidden />}
                title="Zero-knowledge encryption"
                body="Your encryption key is derived on your device and never leaves it."
              />
              <Feature
                icon={<KeyRound className="size-4" aria-hidden />}
                title="App Lock & auto-logout"
                body="4-digit PIN lock, idle auto-logout, and 30-second clipboard auto-clear."
              />
            </div>
          </CardContent>
        </Card>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Protected by Firebase Authentication. Data encrypted client-side before sync.
        </p>
      </div>
    </main>
  )
}

function Feature({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 flex size-7 items-center justify-center rounded-md bg-secondary text-secondary-foreground">
        {icon}
      </div>
      <div className="flex flex-col">
        <span className="font-medium">{title}</span>
        <span className="text-muted-foreground">{body}</span>
      </div>
    </div>
  )
}
