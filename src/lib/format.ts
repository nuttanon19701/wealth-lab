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

// Compact form for chart axis ticks, where full 2-decimal precision would overflow
// (e.g. "6,000,000.00" -> "6M"). Full precision stays in tooltips, tables, and stats.
export function formatBahtCompact(value: number): string {
  if (!Number.isFinite(value)) return "0"
  const abs = Math.abs(value)
  const sign = value < 0 ? "-" : ""
  if (abs >= 1_000_000) {
    return `${sign}${(abs / 1_000_000).toLocaleString("th-TH", { maximumFractionDigits: 1 })}M`
  }
  if (abs >= 1_000) {
    return `${sign}${(abs / 1_000).toLocaleString("th-TH", { maximumFractionDigits: 1 })}K`
  }
  return `${sign}${abs.toLocaleString("th-TH", { maximumFractionDigits: 0 })}`
}

export function formatMonthYear(monthIndex: number): string {
  const year = Math.floor(monthIndex / 12) + 1
  const month = (monthIndex % 12) + 1
  return `ปีที่ ${year} เดือน ${month}`
}
