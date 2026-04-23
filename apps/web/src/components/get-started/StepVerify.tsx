// apps/web/src/components/get-started/StepVerify.tsx
import { useState } from "react"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"
import { DarkInput } from "./DarkInput"
import { WizardButton } from "./WizardButton"
import { jostLabel } from "./types"

interface Props {
  phone: string // E.164
  onVerified: (userId: string, accessToken: string) => void
}

export function StepVerify({ phone, onVerified }: Props) {
  const [code, setCode] = useState("")
  const [busy, setBusy] = useState(false)
  const [resending, setResending] = useState(false)

  const handleVerify = async () => {
    if (code.length < 6) return
    setBusy(true)
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        phone,
        token: code,
        type: "sms",
      })
      if (error) throw error
      if (!data.user || !data.session) throw new Error("Verification failed — please try again")

      // If this phone already has a business, redirect to dashboard
      const { data: existing } = await supabase
        .from("business_members")
        .select("business_id")
        .eq("user_id", data.user.id)
        .limit(1)
        .maybeSingle()

      if (existing) {
        toast.info("You already have an account — signing you in.")
        window.location.href = "/dashboard"
        return
      }

      onVerified(data.user.id, data.session.access_token)
    } catch (err) {
      toast.error((err as Error).message ?? "Invalid code — try again")
    } finally {
      setBusy(false)
    }
  }

  const handleResend = async () => {
    setResending(true)
    try {
      const { error } = await supabase.auth.signInWithOtp({ phone })
      if (error) throw error
      toast.success("Code resent.")
    } catch (err) {
      toast.error((err as Error).message ?? "Failed to resend")
    } finally {
      setResending(false)
    }
  }

  return (
    <div className="space-y-4">
      <p
        className="text-sm text-white/40 text-center"
        style={{ fontFamily: "'Jost', sans-serif", letterSpacing: "0.04em" }}
      >
        Sent to{" "}
        <span className="text-white/70">{phone}</span>
      </p>

      <div className="space-y-1.5">
        <label className="block text-[10px] uppercase text-white/30" style={jostLabel}>
          6-digit code
        </label>
        <DarkInput
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={6}
          placeholder="000000"
          autoFocus
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
          className="text-center tracking-[0.5em] text-lg"
        />
      </div>

      <WizardButton type="button" onClick={handleVerify} disabled={code.length < 6 || busy}>
        {busy ? "Verifying…" : "Verify →"}
      </WizardButton>

      <button
        type="button"
        onClick={handleResend}
        disabled={resending}
        className="w-full py-2 text-[10px] tracking-[.1em] uppercase text-white/20 hover:text-white/40 transition-colors disabled:opacity-40"
        style={{ fontFamily: "'Jost', sans-serif" }}
      >
        {resending ? "Resending…" : "Resend code"}
      </button>
    </div>
  )
}
