import { Check, X, Minus } from "lucide-react"
import { Container } from "@/components/layout/Container"
import { COMPARISON } from "@/constants/landing"

const iconFor = (value: string) => {
  if (value === "✅" || value === "Always" || value === "Every call" || value === "Fully trained by you" || value === "< 10 minutes")
    return <Check className="mx-auto h-4 w-4 text-emerald-500" />
  if (value === "❌" || value === "None")
    return <X className="mx-auto h-4 w-4 text-red-400" />
  if (value === "Partial" || value === "Partial coverage" || value === "Rarely")
    return <Minus className="mx-auto h-4 w-4 text-amber-400" />
  return null
}

export function ComparisonTable() {
  return (
    <section className="bg-white py-24">
      <Container>
        <div className="mb-12 text-center">
          <span className="mb-3 inline-block rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700">
            Comparison
          </span>
          <h2 className="text-3xl font-bold tracking-tight text-neutral-900 md:text-4xl">
            Why Front Desk beats the alternatives
          </h2>
          <p className="mt-4 text-neutral-500">
            See how we stack up against hiring staff or using a generic answering service.
          </p>
        </div>

        <div className="overflow-hidden rounded-2xl border border-neutral-200">
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className="bg-neutral-50 px-6 py-4 text-left font-medium text-neutral-500 w-1/4" />
                {COMPARISON.columns.map((col) => (
                  <th
                    key={col.name}
                    className={`px-6 py-4 text-center font-semibold ${
                      col.highlight
                        ? "bg-indigo-600 text-white"
                        : "bg-neutral-50 text-neutral-700"
                    }`}
                  >
                    {col.highlight && (
                      <span className="mb-1 block text-xs font-normal text-indigo-200">Recommended</span>
                    )}
                    {col.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {COMPARISON.features.map((feature, rowIdx) => (
                <tr key={feature} className="hover:bg-neutral-50">
                  <td className="px-6 py-4 font-medium text-neutral-700">{feature}</td>
                  {COMPARISON.columns.map((col) => {
                    const val = col.values[rowIdx]
                    const icon = iconFor(val)
                    return (
                      <td
                        key={col.name}
                        className={`px-6 py-4 text-center ${
                          col.highlight ? "bg-indigo-50 font-medium text-indigo-900" : "text-neutral-600"
                        }`}
                      >
                        {icon ?? val}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Container>
    </section>
  )
}
