// apps/web/src/components/get-started/DarkInput.tsx
import { forwardRef, type InputHTMLAttributes } from "react"

interface DarkInputProps extends InputHTMLAttributes<HTMLInputElement> {
  hasError?: boolean
}

export const DarkInput = forwardRef<HTMLInputElement, DarkInputProps>(
  ({ className = "", hasError, style, ...props }, ref) => (
    <input
      ref={ref}
      className={[
        "w-full bg-white/[0.03] border px-4 py-3 text-sm text-white",
        "placeholder:text-white/25 focus:outline-none transition-colors",
        hasError
          ? "border-red-400/40 focus:border-red-400/60"
          : "border-white/10 focus:border-violet-500/50",
        className,
      ].join(" ")}
      style={{ fontFamily: "'Jost', sans-serif", letterSpacing: "0.02em", ...style }}
      {...props}
    />
  )
)
DarkInput.displayName = "DarkInput"
