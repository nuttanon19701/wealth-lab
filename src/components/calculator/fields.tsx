import type { ReactNode } from "react"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Frequency } from "@/calculators/dca"

interface NumberFieldProps {
  label: string
  value: number
  onChange: (value: number) => void
  suffix?: string
  min?: number
  max?: number
  step?: number
  hint?: string
}

export function NumberField({ label, value, onChange, suffix, min, max, step, hint }: NumberFieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label>{label}</Label>
      <div className="relative">
        <Input
          type="number"
          inputMode="decimal"
          value={Number.isFinite(value) ? value : 0}
          min={min}
          max={max}
          step={step ?? "any"}
          onChange={(e) => onChange(e.target.value === "" ? 0 : Number(e.target.value))}
          className={suffix ? "pr-14" : undefined}
        />
        {suffix && (
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
            {suffix}
          </span>
        )}
      </div>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  )
}

interface NumberWithFrequencyFieldProps {
  label: string
  value: number
  onChange: (value: number) => void
  frequency: Frequency
  onFrequencyChange: (freq: Frequency) => void
  suffix?: string
}

export function NumberWithFrequencyField({
  label,
  value,
  onChange,
  frequency,
  onFrequencyChange,
  suffix = "บาท",
}: NumberWithFrequencyFieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label>{label}</Label>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Input
            type="number"
            inputMode="decimal"
            value={Number.isFinite(value) ? value : 0}
            onChange={(e) => onChange(e.target.value === "" ? 0 : Number(e.target.value))}
            className="pr-12"
          />
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
            {suffix}
          </span>
        </div>
        <Select value={frequency} onValueChange={(v) => onFrequencyChange(v as Frequency)}>
          <SelectTrigger className="w-28 shrink-0">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="monthly">ต่อเดือน</SelectItem>
            <SelectItem value="annually">ต่อปี</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}

interface FieldGroupProps {
  title?: string
  children: ReactNode
  columns?: 1 | 2 | 3
}

export function FieldGroup({ title, children, columns = 2 }: FieldGroupProps) {
  const colClass =
    columns === 1 ? "grid-cols-1" : columns === 3 ? "grid-cols-1 sm:grid-cols-3" : "grid-cols-1 sm:grid-cols-2"
  return (
    <div className="flex flex-col gap-4">
      {title && <h3 className="text-sm font-semibold text-foreground">{title}</h3>}
      <div className={`grid gap-4 ${colClass}`}>{children}</div>
    </div>
  )
}
