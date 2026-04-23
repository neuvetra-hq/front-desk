import type { ButtonHTMLAttributes } from "react"
import { useAppMachine } from "@/pages/app/hooks/useAppMachine"
import { alpha, jost } from "./types"

type Props = ButtonHTMLAttributes<HTMLButtonElement> & { fullWidth?: boolean }

export function WizardButton({ fullWidth = true, className = "", style, ...props }: Props) {
  const light = useAppMachine((s) => s.context.currentTheme.light)
  return (
    <button
      className={`py-3 text-[11px] font-light tracking-[.18em] uppercase transition-opacity disabled:opacity-40 disabled:cursor-not-allowed ${fullWidth ? "w-full" : ""} ${className}`}
      style={{
        color:       alpha(light, 0.8),
        background:  alpha(light, 0.12),
        border:      `1px solid ${alpha(light, 0.35)}`,
        ...jost,
        ...style,
      }}
      {...props}
    />
  )
}
