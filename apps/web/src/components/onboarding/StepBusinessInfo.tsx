import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const schema = z.object({
  businessName: z.string().min(2, "Enter your business name"),
  businessType: z.enum(["medical", "dental", "spa", "salon", "plumbing", "legal", "real_estate", "other"], {
    required_error: "Select a business type",
  }),
  businessPhone: z
    .string()
    .min(7, "Enter your business phone number")
    .refine((v) => v.replace(/\D/g, "").length >= 10, "Enter a valid 10-digit phone number"),
})

type FormValues = z.infer<typeof schema>

// What gets passed to the next step — includes derived areaCode
export type BusinessInfoData = FormValues & { areaCode: string }

const BUSINESS_TYPE_LABELS: Record<FormValues["businessType"], string> = {
  medical: "Medical / Healthcare",
  dental: "Dental",
  spa: "MedSpa / Wellness",
  salon: "Salon / Beauty",
  plumbing: "Plumbing / Trades",
  legal: "Legal",
  real_estate: "Real Estate",
  other: "Other",
}

function extractAreaCode(phone: string): string {
  const digits = phone.replace(/\D/g, "")
  // Handle +1XXXXXXXXXX or 1XXXXXXXXXX
  const local = digits.startsWith("1") && digits.length === 11 ? digits.slice(1) : digits
  return local.slice(0, 3)
}

interface Props {
  defaultValues?: Partial<FormValues>
  onNext: (data: BusinessInfoData) => void
}

export function StepBusinessInfo({ defaultValues, onNext }: Props) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues,
  })

  const onSubmit = (data: FormValues) => {
    onNext({ ...data, areaCode: extractAreaCode(data.businessPhone) })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="businessName" className="text-sm font-medium text-neutral-700">
          Business name
        </Label>
        <Input
          id="businessName"
          placeholder="Sunrise MedSpa"
          className="h-11 px-4 rounded-xl text-sm"
          {...register("businessName")}
        />
        {errors.businessName && (
          <p className="text-xs text-red-500">{errors.businessName.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-medium text-neutral-700">Business type</Label>
        <Controller
          control={control}
          name="businessType"
          render={({ field }) => (
            <Select value={field.value ?? ""} onValueChange={field.onChange}>
              <SelectTrigger size="lg" className="w-full rounded-xl px-4 text-sm">
                <SelectValue placeholder="Select a type…" />
              </SelectTrigger>
              <SelectContent>
                {(Object.entries(BUSINESS_TYPE_LABELS) as [FormValues["businessType"], string][]).map(
                  ([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  )
                )}
              </SelectContent>
            </Select>
          )}
        />
        {errors.businessType && (
          <p className="text-xs text-red-500">{errors.businessType.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="businessPhone" className="text-sm font-medium text-neutral-700">
          Business phone number
        </Label>
        <Input
          id="businessPhone"
          type="tel"
          placeholder="(415) 555-0100"
          className="h-11 px-4 rounded-xl text-sm"
          {...register("businessPhone")}
        />
        <p className="text-xs text-neutral-400 leading-relaxed">
          We'll provision a new AI number in the same area code as your existing number.
        </p>
        {errors.businessPhone && (
          <p className="text-xs text-red-500">{errors.businessPhone.message}</p>
        )}
      </div>

      <Button
        type="submit"
        className="w-full h-11 rounded-xl text-sm font-medium mt-2"
      >
        Continue →
      </Button>
    </form>
  )
}
