import { useState, useEffect, useRef } from "react"
import { Navigate, useNavigate } from "react-router"
import { useAuth } from "@/contexts/AuthContext"
import { supabase } from "@/lib/supabase"
import { AuthLayout } from "@/components/auth/AuthLayout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

// Normalize any phone format to E.164 (+1XXXXXXXXXX for US)
function toE164(raw: string): string {
  const digits = raw.replace(/\D/g, "")
  if (digits.length === 10) return `+1${digits}`
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`
  return `+${digits}` // international — pass through
}

type Step = "phone" | "otp" | "name"

export function LoginPage() {
  const { session, loading, refreshBusiness } = useAuth()
  const navigate = useNavigate()

  const [step, setStep] = useState<Step>("phone")
  const [phone, setPhone] = useState("")
  const [otp, setOtp] = useState("")
  const [fullName, setFullName] = useState("")
  const [busy, setBusy] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)
  const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    return () => { if (cooldownRef.current) clearInterval(cooldownRef.current) }
  }, [])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-neutral-300 border-t-neutral-900" />
      </div>
    )
  }

  if (session) return <Navigate to="/dashboard" replace />

  const startCooldown = () => {
    setResendCooldown(30)
    cooldownRef.current = setInterval(() => {
      setResendCooldown((s) => {
        if (s <= 1) { clearInterval(cooldownRef.current!); return 0 }
        return s - 1
      })
    }, 1000)
  }

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!phone.trim()) return
    setBusy(true)
    try {
      const { error } = await supabase.auth.signInWithOtp({ phone: toE164(phone) })
      if (error) throw error
      setStep("otp")
      startCooldown()
      toast.success("Code sent — check your messages.")
    } catch (err) {
      toast.error((err as Error).message ?? "Failed to send code")
    } finally {
      setBusy(false)
    }
  }

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (otp.length < 6) return
    setBusy(true)
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        phone: toE164(phone),
        token: otp,
        type: "sms",
      })
      if (error) throw error

      const userId = data.user?.id
      if (!userId) throw new Error("No user returned")

      // Check if this is a new user (no public.users row yet)
      const { data: existingUser } = await supabase
        .from("users")
        .select("id")
        .eq("id", userId)
        .maybeSingle()

      if (!existingUser) {
        // New user — collect their name before continuing
        setStep("name")
      } else {
        // Returning user — load business and go to dashboard
        await refreshBusiness()
        navigate("/dashboard", { replace: true })
      }
    } catch (err) {
      toast.error((err as Error).message ?? "Invalid or expired code")
    } finally {
      setBusy(false)
    }
  }

  const handleSaveName = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!fullName.trim()) return
    setBusy(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")

      // Insert user profile row
      await supabase.from("users").insert({
        id: user.id,
        email: user.email ?? null,
        full_name: fullName.trim(),
        phone: toE164(phone),
      })

      // Create placeholder business + member link
      const { data: business } = await supabase
        .from("businesses")
        .insert({
          name: `${fullName.trim()}'s Business`,
          slug: `${fullName.trim().toLowerCase().replace(/\s+/g, "-")}-${Date.now()}`,
          status: "inactive",
        })
        .select("id")
        .single()

      if (business) {
        await supabase.from("business_members").insert({
          business_id: business.id,
          user_id: user.id,
          role: "owner",
        })
      }

      await refreshBusiness()
      toast.success("Welcome! Let's set up your Front Desk.")
      navigate("/onboarding", { replace: true })
    } catch (err) {
      toast.error((err as Error).message ?? "Something went wrong")
    } finally {
      setBusy(false)
    }
  }

  const handleResend = async () => {
    if (resendCooldown > 0) return
    setBusy(true)
    try {
      const { error } = await supabase.auth.signInWithOtp({ phone: toE164(phone) })
      if (error) throw error
      startCooldown()
      toast.success("New code sent.")
    } catch (err) {
      toast.error((err as Error).message ?? "Failed to resend")
    } finally {
      setBusy(false)
    }
  }

  return (
    <AuthLayout
      title={step === "phone" ? "Sign in to Front Desk" : step === "otp" ? "Enter your code" : "One last thing"}
      description={
        step === "phone"
          ? "Enter your mobile number and we'll text you a code"
          : step === "otp"
          ? `We sent a 6-digit code to ${phone}`
          : "What's your name?"
      }
    >
      {step === "phone" && (
        <form onSubmit={handleSendCode} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="phone">Mobile number</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+1 (555) 000-0000"
              autoComplete="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={busy}>
            {busy ? "Sending…" : "Send code"}
          </Button>
        </form>
      )}

      {step === "otp" && (
        <form onSubmit={handleVerifyOtp} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="otp">Verification code</Label>
            <Input
              id="otp"
              type="text"
              inputMode="numeric"
              placeholder="123456"
              maxLength={6}
              autoComplete="one-time-code"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={busy || otp.length < 6}>
            {busy ? "Verifying…" : "Verify"}
          </Button>
          <div className="text-center">
            <button
              type="button"
              onClick={handleResend}
              disabled={resendCooldown > 0 || busy}
              className="text-sm text-neutral-500 hover:text-neutral-900 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : "Resend code"}
            </button>
          </div>
          <div className="text-center">
            <button
              type="button"
              onClick={() => { setStep("phone"); setOtp("") }}
              className="text-sm text-neutral-400 hover:text-neutral-600"
            >
              ← Change number
            </button>
          </div>
        </form>
      )}

      {step === "name" && (
        <form onSubmit={handleSaveName} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="fullName">Your full name</Label>
            <Input
              id="fullName"
              type="text"
              placeholder="Jane Smith"
              autoComplete="name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={busy || !fullName.trim()}>
            {busy ? "Setting up…" : "Continue"}
          </Button>
        </form>
      )}
    </AuthLayout>
  )
}
