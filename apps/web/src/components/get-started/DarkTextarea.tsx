// apps/web/src/components/get-started/DarkTextarea.tsx
import { forwardRef, type TextareaHTMLAttributes } from "react"

interface DarkTextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  hasError?: boolean
}

export const DarkTextarea = forwardRef<HTMLTextAreaElement, DarkTextareaProps>(
  ({ className = "", hasError, style, ...props }, ref) => (
    <textarea
      ref={ref}
      className={[
        "w-full bg-white/[0.03] border px-4 py-3 text-sm text-white resize-none",
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
DarkTextarea.displayName = "DarkTextarea"
