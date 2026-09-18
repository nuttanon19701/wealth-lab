import { useState } from "react"

import { Input } from "@/components/ui/input"

function formatDisplay(value: number): string {
  if (!Number.isFinite(value)) return ""
  return value.toLocaleString("en-US", { maximumFractionDigits: 10 })
}

interface FormattedNumberInputProps {
  value: number
  onChange: (value: number) => void
  className?: string
  placeholder?: string
}

export function FormattedNumberInput({ value, onChange, className, placeholder }: FormattedNumberInputProps) {
  const [focused, setFocused] = useState(false)
  const [draft, setDraft] = useState("")

  const displayValue = focused ? draft : formatDisplay(value)

  return (
    <Input
      type="text"
      inputMode="decimal"
      placeholder={placeholder}
      value={displayValue}
      onFocus={(e) => {
        setFocused(true)
        setDraft(value === 0 ? "" : String(value))
        requestAnimationFrame(() => e.target.select())
      }}
      onChange={(e) => {
        const raw = e.target.value
        setDraft(raw)
        const cleaned = raw.replace(/,/g, "")
        if (cleaned === "" || cleaned === "-" || cleaned === "." || cleaned === "-.") {
          if (cleaned === "") onChange(0)
          return
        }
        const num = Number(cleaned)
        if (!Number.isNaN(num)) onChange(num)
      }}
      onBlur={() => setFocused(false)}
      className={className}
    />
  )
}
