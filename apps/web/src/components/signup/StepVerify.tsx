import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"

interface Props {
  phone: string            // E.164 phone used to send the code
  onVerified: (userId: string) => void
  onBack: () => void
  busy: boolean
  setBusy: (v: boolean) => void
}

export function StepVerify({ phone, onVerified, onBack, busy, setBusy }: Props) {
  const [otp, setOtp] = useState("")
  const [cooldown, setCooldown] = useState(30)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setCooldown((s) => {
        if (s <= 1) { clearInterval(timerRef.current!); return 0 }
        return s - 1
      })
    }, 1000)
    return () => clearInterval(timerRef.current!)
  }, [])

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    if (otp.length < 6) return
    setBusy(true)
    try {
      const { data, error } = await supabase.auth.verifyOtp({ phone, token: otp, type: "sms" })
      if (error) throw error
      if (!data.user) throw new Error("No user returned")
      onVerified(data.user.id)
    } catch (err) {
      toast.error((err as Error).message ?? "Invalid or expired code")
    } finally {
      setBusy(false)
    }
  }

  const handleResend = async () => {
    if (cooldown > 0) return
    setBusy(true)
    try {
      const { error } = await supabase.auth.signInWithOtp({ phone })
      if (error) throw error
      setCooldown(30)
      timerRef.current = setInterval(() => {
        setCooldown((s) => {
          if (s <= 1) { clearInterval(timerRef.current!); return 0 }
          return s - 1
        })
      }, 1000)
      toast.success("New code sent.")
    } catch (err) {
      toast.error((err as Error).message ?? "Failed to resend")
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={handleVerify} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="otp">6-digit code</Label>
        <Input
          id="otp"
          type="text"
          inputMode="numeric"
          placeholder="123456"
          maxLength={6}
          autoComplete="one-time-code"
          value={otp}
          onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
        />
        <p className="text-xs text-neutral-400">Sent to {phone}</p>
      </div>

      <Button type="submit" className="w-full" disabled={busy || otp.length < 6}>
        {busy ? "Verifying…" : "Verify"}
      </Button>

      <div className="flex items-center justify-between text-sm">
        <Button type="button" variant="link" className="h-auto p-0 text-neutral-400 hover:text-neutral-600" onClick={onBack}>
          ← Change number
        </Button>
        <Button
          type="button"
          variant="link"
          onClick={handleResend}
          disabled={cooldown > 0 || busy}
          className="h-auto p-0 text-neutral-500 hover:text-neutral-900"
        >
          {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend code"}
        </Button>
      </div>
    </form>
  )
}
