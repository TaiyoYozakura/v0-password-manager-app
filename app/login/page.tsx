"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import toast from "react-hot-toast"
import { ShieldCheck, LockKeyhole, KeyRound, AlertCircle, Eye, Sparkles, Clock3, ArrowUpRight } from "lucide-react"
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
    if (!loading && user) router.replace("/dashboard")
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
      const errorMsg = err instanceof Error ? err.message : String(err)
      let message = "Sign-in failed"
      if (errorMsg.includes("popup-blocked")) message = "Sign-in popup was blocked. Please allow popups and try again."
      else if (errorMsg.includes("unauthorized-domain")) message = "Domain not authorized. Add this domain to Firebase Authentication settings."
      else if (errorMsg.includes("CONFIGURATION_NOT_FOUND")) message = "Google Sign-In not configured. Enable it in Firebase Console > Authentication > Sign-in method."
      else if (errorMsg.includes("popup")) message = "Sign-in popup was closed"
      toast.error(message)
    } finally {
      setSigningIn(false)
    }
  }

  if (loading) {
    return <div className="flex min-h-dvh items-center justify-center bg-background"><Spinner className="size-6" /></div>
  }

  return (
    <main className="relative min-h-dvh overflow-hidden bg-background">
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <div className="absolute -left-48 -top-48 size-[560px] rounded-full bg-primary/[0.09] blur-[110px]" />
        <div className="absolute -bottom-64 -right-36 size-[560px] rounded-full bg-[#f08cb8]/[0.07] blur-[120px]" />
        <div className="absolute inset-0 bg-[radial-gradient(color-mix(in_srgb,var(--foreground)_9%,transparent)_0.7px,transparent_0.7px)] bg-[size:22px_22px] opacity-30 [mask-image:linear-gradient(to_bottom,black,transparent_82%)]" />
      </div>

      <div className="relative mx-auto grid min-h-dvh w-full max-w-[1240px] items-center gap-12 px-5 py-10 sm:px-8 lg:grid-cols-[1fr_430px] lg:gap-20 lg:px-12">
        <section className="mx-auto w-full max-w-xl lg:mx-0">
          <div className="mb-14 flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/15"><ShieldCheck className="size-5" aria-hidden /></span>
            <span>
              <span className="block text-lg font-semibold tracking-[-0.05em]">vaultly</span>
              <span className="block text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">Private by design</span>
            </span>
          </div>

          <p className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary"><Sparkles className="size-3.5" aria-hidden /> A little more peace of mind</p>
          <h1 className="max-w-lg text-balance text-4xl font-semibold leading-[1.08] tracking-[-0.055em] sm:text-5xl lg:text-[58px]">Your digital life,<br /><span className="text-primary">kept yours.</span></h1>
          <p className="mt-6 max-w-md text-base leading-7 text-muted-foreground">A private home for passwords, identities, and the little details you never want to lose.</p>

          <div className="mt-10 grid max-w-lg gap-3 sm:grid-cols-3">
            <TrustPoint icon={<LockKeyhole className="size-4" aria-hidden />} title="Encrypted" detail="On your device" tone="violet" />
            <TrustPoint icon={<Eye className="size-4" aria-hidden />} title="Just yours" detail="Private by default" tone="rose" />
            <TrustPoint icon={<KeyRound className="size-4" aria-hidden />} title="In control" detail="Your key, always" tone="mint" />
          </div>

          <div className="mt-10 hidden items-center gap-2 text-xs text-muted-foreground sm:flex"><span className="size-1.5 rounded-full bg-[#a4d8cb]" aria-hidden /> Your data stays encrypted on your device</div>
        </section>

        <Card className="mx-auto w-full max-w-md overflow-hidden rounded-2xl border-border/80 bg-card/90 shadow-[0_28px_90px_-50px_rgba(0,0,0,0.8)] backdrop-blur-xl lg:mx-0">
          <CardContent className="p-6 sm:p-8">
            <div className="mb-8">
              <div className="mb-5 flex size-11 items-center justify-center rounded-xl bg-accent text-accent-foreground"><LockKeyhole className="size-5" aria-hidden /></div>
              <h2 className="text-2xl font-semibold tracking-[-0.04em]">Welcome to Vaultly</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">Sign in securely to open your personal vault.</p>
            </div>

            <Button onClick={onSignIn} disabled={signingIn || !firebaseConfigured} className="h-12 w-full gap-3 rounded-xl text-sm font-medium" size="lg">
              {signingIn ? <><Spinner className="size-4" /> Signing in...</> : <><Image src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="" width={18} height={18} aria-hidden unoptimized /> Continue with Google <ArrowUpRight className="ml-auto size-4 opacity-60" aria-hidden /></>}
            </Button>

            {!firebaseConfigured && (
              <Alert variant="destructive" className="mt-4">
                <AlertCircle className="size-4" aria-hidden />
                <AlertTitle>Configuration needed</AlertTitle>
                <AlertDescription className="mt-1 text-xs">Please set up Firebase environment variables. Contact support if you need help.</AlertDescription>
              </Alert>
            )}

            <div className="my-7 flex items-center gap-3 text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground/70"><span className="h-px flex-1 bg-border" /> Your vault stays private <span className="h-px flex-1 bg-border" /></div>

            <div className="rounded-xl border border-[#f08cb8]/20 bg-[#f08cb8]/[0.06] p-4">
              <div className="flex items-start gap-3">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[#f08cb8]/10 text-[#f08cb8]"><KeyRound className="size-4" aria-hidden /></span>
                <div>
                  <p className="text-xs font-semibold">Your master password is your only key</p>
                  <p className="mt-1.5 text-xs leading-5 text-muted-foreground">It can&apos;t be recovered if lost. Keep it safe and consider storing an encrypted backup.</p>
                </div>
              </div>
            </div>

            <p className="mt-6 flex items-center justify-center gap-1.5 text-xs text-muted-foreground"><Clock3 className="size-3.5" aria-hidden /> Takes less than a minute to get started</p>
          </CardContent>
        </Card>

        <p className="absolute inset-x-0 bottom-5 text-center text-[11px] text-muted-foreground/70">No passwords sent to us <span className="px-1.5 text-primary/70">·</span> No ads <span className="px-1.5 text-primary/70">·</span> No tracking <span className="px-1.5 text-primary/70">·</span> Open source</p>
      </div>
    </main>
  )
}

function TrustPoint({ icon, title, detail, tone }: { icon: React.ReactNode; title: string; detail: string; tone: "violet" | "rose" | "mint" }) {
  const tones = {
    violet: "bg-primary/10 text-primary",
    rose: "bg-[#f08cb8]/10 text-[#f08cb8]",
    mint: "bg-[#a4d8cb]/10 text-[#a4d8cb]",
  }
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border/65 bg-card/50 p-3 sm:flex-col sm:items-start sm:gap-4 sm:p-4">
      <span className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${tones[tone]}`}>{icon}</span>
      <span><span className="block text-xs font-semibold">{title}</span><span className="mt-0.5 block text-[11px] text-muted-foreground">{detail}</span></span>
    </div>
  )
}
