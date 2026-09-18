import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatBaht } from "@/lib/format"

interface AmortizationRow {
  month: number
  year: number
  monthInYear: number
  payment: number
  interest: number
  principalPaid: number
  balance: number
}

interface AmortizationTableProps {
  rows: AmortizationRow[]
}

export function AmortizationTable({ rows }: AmortizationTableProps) {
  return (
    <div className="max-h-[28rem] overflow-auto rounded-lg border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="sticky left-0 top-0 z-20 bg-muted/90 backdrop-blur">งวดที่</TableHead>
            <TableHead className="sticky top-0 z-10 bg-muted/90 text-right backdrop-blur">ยอดชำระ</TableHead>
            <TableHead className="sticky top-0 z-10 bg-muted/90 text-right backdrop-blur">ดอกเบี้ย</TableHead>
            <TableHead className="sticky top-0 z-10 bg-muted/90 text-right backdrop-blur">เงินต้น</TableHead>
            <TableHead className="sticky top-0 z-10 bg-muted/90 text-right backdrop-blur">คงเหลือ</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.month}>
              <TableCell className="sticky left-0 z-10 bg-background font-medium text-foreground">
                {row.month}
                <span className="ml-1 text-xs text-muted-foreground">(ปีที่ {row.year} ด. {row.monthInYear})</span>
              </TableCell>
              <TableCell className="text-right tabular-nums text-muted-foreground">{formatBaht(row.payment)}</TableCell>
              <TableCell className="text-right tabular-nums text-muted-foreground">{formatBaht(row.interest)}</TableCell>
              <TableCell className="text-right tabular-nums text-muted-foreground">{formatBaht(row.principalPaid)}</TableCell>
              <TableCell className="text-right tabular-nums font-medium text-foreground">
                {formatBaht(row.balance)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
