// apps/web/src/components/get-started/StepBusiness.tsx
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { ChevronDown } from "lucide-react"
import { useState } from "react"
import { DarkInput } from "./DarkInput"
import { jostLabel } from "./types"
import type { BusinessData } from "./types"

const BUSINESS_TYPES = [
  ["medical",      "Medical / Healthcare"],
  ["dental",       "Dental"],
  ["spa",          "MedSpa / Wellness"],
  ["salon",        "Salon & Beauty"],
  ["plumbing",     "Plumbing & Trades"],
  ["legal",        "Legal"],
  ["real_estate",  "Real Estate"],
  ["other",        "Other"],
] as const

const schema = z.object({
  businessName: z.string().min(2, "Enter your business name"),
  businessType: z.enum(
    ["medical", "dental", "spa", "salon", "plumbing", "legal", "real_estate", "other"],
    { error: "Select a business type" }
  ),
})

interface Props {
  onNext: (data: BusinessData) => void
}

export function StepBusiness({ onNext }: Props) {
  const { register, handleSubmit, control, formState: { errors } } = useForm<BusinessData>({
    resolver: zodResolver(schema),
  })
  const [open, setOpen] = useState(false)
  const [selectedLabel, setSelectedLabel] = useState("")

  return (
    <form onSubmit={handleSubmit(onNext)} className="space-y-3">
      <div className="space-y-1.5">
        <label className="block text-[10px] uppercase text-white/30" style={jostLabel}>
          Business name
        </label>
        <DarkInput
          placeholder="Sunrise MedSpa"
          hasError={!!errors.businessName}
          {...register("businessName")}
        />
        {errors.businessName && (
          <p className="text-[10px] text-red-400/70">{errors.businessName.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <label className="block text-[10px] uppercase text-white/30" style={jostLabel}>
          Business type
        </label>
        <Controller
          control={control}
          name="businessType"
          render={({ field }) => (
            <div className="relative">
              <button
                type="button"
                onClick={() => setOpen((o) => !o)}
                className={[
                  "w-full bg-white/[0.03] border px-4 py-3 text-sm text-left flex items-center justify-between transition-colors",
                  errors.businessType
                    ? "border-red-400/40"
                    : "border-white/10 hover:border-white/20",
                ].join(" ")}
                style={{ fontFamily: "'Jost', sans-serif" }}
              >
                <span className={selectedLabel ? "text-white" : "text-white/25"}>
                  {selectedLabel || "Select a type…"}
                </span>
                <ChevronDown className="size-4 text-white/30 shrink-0" strokeWidth={1.5} />
              </button>

              {open && (
                <div className="absolute top-full left-0 right-0 z-20 border border-white/10 bg-[#0f0f10] mt-0.5 max-h-52 overflow-y-auto">
                  {BUSINESS_TYPES.map(([value, label]) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => {
                        field.onChange(value)
                        setSelectedLabel(label)
                        setOpen(false)
                      }}
                      className="w-full px-4 py-3 text-sm text-left text-white/60 hover:text-white hover:bg-white/[0.03] transition-colors"
                      style={{ fontFamily: "'Jost', sans-serif" }}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        />
        {errors.businessType && (
          <p className="text-[10px] text-red-400/70">{errors.businessType.message}</p>
        )}
      </div>

      <button
        type="submit"
        className="w-full py-3 mt-1 text-[11px] font-light tracking-[.18em] uppercase text-violet-200 bg-violet-500/15 border border-violet-500/35 hover:bg-violet-500/20 transition-colors"
        style={{ fontFamily: "'Jost', sans-serif" }}
      >
        Continue →
      </button>
    </form>
  )
}
