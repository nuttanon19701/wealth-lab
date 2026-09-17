const bahtFormatter = new Intl.NumberFormat("th-TH", {
  maximumFractionDigits: 0,
})

const bahtFormatter2 = new Intl.NumberFormat("th-TH", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

const percentFormatter = new Intl.NumberFormat("th-TH", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
})

export function formatBaht(value: number): string {
  if (!Number.isFinite(value)) return "0"
  return bahtFormatter.format(Math.round(value))
}

export function formatBaht2(value: number): string {
  if (!Number.isFinite(value)) return "0.00"
  return bahtFormatter2.format(value)
}

export function formatPercent(value: number): string {
  if (!Number.isFinite(value)) return "0"
  return percentFormatter.format(value)
}

export function formatMonthYear(monthIndex: number): string {
  const year = Math.floor(monthIndex / 12) + 1
  const month = (monthIndex % 12) + 1
  return `ปีที่ ${year} เดือน ${month}`
}
