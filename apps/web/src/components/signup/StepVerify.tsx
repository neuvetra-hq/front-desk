import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"
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

  const handleVerifyToken = async (token: string) => {
    setBusy(true)
    try {
      const { data, error } = await supabase.auth.verifyOtp({ phone, token, type: "sms" })
      if (error) throw error
      if (!data.user) throw new Error("No user returned")
      onVerified(data.user.id)
    } catch (err) {
      toast.error((err as Error).message ?? "Invalid or expired code")
    } finally {
      setBusy(false)
    }
  }

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    if (otp.length < 6) return
    await handleVerifyToken(otp)
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
      <div className="space-y-3">
        <Label>6-digit code</Label>
        <InputOTP
          maxLength={6}
          value={otp}
          onChange={(val) => {
            setOtp(val)
            if (val.length === 6) handleVerifyToken(val)
          }}
          disabled={busy}
          autoFocus
        >
          <InputOTPGroup>
            <InputOTPSlot index={0} />
            <InputOTPSlot index={1} />
            <InputOTPSlot index={2} />
            <InputOTPSlot index={3} />
            <InputOTPSlot index={4} />
            <InputOTPSlot index={5} />
          </InputOTPGroup>
        </InputOTP>
        <p className="text-xs text-neutral-400">Sent to {phone}</p>
      </div>

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
