import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Link, useNavigate } from "react-router"
import { Eye, EyeOff } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/contexts/AuthContext"

const schema = z.object({
  fullName: z.string().min(2, "Enter your full name"),
  phone: z
    .string()
    .min(7, "Enter a valid phone number")
    .regex(/^[+\d\s\-().]+$/, "Enter a valid phone number"),
  email: z.string().email("Enter a valid email"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Must contain an uppercase letter")
    .regex(/[0-9]/, "Must contain a number"),
})

type FormData = z.infer<typeof schema>

export function SignupForm() {
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()
  const { refreshBusiness } = useAuth()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  const onSubmit = async (data: FormData) => {
    const { data: authData, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          full_name: data.fullName,
          phone: data.phone,
        },
      },
    })

    if (error) {
      toast.error(error.message)
      return
    }

    // Create a placeholder business for this user (onboarding fills in details later)
    if (authData.user) {
      await supabase.from("businesses").insert({
        name: `${data.fullName}'s Business`,
        slug: `${data.fullName.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}`,
        status: "inactive",
      }).select("id").single().then(async ({ data: business }) => {
        if (business) {
          await supabase.from("business_members").insert({
            business_id: business.id,
            user_id: authData.user!.id,
            role: "owner",
          })
        }
      })
    }

    await refreshBusiness()
    toast.success("Account created! Let's set up your business.")
    navigate("/onboarding")
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="fullName">Full name</Label>
        <Input
          id="fullName"
          placeholder="Jane Smith"
          autoComplete="name"
          {...register("fullName")}
        />
        {errors.fullName && <p className="text-xs text-red-500">{errors.fullName.message}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="phone">Your phone number</Label>
        <Input
          id="phone"
          type="tel"
          placeholder="+1 (555) 000-0000"
          autoComplete="tel"
          {...register("phone")}
        />
        <p className="text-xs text-neutral-400">
          This is your personal number — we'll set up your AI front desk number after.
        </p>
        {errors.phone && <p className="text-xs text-red-500">{errors.phone.message}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="you@company.com"
          autoComplete="email"
          {...register("email")}
        />
        {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="password">Password</Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            autoComplete="new-password"
            className="pr-10"
            {...register("password")}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Creating account…" : "Create account"}
      </Button>

      <p className="text-center text-sm text-neutral-500">
        Already have an account?{" "}
        <Link to="/login" className="font-medium text-neutral-900 hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  )
}
