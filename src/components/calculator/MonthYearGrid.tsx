import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatBaht } from "@/lib/format"

interface MonthYearGridProps {
  years: number
  getValue: (year: number, month: number) => number | undefined
  format?: (value: number) => string
  yearLabel?: (year: number) => string
}

export function MonthYearGrid({ years, getValue, format = formatBaht, yearLabel }: MonthYearGridProps) {
  const yearList = Array.from({ length: Math.max(0, Math.round(years)) }, (_, i) => i + 1)
  const monthList = Array.from({ length: 12 }, (_, i) => i + 1)

  return (
    <div className="max-h-[28rem] overflow-auto rounded-lg border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="sticky left-0 top-0 z-20 bg-muted/90 backdrop-blur">ปี</TableHead>
            {monthList.map((m) => (
              <TableHead key={m} className="sticky top-0 z-10 bg-muted/90 text-right backdrop-blur">
                {m}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {yearList.map((y) => (
            <TableRow key={y}>
              <TableCell className="sticky left-0 z-10 bg-background font-medium text-foreground">
                {yearLabel ? yearLabel(y) : `ปีที่ ${y}`}
              </TableCell>
              {monthList.map((m) => {
                const v = getValue(y, m)
                return (
                  <TableCell key={m} className="text-right tabular-nums text-muted-foreground">
                    {v === undefined ? "-" : format(v)}
                  </TableCell>
                )
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
