import type { ReactNode } from "react"

import { FormattedNumberInput } from "@/components/calculator/FormattedNumberInput"
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
  hint?: string
}

export function NumberField({ label, value, onChange, suffix, hint }: NumberFieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label>{label}</Label>
      <div className="relative">
        <FormattedNumberInput value={value} onChange={onChange} className={suffix ? "pr-14" : undefined} />
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
          <FormattedNumberInput value={value} onChange={onChange} className="pr-12" />
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

interface SelectOption<T extends string> {
  value: T
  label: string
}

interface NumberWithOptionsFieldProps<T extends string> {
  label: string
  value: number
  onChange: (value: number) => void
  optionValue: T
  onOptionChange: (value: T) => void
  options: SelectOption<T>[]
  suffix?: string
  optionWidthClassName?: string
}

export function NumberWithOptionsField<T extends string>({
  label,
  value,
  onChange,
  optionValue,
  onOptionChange,
  options,
  suffix = "%",
  optionWidthClassName = "w-32",
}: NumberWithOptionsFieldProps<T>) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label>{label}</Label>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <FormattedNumberInput value={value} onChange={onChange} className="pr-10" />
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
            {suffix}
          </span>
        </div>
        <Select value={optionValue} onValueChange={(v) => onOptionChange(v as T)}>
          <SelectTrigger className={`${optionWidthClassName} shrink-0`}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {options.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}

interface ReadonlyFieldProps {
  label: string
  value: string
  hint?: string
}

export function ReadonlyField({ label, value, hint }: ReadonlyFieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label className="text-muted-foreground">{label}</Label>
      <div className="flex h-9 items-center rounded-md border border-dashed border-border bg-muted/40 px-3 text-sm font-semibold text-foreground">
        {value}
      </div>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
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
