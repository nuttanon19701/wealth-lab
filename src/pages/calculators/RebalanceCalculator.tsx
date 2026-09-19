import { Plus, Trash2 } from "lucide-react"
import { useMemo } from "react"

import { AllocationDonutChart } from "@/components/calculator/AllocationDonutChart"
import { FormattedNumberInput } from "@/components/calculator/FormattedNumberInput"
import { InfoBlock, InfoSection } from "@/components/calculator/InfoSection"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { calculateRebalance, createEmptyAsset, type RebalanceAsset } from "@/calculators/rebalance"
import { useCalculatorState } from "@/lib/calculatorStateStore"
import { formatBaht, formatPercent } from "@/lib/format"
import { cn } from "@/lib/utils"

const defaultAssets: RebalanceAsset[] = [
  { id: "asset-1", name: "หุ้นไทย", currentValue: 300000, expectedPct: 30 },
  { id: "asset-2", name: "หุ้นต่างประเทศ", currentValue: 250000, expectedPct: 30 },
  { id: "asset-3", name: "ตราสารหนี้", currentValue: 350000, expectedPct: 30 },
  { id: "asset-4", name: "ทองคำ", currentValue: 100000, expectedPct: 10 },
]

export function RebalanceCalculator() {
  const [portfolioName, setPortfolioName] = useCalculatorState("rebalance-portfolio-name", "พอร์ตการลงทุนของฉัน")
  const [assets, setAssets] = useCalculatorState<RebalanceAsset[]>("rebalance-assets", defaultAssets)

  const result = useMemo(() => calculateRebalance(assets), [assets])

  function updateAsset(id: string, patch: Partial<RebalanceAsset>) {
    setAssets((prev) => prev.map((a) => (a.id === id ? { ...a, ...patch } : a)))
  }

  function removeAsset(id: string) {
    setAssets((prev) => prev.filter((a) => a.id !== id))
  }

  function addAsset() {
    setAssets((prev) => [...prev, createEmptyAsset(prev.length)])
  }

  function setAssetCount(count: number) {
    const target = Math.max(0, Math.round(count))
    setAssets((prev) => {
      if (target === prev.length) return prev
      if (target < prev.length) return prev.slice(0, target)
      const additions = Array.from({ length: target - prev.length }, (_, i) => createEmptyAsset(prev.length + i))
      return [...prev, ...additions]
    })
  }

  const pctIsBalanced = Math.abs(result.totalExpectedPct - 100) < 0.01

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
          Portfolio Rebalancing Calculator
        </h1>
        <p className="text-muted-foreground">คำนวณว่าควรซื้อหรือขายสินทรัพย์ใดบ้าง เพื่อปรับพอร์ตให้กลับสู่สัดส่วนเป้าหมาย</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>ข้อมูลพอร์ต</CardTitle>
          <CardDescription>ตั้งชื่อพอร์ตและระบุจำนวนสินทรัพย์ที่ต้องการปรับสมดุล</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label>ชื่อพอร์ต</Label>
              <Input value={portfolioName} onChange={(e) => setPortfolioName(e.target.value)} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>จำนวนสินทรัพย์</Label>
              <Input
                type="number"
                min={0}
                value={assets.length}
                onChange={(e) => setAssetCount(Number(e.target.value) || 0)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>ตารางสินทรัพย์</CardTitle>
          <CardDescription>กรอกมูลค่าปัจจุบันและสัดส่วนเป้าหมาย (%) ของแต่ละสินทรัพย์</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="overflow-x-auto rounded-lg border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-40">ชื่อสินทรัพย์</TableHead>
                  <TableHead className="min-w-32">มูลค่าปัจจุบัน</TableHead>
                  <TableHead className="min-w-24 text-right">สัดส่วนปัจจุบัน</TableHead>
                  <TableHead className="min-w-28">สัดส่วนเป้าหมาย (%)</TableHead>
                  <TableHead className="min-w-32 text-right">มูลค่าเป้าหมาย</TableHead>
                  <TableHead className="min-w-40 text-right">สิ่งที่ต้องทำ</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {result.rows.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>
                      <Input
                        value={row.name}
                        onChange={(e) => updateAsset(row.id, { name: e.target.value })}
                        className="h-8 min-w-36"
                      />
                    </TableCell>
                    <TableCell>
                      <FormattedNumberInput
                        value={row.currentValue}
                        onChange={(v) => updateAsset(row.id, { currentValue: Math.max(0, v) })}
                        className="h-8 min-w-28"
                      />
                    </TableCell>
                    <TableCell className="text-right tabular-nums text-muted-foreground">
                      {formatPercent(row.currentPct)}%
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min={0}
                        max={100}
                        value={row.expectedPct}
                        onChange={(e) => updateAsset(row.id, { expectedPct: Number(e.target.value) || 0 })}
                        className="h-8 min-w-24"
                      />
                    </TableCell>
                    <TableCell className="text-right tabular-nums text-muted-foreground">
                      {formatBaht(row.expectedValue)}
                    </TableCell>
                    <TableCell
                      className={cn(
                        "text-right font-semibold tabular-nums",
                        row.action > 1 && "text-success",
                        row.action < -1 && "text-destructive",
                        Math.abs(row.action) <= 1 && "text-muted-foreground",
                      )}
                    >
                      {row.action > 1
                        ? `ซื้อ +${formatBaht(row.action)}`
                        : row.action < -1
                          ? `ขาย ${formatBaht(Math.abs(row.action))}`
                          : "คงที่"}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => removeAsset(row.id)}
                        aria-label="ลบสินทรัพย์"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow className="bg-muted/40 font-semibold">
                  <TableCell>รวม</TableCell>
                  <TableCell className="tabular-nums">{formatBaht(result.totalCurrentValue)}</TableCell>
                  <TableCell className="text-right tabular-nums">100%</TableCell>
                  <TableCell
                    className={cn("tabular-nums", pctIsBalanced ? "text-success" : "text-destructive")}
                  >
                    {formatPercent(result.totalExpectedPct)}%
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{formatBaht(result.totalCurrentValue)}</TableCell>
                  <TableCell />
                  <TableCell />
                </TableRow>
              </TableBody>
            </Table>
          </div>

          {!pctIsBalanced && (
            <p className="text-sm text-destructive">
              สัดส่วนเป้าหมายรวมกันได้ {formatPercent(result.totalExpectedPct)}% ควรปรับให้รวมเท่ากับ 100%
              เพื่อให้ผลลัพธ์ถูกต้อง
            </p>
          )}

          <Button variant="outline" size="sm" onClick={addAsset} className="w-fit">
            <Plus className="h-4 w-4" />
            เพิ่มสินทรัพย์
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>สัดส่วนสินทรัพย์</CardTitle>
          <CardDescription>เปรียบเทียบสัดส่วนปัจจุบันกับสัดส่วนเป้าหมายของแต่ละสินทรัพย์</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-8 sm:grid-cols-2">
          <AllocationDonutChart
            title="สัดส่วนปัจจุบัน"
            data={result.rows.map((r) => ({ name: r.name, value: r.currentValue }))}
          />
          <AllocationDonutChart
            title="สัดส่วนเป้าหมาย"
            data={result.rows.map((r) => ({ name: r.name, value: r.expectedPct }))}
          />
        </CardContent>
      </Card>

      <InfoSection>
        <InfoBlock heading="Rebalancing คืออะไร">
          <p>
            การปรับสมดุลพอร์ต (Rebalancing) คือการซื้อหรือขายสินทรัพย์เพื่อปรับสัดส่วนพอร์ตให้กลับไปตรงกับสัดส่วนเป้าหมายที่วางแผนไว้แต่แรก
            เมื่อเวลาผ่านไป ราคาสินทรัพย์แต่ละประเภทเปลี่ยนแปลงไม่เท่ากัน ทำให้สัดส่วนจริงเบี่ยงเบนไปจากแผน
            การปรับสมดุลช่วยควบคุมความเสี่ยงของพอร์ตให้อยู่ในระดับที่ตั้งใจไว้อย่างสม่ำเสมอ
          </p>
        </InfoBlock>
        <InfoBlock heading="เครื่องมือนี้คำนวณอย่างไร">
          <p>
            มูลค่าเป้าหมายของแต่ละสินทรัพย์ = มูลค่ารวมของพอร์ตทั้งหมด × สัดส่วนเป้าหมาย (%) จากนั้นเปรียบเทียบกับมูลค่าปัจจุบัน
            หากมูลค่าเป้าหมายมากกว่ามูลค่าปัจจุบัน ระบบจะแนะนำให้ &ldquo;ซื้อ&rdquo; เพิ่ม
            หากน้อยกว่าจะแนะนำให้ &ldquo;ขาย&rdquo; ส่วนเกินออก
          </p>
        </InfoBlock>
        <InfoBlock heading="ข้อควรระวัง">
          <p>
            เครื่องมือนี้ยังไม่ได้คำนวณภาษีหรือค่าธรรมเนียมการซื้อขายที่อาจเกิดขึ้นจริง
            และไม่ได้คำนึงถึงจำนวนหน่วยขั้นต่ำในการซื้อขาย ควรใช้ผลลัพธ์นี้เป็นแนวทางเบื้องต้นเท่านั้น
          </p>
        </InfoBlock>
      </InfoSection>
    </div>
  )
}
