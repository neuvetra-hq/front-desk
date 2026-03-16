import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

const API_URL = import.meta.env.VITE_API_URL as string

interface AvailableNumber {
  phoneNumber: string
  friendlyName: string
  locality: string
  region: string
}

interface Props {
  areaCode: string
  businessName: string
  businessType: string
  userId: string
  onSuccess: () => void
  onBack: () => void
}

export function StepPickNumber({ areaCode, businessName, businessType, userId, onSuccess, onBack }: Props) {
  const [numbers, setNumbers] = useState<AvailableNumber[]>([])
  const [loadingNumbers, setLoadingNumbers] = useState(true)
  const [selected, setSelected] = useState<string | null>(null)
  const [activating, setActivating] = useState(false)

  useEffect(() => {
    const fetchNumbers = async () => {
      try {
        const res = await fetch(`${API_URL}/available-numbers?areaCode=${areaCode}`)
        const data = await res.json() as { numbers: AvailableNumber[] }
        setNumbers(data.numbers ?? [])
      } catch {
        toast.error("Failed to load available numbers")
      } finally {
        setLoadingNumbers(false)
      }
    }
    fetchNumbers()
  }, [areaCode])

  const handleActivate = async () => {
    if (!selected) return
    setActivating(true)
    try {
      // 1. Create the business
      const createRes = await fetch(`${API_URL}/businesses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: businessName, businessType, userId }),
      })
      const createData = await createRes.json() as { businessId?: string; error?: string }
      if (createData.error || !createData.businessId) throw new Error(createData.error ?? "Failed to create business")

      // 2. Provision the chosen number
      const provisionRes = await fetch(`${API_URL}/businesses/${createData.businessId}/provision`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber: selected }),
      })
      const provisionData = await provisionRes.json() as { phoneNumber?: string; error?: string }
      if (provisionData.error) throw new Error(provisionData.error)

      toast.success(`Your AI Front Desk is live at ${provisionData.phoneNumber}!`)
      onSuccess()
    } catch (err) {
      toast.error((err as Error).message ?? "Something went wrong")
    } finally {
      setActivating(false)
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm text-neutral-500 mb-3">
          Available numbers in the <span className="font-semibold text-neutral-900">({areaCode})</span> area:
        </p>

        {loadingNumbers ? (
          <div className="flex items-center justify-center py-8">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-neutral-300 border-t-indigo-600" />
          </div>
        ) : numbers.length === 0 ? (
          <div className="rounded-xl border border-neutral-200 bg-neutral-50 py-6 text-center text-sm text-neutral-500">
            No numbers found for area code {areaCode}.
            <button type="button" onClick={onBack} className="ml-1 text-indigo-600 hover:underline">
              Try a different area code
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {numbers.map((n) => (
              <button
                key={n.phoneNumber}
                type="button"
                onClick={() => setSelected(n.phoneNumber)}
                className={`w-full rounded-xl border px-4 py-3.5 text-left transition-all ${
                  selected === n.phoneNumber
                    ? "border-indigo-500 bg-indigo-50 ring-2 ring-indigo-200"
                    : "border-neutral-200 bg-white hover:border-neutral-300"
                }`}
              >
                <p className="font-mono text-sm font-semibold text-neutral-900">{n.friendlyName}</p>
                <p className="text-xs text-neutral-500 mt-0.5">{n.locality}, {n.region}</p>
              </button>
            ))}
          </div>
        )}
      </div>

      <Button
        className="w-full bg-indigo-600 text-white hover:bg-indigo-700"
        disabled={!selected || activating || loadingNumbers}
        onClick={handleActivate}
      >
        {activating ? (
          <span className="flex items-center gap-2">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            Activating…
          </span>
        ) : "Activate my Front Desk"}
      </Button>

      <button
        type="button"
        onClick={onBack}
        disabled={activating}
        className="w-full text-sm text-neutral-400 hover:text-neutral-600 disabled:pointer-events-none"
      >
        ← Back
      </button>
    </div>
  )
}
