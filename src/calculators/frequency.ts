export type GrowthFrequency = "annually" | "semiannually" | "quarterly" | "monthly"

export const GROWTH_FREQUENCY_MONTHS: Record<GrowthFrequency, number> = {
  monthly: 1,
  quarterly: 3,
  semiannually: 6,
  annually: 12,
}

export const growthFrequencyOptions: { value: GrowthFrequency; label: string }[] = [
  { value: "annually", label: "ต่อปี" },
  { value: "semiannually", label: "ต่อครึ่งปี" },
  { value: "quarterly", label: "ต่อไตรมาส" },
  { value: "monthly", label: "ต่อเดือน" },
]
