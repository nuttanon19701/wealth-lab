import { useMemo } from "react"
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
import { FieldGroup, NumberField, NumberWithOptionsField } from "@/components/calculator/fields"
import { InfoBlock, InfoSection } from "@/components/calculator/InfoSection"
import { MonthYearGrid } from "@/components/calculator/MonthYearGrid"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { growthFrequencyOptions, type GrowthFrequency } from "@/calculators/frequency"
import { calculateRetirement, type RetirementInputs } from "@/calculators/retirement"
import { useCalculatorState } from "@/lib/calculatorStateStore"
import { formatBaht, formatBahtCompact } from "@/lib/format"

const defaultInputs: RetirementInputs = {
  currentAge: 30,
  retirementAge: 60,
  targetAge: 90,
  currentSavings: 200000,
  monthlyIncome: 40000,
  incomeGrowthPct: 5,
  incomeGrowthFrequency: "annually",
  monthlyExpense: 25000,
  postRetirementMonthlyExpense: 20000,
  inflationPct: 3,
  preRetirementReturnPct: 6,
  postRetirementReturnPct: 3,
}

export function RetirementCalculator() {
  const [inputs, setInputs] = useCalculatorState<RetirementInputs>("retirement-inputs", defaultInputs)

  const result = useMemo(() => calculateRetirement(inputs), [inputs])
  const totalYears = Math.max(0, Math.round(inputs.targetAge - inputs.currentAge))

  const chartData = useMemo(() => {
    const points: { age: number; income: number; expense: number; asset: number }[] = []
    for (let y = 1; y <= totalYears; y++) {
      const yearRows = result.rows.filter((r) => r.year === y)
      if (yearRows.length === 0) continue
      const income = yearRows.reduce((sum, r) => sum + r.income, 0)
      const expense = yearRows.reduce((sum, r) => sum + r.expense, 0)
      const asset = yearRows[yearRows.length - 1].asset
      points.push({ age: inputs.currentAge + y, income, expense, asset })
    }
    return points
  }, [result.rows, totalYears, inputs.currentAge])

  const getValueFor = (field: "asset" | "income" | "expense") => (year: number, month: number) => {
    const row = result.rows.find((r) => r.year === year && r.monthInYear === month)
    return row?.[field]
  }

  function update<K extends keyof RetirementInputs>(key: K, value: RetirementInputs[K]) {
    setInputs((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">Retirement Calculator</h1>
        <p className="text-muted-foreground">วางแผนเงินออมเพื่อการเกษียณอายุ และดูว่าเงินจะเพียงพอถึงอายุเป้าหมายหรือไม่</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>ข้อมูลนำเข้า</CardTitle>
          <CardDescription>กรอกข้อมูลรายได้ รายจ่าย และเป้าหมายการเกษียณของคุณ</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <FieldGroup title="ช่วงอายุ" columns={3}>
            <NumberField
              label="อายุปัจจุบัน"
              value={inputs.currentAge}
              onChange={(v) => update("currentAge", Math.max(0, v))}
              suffix="ปี"
              min={0}
            />
            <NumberField
              label="อายุเกษียณ"
              value={inputs.retirementAge}
              onChange={(v) => update("retirementAge", Math.max(0, v))}
              suffix="ปี"
              min={0}
            />
            <NumberField
              label="อายุเป้าหมาย (ใช้เงินถึงอายุ)"
              value={inputs.targetAge}
              onChange={(v) => update("targetAge", Math.max(0, v))}
              suffix="ปี"
              min={0}
            />
          </FieldGroup>

          <FieldGroup title="เงินออมและรายได้" columns={2}>
            <NumberField
              label="เงินออม ณ ปัจจุบัน"
              value={inputs.currentSavings}
              onChange={(v) => update("currentSavings", Math.max(0, v))}
              suffix="บาท"
              min={0}
            />
            <NumberField
              label="รายได้/เดือน"
              value={inputs.monthlyIncome}
              onChange={(v) => update("monthlyIncome", Math.max(0, v))}
              suffix="บาท"
              min={0}
            />
            <NumberWithOptionsField
              label="รายได้เพิ่มขึ้น"
              value={inputs.incomeGrowthPct}
              onChange={(v) => update("incomeGrowthPct", v)}
              optionValue={inputs.incomeGrowthFrequency}
              onOptionChange={(f: GrowthFrequency) => update("incomeGrowthFrequency", f)}
              options={growthFrequencyOptions}
            />
          </FieldGroup>

          <FieldGroup title="รายจ่าย" columns={2}>
            <NumberField
              label="รายจ่าย/เดือน (ก่อนเกษียณ)"
              value={inputs.monthlyExpense}
              onChange={(v) => update("monthlyExpense", Math.max(0, v))}
              suffix="บาท"
              min={0}
            />
            <NumberField
              label="หลังเกษียณ/เดือน"
              value={inputs.postRetirementMonthlyExpense}
              onChange={(v) => update("postRetirementMonthlyExpense", Math.max(0, v))}
              suffix="บาท"
              min={0}
            />
          </FieldGroup>

          <FieldGroup title="สมมติฐานทางเศรษฐกิจ" columns={3}>
            <NumberField
              label="เงินเฟ้อ"
              value={inputs.inflationPct}
              onChange={(v) => update("inflationPct", v)}
              suffix="%"
            />
            <NumberField
              label="ผลตอบแทนก่อนเกษียณ"
              value={inputs.preRetirementReturnPct}
              onChange={(v) => update("preRetirementReturnPct", v)}
              suffix="%"
            />
            <NumberField
              label="ผลตอบแทนหลังเกษียณ"
              value={inputs.postRetirementReturnPct}
              onChange={(v) => update("postRetirementReturnPct", v)}
              suffix="%"
            />
          </FieldGroup>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <BigStat
          label={`สินทรัพย์โดยประมาณ ณ วันเกษียณ (อายุ ${inputs.retirementAge})`}
          value={`${formatBaht(result.assetAtRetirement)} บาท`}
        />
        <BigStat
          label="เงินเพียงพอถึงอายุเป้าหมายหรือไม่"
          value={result.depletedAge ? `เงินหมดเมื่ออายุ ${Math.floor(result.depletedAge)}` : "เพียงพอ"}
          tone={result.depletedAge ? "destructive" : "success"}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>รายได้ รายจ่าย และสินทรัพย์ตลอดช่วงชีวิต</CardTitle>
          <CardDescription>
            รายได้และรายจ่ายแสดงเป็นยอดรวมต่อปี (แกนซ้าย) ส่วนสินทรัพย์แสดงมูลค่า ณ สิ้นปี (แกนขวา)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 8, right: 16, left: 8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis
                  dataKey="age"
                  tickFormatter={(v) => `อายุ ${v}`}
                  className="text-xs"
                  stroke="var(--muted-foreground)"
                />
                <YAxis
                  yAxisId="flow"
                  orientation="left"
                  tickFormatter={(v) => formatBahtCompact(Number(v))}
                  className="text-xs"
                  stroke="var(--chart-2)"
                  width={56}
                />
                <YAxis
                  yAxisId="asset"
                  orientation="right"
                  tickFormatter={(v) => formatBahtCompact(Number(v))}
                  className="text-xs"
                  stroke="var(--chart-1)"
                  width={56}
                />
                <Tooltip
                  formatter={(value) => `${formatBaht(Number(value))} บาท`}
                  labelFormatter={(v) => `อายุ ${v}`}
                  contentStyle={{
                    background: "var(--popover)",
                    border: "1px solid var(--border)",
                    borderRadius: 8,
                    color: "var(--popover-foreground)",
                  }}
                />
                <Legend />
                <Line
                  yAxisId="flow"
                  type="monotone"
                  dataKey="income"
                  name="รายได้ (รวมต่อปี)"
                  stroke="var(--chart-2)"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  yAxisId="flow"
                  type="monotone"
                  dataKey="expense"
                  name="รายจ่าย (รวมต่อปี)"
                  stroke="var(--chart-4)"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  yAxisId="asset"
                  type="monotone"
                  dataKey="asset"
                  name="สินทรัพย์"
                  stroke="var(--chart-1)"
                  strokeWidth={2.5}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>ตารางรายละเอียดรายเดือน</CardTitle>
          <CardDescription>แถวคือปี คอลัมน์คือเดือน</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="asset">
            <TabsList>
              <TabsTrigger value="asset">สินทรัพย์</TabsTrigger>
              <TabsTrigger value="income">รายได้</TabsTrigger>
              <TabsTrigger value="expense">รายจ่าย</TabsTrigger>
            </TabsList>
            <TabsContent value="asset">
              <MonthYearGrid years={totalYears} getValue={getValueFor("asset")} />
            </TabsContent>
            <TabsContent value="income">
              <MonthYearGrid years={totalYears} getValue={getValueFor("income")} />
            </TabsContent>
            <TabsContent value="expense">
              <MonthYearGrid years={totalYears} getValue={getValueFor("expense")} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <InfoSection>
        <InfoBlock heading="เครื่องมือนี้คำนวณอย่างไร">
          <p>
            ช่วงก่อนเกษียณ: เงินออมจะเติบโตตามผลตอบแทนก่อนเกษียณ บวกด้วยเงินคงเหลือจากรายได้หักรายจ่ายในแต่ละเดือน
            รายได้จะเติบโตตามอัตราและความถี่ที่กำหนด (เช่น ต่อปี หรือ ต่อเดือน) ส่วนรายจ่ายจะเพิ่มขึ้นตามอัตราเงินเฟ้อทุกเดือน
          </p>
          <p>
            ช่วงหลังเกษียณ: ไม่มีรายได้เข้ามาอีก เงินออมจะถูกถอนออกมาใช้จ่ายตามค่าใช้จ่ายหลังเกษียณ (ที่เพิ่มขึ้นตามเงินเฟ้อ)
            ในขณะที่เงินที่เหลือยังคงได้รับผลตอบแทนตามอัตราหลังเกษียณต่อไป
          </p>
        </InfoBlock>
        <InfoBlock heading="ข้อควรระวัง">
          <p>
            เครื่องมือนี้ใช้อัตราผลตอบแทนและเงินเฟ้อคงที่ตลอดการจำลอง ซึ่งเป็นเพียงการประมาณการเบื้องต้น
            สถานการณ์จริงอาจผันผวนกว่านี้มาก ควรทบทวนแผนการเงินเป็นระยะและปรึกษาผู้เชี่ยวชาญประกอบการตัดสินใจ
          </p>
        </InfoBlock>
      </InfoSection>
    </div>
  )
}
