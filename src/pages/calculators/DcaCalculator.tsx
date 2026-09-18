import { useMemo, useState } from "react"
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import { BigStat } from "@/components/calculator/BigStat"
import { FanChart } from "@/components/calculator/FanChart"
import { FieldGroup, NumberField, NumberWithFrequencyField } from "@/components/calculator/fields"
import { InfoBlock, InfoSection } from "@/components/calculator/InfoSection"
import { MonteCarloToggle } from "@/components/calculator/MonteCarloToggle"
import { MonthYearGrid } from "@/components/calculator/MonthYearGrid"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { calculateDca, type DcaInputs, type Frequency } from "@/calculators/dca"
import { runDcaMonteCarlo } from "@/calculators/dcaMonteCarlo"
import { formatBaht, formatBahtCompact } from "@/lib/format"

const defaultInputs: DcaInputs = {
  years: 20,
  initialInvestment: 100000,
  annualReturnPct: 8,
  additionalInvestment: 5000,
  additionalFrequency: "monthly",
  additionalGrowthPct: 3,
  additionalGrowthFrequency: "annually",
}

const defaultVolatilityPct = 15

export function DcaCalculator() {
  const [inputs, setInputs] = useState<DcaInputs>(defaultInputs)
  const [monteCarloEnabled, setMonteCarloEnabled] = useState(false)
  const [volatilityPct, setVolatilityPct] = useState(defaultVolatilityPct)

  const result = useMemo(() => calculateDca(inputs), [inputs])

  const mcResult = useMemo(() => {
    if (!monteCarloEnabled) return null
    return runDcaMonteCarlo({ ...inputs, volatilityPct })
  }, [monteCarloEnabled, inputs, volatilityPct])

  const chartData = useMemo(() => {
    const points: { year: number; deposit: number; portfolio: number }[] = [
      { year: 0, deposit: inputs.initialInvestment, portfolio: inputs.initialInvestment },
    ]
    for (let y = 1; y <= inputs.years; y++) {
      const row = result.rows.find((r) => r.year === y && r.monthInYear === 12)
      if (row) {
        points.push({ year: y, deposit: row.contribution, portfolio: row.value })
      }
    }
    return points
  }, [result.rows, inputs.years, inputs.initialInvestment])

  const getValueFor = (field: "value" | "contribution" | "returnAmount") => (year: number, month: number) => {
    const row = result.rows.find((r) => r.year === year && r.monthInYear === month)
    return row?.[field]
  }

  function update<K extends keyof DcaInputs>(key: K, value: DcaInputs[K]) {
    setInputs((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">DCA Calculator</h1>
        <p className="text-muted-foreground">
          จำลองผลลัพธ์การลงทุนแบบถัวเฉลี่ยต้นทุน (Dollar-Cost Averaging) พร้อมเงินลงทุนเพิ่มเติมรายงวด
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>ข้อมูลนำเข้า</CardTitle>
          <CardDescription>กรอกแผนการลงทุนของคุณเพื่อดูผลลัพธ์ที่คาดหวัง</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <FieldGroup columns={3}>
            <NumberField
              label="ระยะเวลาลงทุน"
              value={inputs.years}
              onChange={(v) => update("years", Math.max(0, v))}
              suffix="ปี"
              min={0}
            />
            <NumberField
              label="เงินลงทุนเริ่มต้น"
              value={inputs.initialInvestment}
              onChange={(v) => update("initialInvestment", Math.max(0, v))}
              suffix="บาท"
              min={0}
            />
            <NumberField
              label="ผลตอบแทนคาดหวังต่อปี"
              value={inputs.annualReturnPct}
              onChange={(v) => update("annualReturnPct", v)}
              suffix="%"
            />
          </FieldGroup>

          <FieldGroup title="เงินลงทุนเพิ่มเติม">
            <NumberWithFrequencyField
              label="จำนวนเงินลงทุนเพิ่มเติม"
              value={inputs.additionalInvestment}
              onChange={(v) => update("additionalInvestment", Math.max(0, v))}
              frequency={inputs.additionalFrequency}
              onFrequencyChange={(f: Frequency) => update("additionalFrequency", f)}
            />
            <NumberWithFrequencyField
              label="อัตราการเติบโตของเงินลงทุนเพิ่มเติม"
              value={inputs.additionalGrowthPct}
              onChange={(v) => update("additionalGrowthPct", v)}
              frequency={inputs.additionalGrowthFrequency}
              onFrequencyChange={(f: Frequency) => update("additionalGrowthFrequency", f)}
              suffix="%"
            />
          </FieldGroup>
        </CardContent>
      </Card>

      <MonteCarloToggle enabled={monteCarloEnabled} onToggle={setMonteCarloEnabled} />

      <BigStat
        label={`มูลค่าพอร์ตโดยประมาณเมื่อครบ ${inputs.years} ปี`}
        value={`${formatBaht(result.finalValue)} บาท`}
        sub={`เงินลงทุนสะสม ${formatBaht(result.finalContribution)} บาท · กำไรที่คาดหวัง ${formatBaht(result.finalReturn)} บาท`}
      />

      <Card>
        <CardHeader>
          <CardTitle>เงินลงทุนสะสม เทียบกับ มูลค่าพอร์ตที่คาดหวัง</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 8, right: 16, left: 8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis
                  dataKey="year"
                  tickFormatter={(v) => `ปี ${v}`}
                  className="text-xs"
                  stroke="var(--muted-foreground)"
                />
                <YAxis
                  tickFormatter={(v) => formatBahtCompact(Number(v))}
                  className="text-xs"
                  stroke="var(--muted-foreground)"
                  width={56}
                />
                <Tooltip
                  formatter={(value) => `${formatBaht(Number(value))} บาท`}
                  labelFormatter={(v) => `ปี ${v}`}
                  contentStyle={{
                    background: "var(--popover)",
                    border: "1px solid var(--border)",
                    borderRadius: 8,
                    color: "var(--popover-foreground)",
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="deposit"
                  name="เงินลงทุนสะสม"
                  stroke="var(--chart-2)"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="portfolio"
                  name="มูลค่าพอร์ตที่คาดหวัง"
                  stroke="var(--chart-1)"
                  strokeWidth={2.5}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {monteCarloEnabled && mcResult && (
        <Card>
          <CardHeader>
            <CardTitle>ผลการจำลอง Monte Carlo</CardTitle>
            <CardDescription>สุ่มผลตอบแทนรายเดือน 500 ครั้ง จากค่าเฉลี่ยและความผันผวนที่กำหนด</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            <FieldGroup columns={1}>
              <NumberField
                label="ความผันผวนของผลตอบแทน (Volatility, SD ต่อปี)"
                value={volatilityPct}
                onChange={setVolatilityPct}
                suffix="%"
                min={0}
                hint="ค่ายิ่งสูง แปลว่าผลตอบแทนแต่ละปีแกว่งมากขึ้น (หุ้นทั่วไปมักอยู่ราว 15-25%)"
              />
            </FieldGroup>

            <BigStat
              label="มูลค่าพอร์ตมัธยฐาน (Median) เมื่อครบกำหนด"
              value={`${formatBaht(mcResult.medianFinal)} บาท`}
              sub={`ช่วงที่เป็นไปได้ (10th–90th percentile): ${formatBaht(mcResult.p10Final)} – ${formatBaht(mcResult.p90Final)} บาท`}
            />

            <div className="h-80 w-full">
              <FanChart
                data={mcResult.yearly}
                xKey="year"
                p10Key="p10"
                p50Key="p50"
                p90Key="p90"
                extraLine={{ key: "deposit", name: "เงินลงทุนสะสม", color: "var(--chart-2)" }}
                xTickFormatter={(v) => `ปี ${v}`}
                yTickFormatter={(v) => formatBahtCompact(v)}
                tooltipFormatter={(v) => `${formatBaht(v)} บาท`}
              />
            </div>

            <p className="text-xs text-muted-foreground">
              พื้นที่แรเงาคือช่วงผลลัพธ์ตั้งแต่ 10th ถึง 90th percentile จากการจำลอง 500 ครั้ง
              เส้นหนาคือค่ามัธยฐาน (สถานการณ์กลาง) หมายความว่ามีโอกาสประมาณ 80%
              ที่ผลลัพธ์จริงจะอยู่ในช่วงที่แรเงานี้
            </p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>ตารางรายละเอียดรายเดือน</CardTitle>
          <CardDescription>แถวคือปี คอลัมน์คือเดือน</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="value">
            <TabsList>
              <TabsTrigger value="value">มูลค่าพอร์ต</TabsTrigger>
              <TabsTrigger value="contribution">เงินลงทุนสะสม</TabsTrigger>
              <TabsTrigger value="return">ผลตอบแทน</TabsTrigger>
            </TabsList>
            <TabsContent value="value">
              <MonthYearGrid years={inputs.years} getValue={getValueFor("value")} />
            </TabsContent>
            <TabsContent value="contribution">
              <MonthYearGrid years={inputs.years} getValue={getValueFor("contribution")} />
            </TabsContent>
            <TabsContent value="return">
              <MonthYearGrid years={inputs.years} getValue={getValueFor("returnAmount")} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <InfoSection>
        <InfoBlock heading="DCA คืออะไร">
          <p>
            Dollar-Cost Averaging (DCA) คือกลยุทธ์การลงทุนแบบทยอยลงทุนด้วยจำนวนเงินคงที่อย่างสม่ำเสมอ
            แทนที่จะลงทุนเป็นก้อนใหญ่ครั้งเดียว ช่วยลดผลกระทบจากความผันผวนของราคาในระยะสั้น
            เพราะบางเดือนซื้อได้ราคาแพง บางเดือนซื้อได้ราคาถูก เฉลี่ยแล้วต้นทุนจะไม่สุดโต่งไปด้านใดด้านหนึ่ง
          </p>
        </InfoBlock>
        <InfoBlock heading="เครื่องมือนี้คำนวณอย่างไร">
          <p>
            ผลตอบแทนต่อปีที่ระบุจะถูกแปลงเป็นอัตราทบต้นรายเดือน แล้วจำลองการเติบโตของพอร์ตทุกเดือนตลอดระยะเวลาที่กำหนด
            เงินลงทุนเพิ่มเติมจะถูกนำเข้าพอร์ตตามความถี่ที่เลือก (รายเดือน/รายปี)
            และจำนวนเงินลงทุนเพิ่มเติมจะเติบโตขึ้นตามอัตราการเติบโตที่กำหนดในทุกรอบความถี่ที่เลือกไว้เช่นกัน
          </p>
        </InfoBlock>
        <InfoBlock heading="ข้อควรระวัง">
          <p>
            ตัวเลขที่ได้เป็นเพียงการประมาณการจากอัตราผลตอบแทนคงที่ที่คุณกำหนดเอง
            ผลตอบแทนจริงของการลงทุนมีความผันผวนและไม่สามารถรับประกันได้
            ควรใช้ผลลัพธ์นี้เพื่อประกอบการวางแผนเบื้องต้นเท่านั้น ไม่ใช่คำแนะนำการลงทุน
          </p>
        </InfoBlock>
      </InfoSection>
    </div>
  )
}
