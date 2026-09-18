const bahtFormatter = new Intl.NumberFormat("th-TH", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

const percentFormatter = new Intl.NumberFormat("th-TH", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

export function formatBaht(value: number): string {
  if (!Number.isFinite(value)) return "0.00"
  return bahtFormatter.format(value)
}

export function formatPercent(value: number): string {
  if (!Number.isFinite(value)) return "0.00"
  return percentFormatter.format(value)
}

export function formatMonthYear(monthIndex: number): string {
  const year = Math.floor(monthIndex / 12) + 1
  const month = (monthIndex % 12) + 1
  return `ปีที่ ${year} เดือน ${month}`
}
