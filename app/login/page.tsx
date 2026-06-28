"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import toast from "react-hot-toast"
import { ShieldCheck, Lock, KeyRound, AlertCircle, Zap, Eye, Clock } from "lucide-react"
import { useAuth } from "@/components/providers/auth-provider"
import { signInWithGoogle } from "@/lib/firebase/auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { getFirebase } from "@/lib/firebase/config"

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
      console.log("[v0] Starting Google Sign-In...")
      await signInWithGoogle()
      console.log("[v0] Sign-In successful, redirecting...")
      toast.success("Signed in")
      router.replace("/dashboard")
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err)
      console.error("[v0] Sign-In error:", errorMsg)
      
      let message = "Sign-in failed"
      if (errorMsg.includes("popup-blocked")) {
        message = "Sign-in popup was blocked. Please allow popups and try again."
      } else if (errorMsg.includes("unauthorized-domain")) {
        message = "Domain not authorized. Add this domain to Firebase Authentication settings."
      } else if (errorMsg.includes("CONFIGURATION_NOT_FOUND")) {
        message = "Google Sign-In not configured. Enable it in Firebase Console > Authentication > Sign-in method."
      } else if (errorMsg.includes("popup")) {
        message = "Sign-in popup was closed"
      }
      
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
        {/* Logo Section */}
        <div className="mb-8 flex flex-col items-center gap-3">
          <div className="flex size-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-lg">
            <ShieldCheck className="size-6" aria-hidden />
          </div>
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight">Vaultly</h2>
            <p className="text-xs text-muted-foreground mt-1">Your secrets, your control</p>
          </div>
        </div>

        <Card className="border-border/80 shadow-xl overflow-hidden">
          <CardContent className="flex flex-col gap-6 p-6 sm:p-8">
            {/* Main Heading */}
            <div className="flex flex-col gap-3 text-center">
              <h1 className="text-pretty text-2xl font-bold tracking-tight">
                Keep your passwords safe
              </h1>
              <p className="text-pretty text-sm text-muted-foreground leading-relaxed">
                End-to-end encrypted vault that only you can access. Sign in to get started.
              </p>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-3 gap-3 py-2">
              <Feature
                icon={<Lock className="size-4" />}
                title="AES-256"
                desc="Military-grade encryption"
              />
              <Feature
                icon={<Eye className="size-4" />}
                title="Private"
                desc="Only you hold the key"
              />
              <Feature
                icon={<Zap className="size-4" />}
                title="Fast"
                desc="Instant access"
              />
            </div>

            {/* Sign In Button */}
            <Button
              onClick={onSignIn}
              disabled={signingIn || !firebaseConfigured}
              className="h-12 w-full gap-2 text-base font-medium mt-2"
              size="lg"
            >
              {signingIn ? (
                <>
                  <Spinner className="size-4" />
                  Signing in...
                </>
              ) : (
                <>
                  <Image
                    src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                    alt=""
                    width={18}
                    height={18}
                    aria-hidden
                    unoptimized
                  />
                  Continue with Google
                </>
              )}
            </Button>

            {/* Error Alert */}
            {!firebaseConfigured && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Configuration needed</AlertTitle>
                <AlertDescription className="text-xs mt-1">
                  Please set up Firebase environment variables. Contact support if you need help.
                </AlertDescription>
              </Alert>
            )}

            {/* Security Note */}
            <div className="rounded-lg border border-border/50 bg-secondary/30 p-3 space-y-2">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 flex-shrink-0 text-amber-600 dark:text-amber-500 mt-0.5" aria-hidden />
                <div className="flex-1">
                  <p className="text-xs font-semibold text-foreground">
                    Master Password is Your Only Key
                  </p>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    We can&apos;t recover it if lost. Keep it safe and consider storing an encrypted backup.
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex flex-col gap-2 text-center">
              <p className="text-xs text-muted-foreground">
                Your data stays encrypted on your device
              </p>
              <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
                <Clock className="size-3" aria-hidden />
                <span>Takes less than 1 minute to get started</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Trust Footer */}
        <p className="mt-6 text-center text-xs text-muted-foreground px-4">
          No passwords sent to us • No ads • No tracking • Open source
        </p>
      </div>
    </main>
  )
}

function Feature({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="flex flex-col items-center gap-2 p-3 rounded-lg border border-border/50 bg-background hover:bg-secondary/50 transition-colors">
      <div className="flex size-8 items-center justify-center rounded-md bg-primary/10 text-primary">
        {icon}
      </div>
      <div className="flex flex-col text-center">
        <span className="text-xs font-semibold">{title}</span>
        <span className="text-xs text-muted-foreground">{desc}</span>
      </div>
    </div>
  )
}
