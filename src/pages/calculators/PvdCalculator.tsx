import { useMemo, useState } from "react"

import { BigStat } from "@/components/calculator/BigStat"
import { FieldGroup, NumberField, NumberWithFrequencyField, NumberWithOptionsField } from "@/components/calculator/fields"
import { InfoBlock, InfoSection } from "@/components/calculator/InfoSection"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { Frequency } from "@/calculators/dca"
import { growthFrequencyOptions, type GrowthFrequency } from "@/calculators/frequency"
import { calculatePvd, type PvdCompounding, type PvdInputs } from "@/calculators/pvd"
import { formatBaht } from "@/lib/format"

const defaultInputs: PvdInputs = {
  currentlySaved: 150000,
  salary: 35000,
  salaryFrequency: "monthly",
  salaryRaisePct: 5,
  salaryRaiseFrequency: "annually",
  compounding: "annually",
  contributionPct: 5,
  employerMatchPct: 5,
  annualReturnPct: 5,
  years: 25,
}

const compoundingOptions: { value: PvdCompounding; label: string }[] = [
  { value: "annually", label: "Annually" },
  { value: "semiannually", label: "Semiannually" },
  { value: "quarterly", label: "Quarterly" },
  { value: "monthly", label: "Monthly" },
  { value: "none", label: "No compound" },
]

export function PvdCalculator() {
  const [inputs, setInputs] = useState<PvdInputs>(defaultInputs)

  const result = useMemo(() => calculatePvd(inputs), [inputs])

  const yearlyRows = useMemo(
    () => result.rows.filter((r) => r.monthInYear === 12 || r.month === result.rows.length),
    [result.rows],
  )

  function update<K extends keyof PvdInputs>(key: K, value: PvdInputs[K]) {
    setInputs((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
          กองทุนสำรองเลี้ยงชีพ Calculator
        </h1>
        <p className="text-muted-foreground">
          ประมาณการเงินกองทุนสำรองเลี้ยงชีพ (Provident Fund) เมื่อถึงวันเกษียณอายุ
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>ข้อมูลนำเข้า</CardTitle>
          <CardDescription>กรอกข้อมูลรายได้และอัตราการสะสมของคุณ</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <FieldGroup columns={3}>
            <NumberField
              label="เงินสะสมปัจจุบัน"
              value={inputs.currentlySaved}
              onChange={(v) => update("currentlySaved", Math.max(0, v))}
              suffix="บาท"
              min={0}
            />
            <NumberWithFrequencyField
              label="รายได้"
              value={inputs.salary}
              onChange={(v) => update("salary", Math.max(0, v))}
              frequency={inputs.salaryFrequency}
              onFrequencyChange={(f: Frequency) => update("salaryFrequency", f)}
            />
            <NumberWithOptionsField
              label="รายได้เพิ่มขึ้น"
              value={inputs.salaryRaisePct}
              onChange={(v) => update("salaryRaisePct", v)}
              optionValue={inputs.salaryRaiseFrequency}
              onOptionChange={(f: GrowthFrequency) => update("salaryRaiseFrequency", f)}
              options={growthFrequencyOptions}
            />
          </FieldGroup>

          <FieldGroup columns={3}>
            <NumberField
              label="สัดส่วนสะสมของพนักงาน"
              value={inputs.contributionPct}
              onChange={(v) => update("contributionPct", Math.max(0, v))}
              suffix="%"
              min={0}
            />
            <NumberField
              label="สัดส่วนสมทบของนายจ้าง"
              value={inputs.employerMatchPct}
              onChange={(v) => update("employerMatchPct", Math.max(0, v))}
              suffix="%"
              min={0}
            />
            <NumberField
              label="ผลตอบแทนต่อปี"
              value={inputs.annualReturnPct}
              onChange={(v) => update("annualReturnPct", v)}
              suffix="%"
            />
          </FieldGroup>

          <FieldGroup columns={2}>
            <div className="flex flex-col gap-1.5">
              <Label>ความถี่การทบต้น (Compounding)</Label>
              <Select
                value={inputs.compounding}
                onValueChange={(v) => update("compounding", v as PvdCompounding)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {compoundingOptions.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <NumberField
              label="ระยะเวลาจนถึงเกษียณ"
              value={inputs.years}
              onChange={(v) => update("years", Math.max(0, Math.round(v)))}
              suffix="ปี"
              min={0}
            />
          </FieldGroup>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <BigStat label="เงินสะสมของพนักงาน" value={`${formatBaht(result.finalEmployeeContribution)} บาท`} />
        <BigStat label="เงินสมทบของนายจ้าง" value={`${formatBaht(result.finalEmployerMatch)} บาท`} />
        <BigStat label="ผลตอบแทนจากการลงทุน" value={`${formatBaht(result.finalInvestmentGain)} บาท`} />
        <BigStat label="ยอดเงินเมื่อเกษียณ" value={`${formatBaht(result.finalBalance)} บาท`} tone="primary" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>ตารางรายละเอียด</CardTitle>
          <CardDescription>ตัวเลขในตารางเป็นยอดสะสมตั้งแต่ต้น</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="year">
            <TabsList>
              <TabsTrigger value="year">รายปี</TabsTrigger>
              <TabsTrigger value="month">รายเดือน</TabsTrigger>
            </TabsList>
            <TabsContent value="year">
              <div className="max-h-[28rem] overflow-auto rounded-lg border border-border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="sticky left-0 top-0 z-20 bg-muted/90 backdrop-blur">ปี</TableHead>
                      <TableHead className="sticky top-0 z-10 bg-muted/90 text-right backdrop-blur">
                        เงินสะสมพนักงาน
                      </TableHead>
                      <TableHead className="sticky top-0 z-10 bg-muted/90 text-right backdrop-blur">
                        เงินสมทบนายจ้าง
                      </TableHead>
                      <TableHead className="sticky top-0 z-10 bg-muted/90 text-right backdrop-blur">
                        ผลตอบแทน
                      </TableHead>
                      <TableHead className="sticky top-0 z-10 bg-muted/90 text-right backdrop-blur">
                        ยอดคงเหลือ
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {yearlyRows.map((row) => (
                      <TableRow key={row.year}>
                        <TableCell className="sticky left-0 z-10 bg-background font-medium text-foreground">
                          ปีที่ {row.year}
                        </TableCell>
                        <TableCell className="text-right tabular-nums text-muted-foreground">
                          {formatBaht(row.employeeContribution)}
                        </TableCell>
                        <TableCell className="text-right tabular-nums text-muted-foreground">
                          {formatBaht(row.employerMatch)}
                        </TableCell>
                        <TableCell className="text-right tabular-nums text-muted-foreground">
                          {formatBaht(row.investmentGain)}
                        </TableCell>
                        <TableCell className="text-right tabular-nums font-medium text-foreground">
                          {formatBaht(row.balance)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
            <TabsContent value="month">
              <div className="max-h-[28rem] overflow-auto rounded-lg border border-border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="sticky left-0 top-0 z-20 bg-muted/90 backdrop-blur">เดือนที่</TableHead>
                      <TableHead className="sticky top-0 z-10 bg-muted/90 text-right backdrop-blur">
                        เงินสะสมพนักงาน
                      </TableHead>
                      <TableHead className="sticky top-0 z-10 bg-muted/90 text-right backdrop-blur">
                        เงินสมทบนายจ้าง
                      </TableHead>
                      <TableHead className="sticky top-0 z-10 bg-muted/90 text-right backdrop-blur">
                        ผลตอบแทน
                      </TableHead>
                      <TableHead className="sticky top-0 z-10 bg-muted/90 text-right backdrop-blur">
                        ยอดคงเหลือ
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {result.rows.map((row) => (
                      <TableRow key={row.month}>
                        <TableCell className="sticky left-0 z-10 bg-background font-medium text-foreground">
                          {row.month}
                          <span className="ml-1 text-xs text-muted-foreground">
                            (ปีที่ {row.year} ด. {row.monthInYear})
                          </span>
                        </TableCell>
                        <TableCell className="text-right tabular-nums text-muted-foreground">
                          {formatBaht(row.employeeContribution)}
                        </TableCell>
                        <TableCell className="text-right tabular-nums text-muted-foreground">
                          {formatBaht(row.employerMatch)}
                        </TableCell>
                        <TableCell className="text-right tabular-nums text-muted-foreground">
                          {formatBaht(row.investmentGain)}
                        </TableCell>
                        <TableCell className="text-right tabular-nums font-medium text-foreground">
                          {formatBaht(row.balance)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <InfoSection>
        <InfoBlock heading="กองทุนสำรองเลี้ยงชีพคืออะไร">
          <p>
            กองทุนสำรองเลี้ยงชีพ (Provident Fund) คือสวัสดิการที่ลูกจ้างและนายจ้างร่วมกันสะสมเงินทุกเดือนจากเงินเดือน
            เพื่อเป็นเงินออมยามเกษียณ โดยนายจ้างจะสมทบเงินเพิ่มให้ตามสัดส่วนที่กำหนด เงินทั้งหมดจะถูกนำไปลงทุนตามนโยบายที่เลือก
            และได้รับสิทธิประโยชน์ทางภาษีตามเงื่อนไขที่กฎหมายกำหนด
          </p>
        </InfoBlock>
        <InfoBlock heading="เครื่องมือนี้คำนวณอย่างไร">
          <p>
            ในแต่ละเดือน เงินสะสมของพนักงานและเงินสมทบของนายจ้างจะถูกคำนวณจากรายได้ ณ ขณะนั้น
            (ซึ่งปรับขึ้นตามอัตราและความถี่ที่กำหนด)
            แล้วนำเข้าสู่กองทุน ผลตอบแทนจากการลงทุนจะถูกคำนวณตามความถี่การทบต้นที่เลือก — หากเลือก &ldquo;No compound&rdquo;
            ผลตอบแทนจะคำนวณแบบดอกเบี้ยคงที่จากยอดคงเหลือในแต่ละเดือน โดยไม่นำผลตอบแทนเดิมไปทบต้นต่อ
          </p>
        </InfoBlock>
        <InfoBlock heading="ข้อควรระวัง">
          <p>
            ตัวเลขนี้เป็นการประมาณการจากอัตราผลตอบแทนคงที่ที่คุณกำหนดเอง ผลตอบแทนจริงของกองทุนมีความผันผวนตามนโยบายการลงทุนที่เลือก
            และอาจได้รับผลกระทบจากค่าธรรมเนียมการจัดการกองทุน ควรตรวจสอบข้อมูลกับบริษัทจัดการกองทุนของคุณอีกครั้ง
          </p>
        </InfoBlock>
      </InfoSection>
    </div>
  )
}
