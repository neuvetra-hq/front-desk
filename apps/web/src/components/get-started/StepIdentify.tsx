// apps/web/src/components/get-started/StepIdentify.tsx
import { useState, useEffect, useRef } from "react"
import { useRouteTransition } from "@/contexts/RouteTransitionContext"
import { useAppMachine } from "@/pages/app/hooks/useAppMachine"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"
import { DarkInput } from "./DarkInput"
import { WizardButton } from "./WizardButton"
import { jostLabel, alpha } from "./types"
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
  const light = useAppMachine((s) => s.context.currentTheme.light)
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
        <a href="/terms" style={{ color: alpha(light, 0.5) }} className="underline">Terms</a>
        {" "}and{" "}
        <a href="/privacy" style={{ color: alpha(light, 0.5) }} className="underline">Privacy Policy</a>.
      </p>

      <WizardButton type="submit" disabled={busy} className="mt-1">
        {busy ? "Sending…" : "Send verification code →"}
      </WizardButton>
    </form>
  )
}
