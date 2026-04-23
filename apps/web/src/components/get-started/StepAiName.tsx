// apps/web/src/components/get-started/StepAiName.tsx
import { useState } from "react"
import { DarkInput } from "./DarkInput"
import { jostLabel } from "./types"

interface Props {
  value: string
  onNext: (name: string) => void
}

export function StepAiName({ value, onNext }: Props) {
  const [name, setName] = useState(value)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (name.trim()) onNext(name.trim())
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <label className="block text-[10px] uppercase text-white/30" style={jostLabel}>
          AI name
        </label>
        <DarkInput
          placeholder="Aria"
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <p
          className="text-[10px] text-white/20 leading-relaxed"
          style={{ fontFamily: "'Jost', sans-serif" }}
        >
          Your callers will hear: "Hi, I'm {name || "Aria"} — how can I help you today?"
        </p>
      </div>

      <button
        type="submit"
        disabled={!name.trim()}
        className="w-full py-3 text-[11px] font-light tracking-[.18em] uppercase text-violet-200 bg-violet-500/15 border border-violet-500/35 hover:bg-violet-500/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        style={{ fontFamily: "'Jost', sans-serif" }}
      >
        Continue →
      </button>
    </form>
  )
}
