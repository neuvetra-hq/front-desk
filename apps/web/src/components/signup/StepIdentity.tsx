import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const schema = z.object({
  firstName: z.string().min(1, "Enter your first name"),
  lastName: z.string().min(1, "Enter your last name"),
  phone: z
    .string()
    .min(7, "Enter your mobile number")
    .refine((v) => v.replace(/\D/g, "").length >= 10, "Enter a valid 10-digit number"),
})

export type IdentityData = z.infer<typeof schema>

interface Props {
  onNext: (data: IdentityData) => void
  busy: boolean
}

export function StepIdentity({ onNext, busy }: Props) {
  const { register, handleSubmit, formState: { errors } } = useForm<IdentityData>({
    resolver: zodResolver(schema),
  })

  return (
    <form onSubmit={handleSubmit(onNext)} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="firstName">First name</Label>
          <Input id="firstName" placeholder="Jane" autoComplete="given-name" {...register("firstName")} />
          {errors.firstName && <p className="text-xs text-red-500">{errors.firstName.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="lastName">Last name</Label>
          <Input id="lastName" placeholder="Smith" autoComplete="family-name" {...register("lastName")} />
          {errors.lastName && <p className="text-xs text-red-500">{errors.lastName.message}</p>}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="phone">Your mobile number</Label>
        <Input
          id="phone"
          type="tel"
          placeholder="+1 (415) 555-0100"
          autoComplete="tel"
          {...register("phone")}
        />
        <p className="text-xs text-neutral-400">We'll send a verification code to this number.</p>
        {errors.phone && <p className="text-xs text-red-500">{errors.phone.message}</p>}
      </div>

      <Button type="submit" className="w-full" disabled={busy}>
        {busy ? "Sending code…" : "Send verification code"}
      </Button>
    </form>
  )
}
