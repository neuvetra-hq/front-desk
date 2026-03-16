import { useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import type { BusinessInfoData } from "./StepBusinessInfo"

const BUSINESS_TYPE_LABELS: Record<BusinessInfoData["businessType"], string> = {
  medical: "Medical / Healthcare",
  dental: "Dental",
  spa: "MedSpa / Wellness",
  salon: "Salon / Beauty",
  plumbing: "Plumbing / Trades",
  legal: "Legal",
  real_estate: "Real Estate",
  other: "Other",
}

interface Props {
  businessId: string
  data: BusinessInfoData
  onBack: () => void
  onSuccess: () => void
}

export function StepConfirm({ businessId, data, onBack, onSuccess }: Props) {
  const [activating, setActivating] = useState(false)
  const apiUrl = import.meta.env.VITE_API_URL ?? "http://localhost:3000"

  const handleActivate = async () => {
    setActivating(true)
    try {
      // 1. Save business details
      const patchRes = await fetch(`${apiUrl}/businesses/${businessId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.businessName,
          businessType: data.businessType,
          areaCode: data.areaCode,
        }),
      })
      if (!patchRes.ok) throw new Error("Failed to save business details")

      // 2. Find an available number in the preferred area code
      const numbersRes = await fetch(
        `${apiUrl}/businesses/${businessId}/available-numbers?areaCode=${data.areaCode}`
      )
      if (!numbersRes.ok) throw new Error("Failed to search available numbers")
      const { numbers } = await numbersRes.json() as { numbers: { phoneNumber: string }[] }
      if (!numbers?.length) throw new Error(`No numbers available for area code ${data.areaCode}. Try a different area code.`)

      // 3. Provision the first available number
      const provisionRes = await fetch(`${apiUrl}/businesses/${businessId}/provision`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber: numbers[0].phoneNumber }),
      })
      if (!provisionRes.ok) throw new Error("Failed to provision phone number")

      toast.success("Your AI Front Desk is live!")
      onSuccess()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setActivating(false)
    }
  }

  const rows = [
    { label: "Business name", value: data.businessName },
    { label: "Business type", value: BUSINESS_TYPE_LABELS[data.businessType] },
    { label: "Existing number", value: data.businessPhone },
    { label: "AI number area code", value: `(${data.areaCode}) — assigned on activation` },
  ]

  return (
    <div className="space-y-6">
      {/* Summary card */}
      <div className="rounded-xl bg-neutral-50 border border-neutral-100 divide-y divide-neutral-100">
        {rows.map(({ label, value }) => (
          <div key={label} className="flex items-center justify-between px-4 py-3.5">
            <span className="text-sm text-neutral-500">{label}</span>
            <span className="text-sm font-medium text-neutral-900">{value}</span>
          </div>
        ))}
      </div>

      <p className="text-sm text-neutral-400 text-center leading-relaxed">
        We'll instantly provision a local number and activate your AI receptionist — no phone changes needed.
      </p>

      <Button
        className="w-full h-11 rounded-xl text-sm font-medium"
        onClick={handleActivate}
        disabled={activating}
      >
        {activating ? (
          <span className="flex items-center gap-2">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            Activating…
          </span>
        ) : (
          "Activate my Front Desk"
        )}
      </Button>

      <button
        type="button"
        onClick={onBack}
        disabled={activating}
        className="w-full text-sm text-neutral-400 hover:text-neutral-600 transition-colors disabled:pointer-events-none"
      >
        ← Back
      </button>
    </div>
  )
}
