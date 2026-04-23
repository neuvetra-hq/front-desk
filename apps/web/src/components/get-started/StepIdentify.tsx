// apps/web/src/components/get-started/StepIdentify.tsx
import { useState, useEffect, useRef } from "react"
import { useRouteTransition } from "@/contexts/RouteTransitionContext"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"
import { DarkInput } from "./DarkInput"
import { jostLabel } from "./types"
import type { IdentityData } from "./types"

const schema = z.object({
  firstName: z.string().min(1, "Enter your first name"),
  lastName: z.string().min(1, "Enter your last name"),
  phone: z
    .string()
    .min(7, "Enter your mobile number")
    .refine((v) => v.replace(/\D/g, "").length >= 10, "Enter a valid 10-digit number"),
})

function toE164(raw: string): string {
  const digits = raw.replace(/\D/g, "")
  if (digits.length === 10) return `+1${digits}`
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`
  return `+${digits}`
}

interface Props {
  onNext: (data: IdentityData) => void
}

export function StepIdentify({ onNext }: Props) {
  const [busy, setBusy] = useState(false)
  const firstNameRef = useRef<HTMLInputElement>(null)
  const { transitionComplete } = useRouteTransition()
  const { register, handleSubmit, formState: { errors } } = useForm<IdentityData>({
    resolver: zodResolver(schema),
  })

  useEffect(() => {
    if (transitionComplete) firstNameRef.current?.focus()
  }, [transitionComplete])

  const onSubmit = async (data: IdentityData) => {
    setBusy(true)
    try {
      const { error } = await supabase.auth.signInWithOtp({ phone: toE164(data.phone) })
      if (error) throw error
      toast.success("Code sent — check your messages.")
      onNext(data)
    } catch (err) {
      toast.error((err as Error).message ?? "Failed to send code")
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="block text-[10px] uppercase text-white/30" style={jostLabel}>
            First name
          </label>
          <DarkInput
            placeholder="Jane"
            autoComplete="given-name"
            hasError={!!errors.firstName}
            {...register("firstName")}
            ref={(el) => {
              firstNameRef.current = el
              register("firstName").ref(el)
            }}
          />
          {errors.firstName && (
            <p className="text-[10px] text-red-400/70">{errors.firstName.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <label className="block text-[10px] uppercase text-white/30" style={jostLabel}>
            Last name
          </label>
          <DarkInput
            placeholder="Smith"
            autoComplete="family-name"
            hasError={!!errors.lastName}
            {...register("lastName")}
          />
          {errors.lastName && (
            <p className="text-[10px] text-red-400/70">{errors.lastName.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="block text-[10px] uppercase text-white/30" style={jostLabel}>
          Mobile number
        </label>
        <DarkInput
          type="tel"
          placeholder="+1 (415) 555-0100"
          autoComplete="tel"
          hasError={!!errors.phone}
          {...register("phone")}
        />
        {errors.phone && (
          <p className="text-[10px] text-red-400/70">{errors.phone.message}</p>
        )}
      </div>

      <p
        className="text-[10px] text-white/18 leading-relaxed pt-1"
        style={{ fontFamily: "'Jost', sans-serif" }}
      >
        By continuing you agree to receive SMS messages from Front Desk by Neuvetra, including
        verification codes and transactional notifications. Reply STOP to opt out. See our{" "}
        <a href="/terms" className="text-violet-400/50 hover:text-violet-300 transition-colors underline">Terms</a>
        {" "}and{" "}
        <a href="/privacy" className="text-violet-400/50 hover:text-violet-300 transition-colors underline">Privacy Policy</a>.
      </p>

      <button
        type="submit"
        disabled={busy}
        className="w-full py-3 mt-1 text-[11px] font-light tracking-[.18em] uppercase text-violet-200 bg-violet-500/15 border border-violet-500/35 hover:bg-violet-500/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        style={{ fontFamily: "'Jost', sans-serif" }}
      >
        {busy ? "Sending…" : "Send verification code →"}
      </button>
    </form>
  )
}
