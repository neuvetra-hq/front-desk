// apps/web/src/components/get-started/StepVoice.tsx
import { jost } from "./types"
import type { AiVoiceGender } from "./types"

const OPTIONS: { value: AiVoiceGender; label: string; description: string }[] = [
  { value: "female", label: "Female", description: "Warm, clear, and natural-sounding" },
  { value: "male",   label: "Male",   description: "Deep, confident, and professional" },
]

interface Props {
  value: AiVoiceGender
  onNext: (gender: AiVoiceGender) => void
}

export function StepVoice({ value, onNext }: Props) {
  return (
    <div className="space-y-3">
      {OPTIONS.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onNext(opt.value)}
          className={[
            "w-full text-left px-5 py-5 border transition-colors",
            value === opt.value
              ? "border-violet-500/50 bg-violet-500/[0.06]"
              : "border-white/10 hover:border-white/20 hover:bg-white/[0.02]",
          ].join(" ")}
        >
          <p
            className="text-sm font-light tracking-[.08em] uppercase mb-1"
            style={{ color: value === opt.value ? "rgba(167,139,250,0.9)" : "rgba(255,255,255,0.7)", fontFamily: "'Jost', sans-serif" }}
          >
            {opt.label}
          </p>
          <p className="text-xs text-white/30" style={jost}>
            {opt.description}
          </p>
        </button>
      ))}
    </div>
  )
}
