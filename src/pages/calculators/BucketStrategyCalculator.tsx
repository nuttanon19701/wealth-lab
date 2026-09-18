import { useMemo } from "react"
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import { BigStat } from "@/components/calculator/BigStat"
import { BucketMaintenanceDiagram, BucketWaterfallDiagram } from "@/components/calculator/BucketFlowDiagram"
import { FanChart } from "@/components/calculator/FanChart"
import { FieldGroup, NumberField } from "@/components/calculator/fields"
import { InfoBlock, InfoSection } from "@/components/calculator/InfoSection"
import { MonteCarloToggle } from "@/components/calculator/MonteCarloToggle"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { calculateBucketStrategy, type BucketInputs } from "@/calculators/bucket"
import { runBucketMonteCarlo } from "@/calculators/bucketMonteCarlo"
import { useCalculatorState } from "@/lib/calculatorStateStore"
import { formatBaht, formatBahtCompact, formatPercent } from "@/lib/format"

const defaultInputs: BucketInputs = {
  safe: { pv: 300000, returnPct: 1.5 },
  passive: { annualIncome: 60000, taxPct: 10 },
  lowRisk: { pv: 1500000, returnPct: 3 },
  highRisk: { pv: 2200000, returnPct: 7, redemptionToB2Pct: 15 },
  spending: { monthlySpending: 30000, inflationPct: 3, years: 30 },
}

const defaultLowRiskVolatilityPct = 6
const defaultHighRiskVolatilityPct = 18

const bucketColors = {
  safe: "var(--chart-2)",
  lowRisk: "var(--chart-3)",
  highRisk: "var(--chart-1)",
}

export function BucketStrategyCalculator() {
  const [inputs, setInputs] = useCalculatorState<BucketInputs>("bucket-inputs", defaultInputs)
  const [monteCarloEnabled, setMonteCarloEnabled] = useCalculatorState("bucket-mc-enabled", false)
  const [lowRiskVolatilityPct, setLowRiskVolatilityPct] = useCalculatorState(
    "bucket-mc-lowrisk-vol",
    defaultLowRiskVolatilityPct,
  )
  const [highRiskVolatilityPct, setHighRiskVolatilityPct] = useCalculatorState(
    "bucket-mc-highrisk-vol",
    defaultHighRiskVolatilityPct,
  )

  const result = useMemo(() => calculateBucketStrategy(inputs), [inputs])

  const mcResult = useMemo(() => {
    if (!monteCarloEnabled) return null
    return runBucketMonteCarlo({ ...inputs, lowRiskVolatilityPct, highRiskVolatilityPct })
  }, [monteCarloEnabled, inputs, lowRiskVolatilityPct, highRiskVolatilityPct])

  const chartData = useMemo(() => {
    const first = {
      year: 0,
      safe: inputs.safe.pv,
      lowRisk: inputs.lowRisk.pv,
      highRisk: inputs.highRisk.pv,
    }
    return [
      first,
      ...result.rows.map((r) => ({
        year: r.year,
        safe: Math.round(r.safe),
        lowRisk: Math.round(r.lowRisk),
        highRisk: Math.round(r.highRisk),
      })),
    ]
  }, [result.rows, inputs.safe.pv, inputs.lowRisk.pv, inputs.highRisk.pv])

  function update<K extends keyof BucketInputs>(key: K, value: BucketInputs[K]) {
    setInputs((prev) => ({ ...prev, [key]: value }))
  }

  const proportions = result.startingProportions

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">3 Bucket Strategies</h1>
        <p className="text-muted-foreground">
          จำลองการแบ่งเงินเกษียณเป็น 3 ถัง บวก Passive Income และดูว่าแต่ละถังจะเคลื่อนไหวอย่างไรตามกลไกการใช้จ่ายและรักษาสมดุล
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>ข้อมูลนำเข้า</CardTitle>
          <CardDescription>กำหนดมูลค่าตั้งต้นและสมมติฐานผลตอบแทนของแต่ละถัง</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <FieldGroup title="Safe / Steady (Bucket 1 — เงินสำรองใช้จ่าย)">
            <NumberField
              label="มูลค่าปัจจุบัน (Present Value)"
              value={inputs.safe.pv}
              onChange={(v) => update("safe", { ...inputs.safe, pv: Math.max(0, v) })}
              suffix="บาท"
              min={0}
            />
            <NumberField
              label="ผลตอบแทนต่อปี"
              value={inputs.safe.returnPct}
              onChange={(v) => update("safe", { ...inputs.safe, returnPct: v })}
              suffix="%"
            />
          </FieldGroup>

          <FieldGroup title="Passive Income — ค่าเช่า/บำนาญ">
            <NumberField
              label="รายได้ต่อปี"
              value={inputs.passive.annualIncome}
              onChange={(v) => update("passive", { ...inputs.passive, annualIncome: Math.max(0, v) })}
              suffix="บาท/ปี"
              min={0}
            />
            <NumberField
              label="ภาษีที่หักจากรายได้"
              value={inputs.passive.taxPct}
              onChange={(v) => update("passive", { ...inputs.passive, taxPct: v })}
              suffix="%"
            />
          </FieldGroup>

          <FieldGroup title="Low Risk (Bucket 2 — ตราสารหนี้)">
            <NumberField
              label="มูลค่าปัจจุบัน"
              value={inputs.lowRisk.pv}
              onChange={(v) => update("lowRisk", { ...inputs.lowRisk, pv: Math.max(0, v) })}
              suffix="บาท"
              min={0}
              hint="ค่านี้คือเป้าหมาย (เพดาน) ที่ระบบจะพยายามรักษาระดับให้ตรงทุกปี"
            />
            <NumberField
              label="ผลตอบแทนต่อปี"
              value={inputs.lowRisk.returnPct}
              onChange={(v) => update("lowRisk", { ...inputs.lowRisk, returnPct: v })}
              suffix="%"
            />
          </FieldGroup>

          <FieldGroup title="High Risk / Growth (Bucket 3 — หุ้น/ETF)" columns={3}>
            <NumberField
              label="มูลค่าปัจจุบัน"
              value={inputs.highRisk.pv}
              onChange={(v) => update("highRisk", { ...inputs.highRisk, pv: Math.max(0, v) })}
              suffix="บาท"
              min={0}
            />
            <NumberField
              label="ผลตอบแทนต่อปี"
              value={inputs.highRisk.returnPct}
              onChange={(v) => update("highRisk", { ...inputs.highRisk, returnPct: v })}
              suffix="%"
            />
            <NumberField
              label="เพดานการไถ่ถอนเข้า B2"
              value={inputs.highRisk.redemptionToB2Pct}
              onChange={(v) => update("highRisk", { ...inputs.highRisk, redemptionToB2Pct: Math.max(0, v) })}
              suffix="%/ปี"
              min={0}
              max={100}
              hint="จำกัดว่าปีหนึ่งโอนเข้า Low Risk ได้มากสุดกี่ % ของ High Risk"
            />
          </FieldGroup>

          <FieldGroup title="Spending & Horizon (ถอนออกจาก Bucket 1)" columns={3}>
            <NumberField
              label="รายจ่ายต่อเดือน"
              value={inputs.spending.monthlySpending}
              onChange={(v) => update("spending", { ...inputs.spending, monthlySpending: Math.max(0, v) })}
              suffix="บาท/เดือน"
              min={0}
            />
            <NumberField
              label="เงินเฟ้อ"
              value={inputs.spending.inflationPct}
              onChange={(v) => update("spending", { ...inputs.spending, inflationPct: v })}
              suffix="%/ปี"
            />
            <NumberField
              label="ระยะเวลาจำลอง"
              value={inputs.spending.years}
              onChange={(v) => update("spending", { ...inputs.spending, years: Math.max(0, Math.round(v)) })}
              suffix="ปี"
              min={0}
            />
          </FieldGroup>
        </CardContent>
      </Card>

      <MonteCarloToggle enabled={monteCarloEnabled} onToggle={setMonteCarloEnabled} />

      <Card>
        <CardHeader>
          <CardTitle>สรุปเงินตั้งต้น</CardTitle>
          <CardDescription>
            มูลค่ารวมของ Safe / Steady, Low Risk และ High Risk ณ วันเริ่มต้น (ไม่รวม Passive Income ซึ่งเป็นกระแสรายได้ ไม่ใช่เงินก้อน)
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <BigStat label="เงินตั้งต้นรวม" value={`${formatBaht(result.startingWealth)} บาท`} />
          <div className="flex h-3 w-full overflow-hidden rounded-full bg-muted">
            <div style={{ width: `${proportions.safe * 100}%`, background: bucketColors.safe }} />
            <div style={{ width: `${proportions.lowRisk * 100}%`, background: bucketColors.lowRisk }} />
            <div style={{ width: `${proportions.highRisk * 100}%`, background: bucketColors.highRisk }} />
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="flex items-center gap-2 text-sm">
              <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: bucketColors.safe }} />
              <span className="text-muted-foreground">Safe / Steady</span>
              <span className="ml-auto font-semibold text-foreground">{formatPercent(proportions.safe * 100)}%</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: bucketColors.lowRisk }} />
              <span className="text-muted-foreground">Low Risk</span>
              <span className="ml-auto font-semibold text-foreground">
                {formatPercent(proportions.lowRisk * 100)}%
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: bucketColors.highRisk }} />
              <span className="text-muted-foreground">High Risk / Growth</span>
              <span className="ml-auto font-semibold text-foreground">
                {formatPercent(proportions.highRisk * 100)}%
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <BigStat
          label="Low Risk หมดในปีที่"
          value={result.lowRiskDepletedYear ? `ปีที่ ${result.lowRiskDepletedYear}` : "ไม่หมด"}
          tone={result.lowRiskDepletedYear ? "destructive" : "success"}
        />
        <BigStat
          label="High Risk / Growth หมดในปีที่"
          value={result.highRiskDepletedYear ? `ปีที่ ${result.highRiskDepletedYear}` : "ไม่หมด"}
          tone={result.highRiskDepletedYear ? "destructive" : "success"}
        />
        <BigStat
          label="เงินไม่พอใช้จ่ายจริงในปีที่"
          value={result.insolventYear ? `ปีที่ ${result.insolventYear}` : "ไม่เกิดขึ้น"}
          sub={result.insolventYear ? "ทั้ง Low Risk และ High Risk หมดแล้ว ไม่เหลือเงินให้ดึงมาใช้จ่ายอีก" : undefined}
          tone={result.insolventYear ? "destructive" : "success"}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>การเคลื่อนไหวของแต่ละถัง</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 8, right: 16, left: 8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="year" tickFormatter={(v) => `ปี ${v}`} className="text-xs" stroke="var(--muted-foreground)" />
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
                <Area
                  type="monotone"
                  dataKey="safe"
                  name="Bucket 1 · Safe / Steady"
                  stackId="1"
                  stroke={bucketColors.safe}
                  fill={bucketColors.safe}
                  fillOpacity={0.6}
                />
                <Area
                  type="monotone"
                  dataKey="lowRisk"
                  name="Bucket 2 · Low Risk"
                  stackId="1"
                  stroke={bucketColors.lowRisk}
                  fill={bucketColors.lowRisk}
                  fillOpacity={0.6}
                />
                <Area
                  type="monotone"
                  dataKey="highRisk"
                  name="Bucket 3 · High Risk / Growth"
                  stackId="1"
                  stroke={bucketColors.highRisk}
                  fill={bucketColors.highRisk}
                  fillOpacity={0.6}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {monteCarloEnabled && mcResult && (
        <Card>
          <CardHeader>
            <CardTitle>ผลการจำลอง Monte Carlo</CardTitle>
            <CardDescription>
              สุ่มผลตอบแทนรายปีของ Low Risk และ High Risk 500 ครั้ง ตามค่าเฉลี่ยและความผันผวนที่กำหนด
              (Safe และ Passive Income ยังคงใช้ค่าคงที่ตามที่ตั้งไว้ด้านบน)
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            <FieldGroup>
              <NumberField
                label="ความผันผวนของ Low Risk (SD ต่อปี)"
                value={lowRiskVolatilityPct}
                onChange={setLowRiskVolatilityPct}
                suffix="%"
                min={0}
              />
              <NumberField
                label="ความผันผวนของ High Risk (SD ต่อปี)"
                value={highRiskVolatilityPct}
                onChange={setHighRiskVolatilityPct}
                suffix="%"
                min={0}
              />
            </FieldGroup>

            <BigStat
              label="เงินคงเหลือรวมมัธยฐาน (Median) เมื่อสิ้นสุดการจำลอง"
              value={`${formatBaht(mcResult.medianFinal)} บาท`}
              sub={`ช่วงที่เป็นไปได้ (10th–90th percentile): ${formatBaht(mcResult.p10Final)} – ${formatBaht(mcResult.p90Final)} บาท`}
            />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <BigStat
                label="โอกาสที่ Low Risk จะหมดภายในระยะเวลาจำลอง"
                value={`${formatPercent(mcResult.lowRiskDepletionProbability * 100)}%`}
                sub={
                  mcResult.medianLowRiskDepletedYear
                    ? `เมื่อหมด มักหมดราวปีที่ ${mcResult.medianLowRiskDepletedYear} (มัธยฐาน)`
                    : undefined
                }
                tone={mcResult.lowRiskDepletionProbability > 0.2 ? "destructive" : "success"}
              />
              <BigStat
                label="โอกาสที่ High Risk / Growth จะหมดภายในระยะเวลาจำลอง"
                value={`${formatPercent(mcResult.highRiskDepletionProbability * 100)}%`}
                sub={
                  mcResult.medianHighRiskDepletedYear
                    ? `เมื่อหมด มักหมดราวปีที่ ${mcResult.medianHighRiskDepletedYear} (มัธยฐาน)`
                    : undefined
                }
                tone={mcResult.highRiskDepletionProbability > 0.2 ? "destructive" : "success"}
              />
              <BigStat
                label="โอกาสที่เงินไม่พอใช้จ่ายจริง (Insolvency)"
                value={`${formatPercent(mcResult.insolvencyProbability * 100)}%`}
                sub={
                  mcResult.medianInsolventYear
                    ? `เมื่อเกิด มักเกิดราวปีที่ ${mcResult.medianInsolventYear} (มัธยฐาน)`
                    : undefined
                }
                tone={mcResult.insolvencyProbability > 0.05 ? "destructive" : "success"}
              />
            </div>

            <div className="h-80 w-full">
              <FanChart
                data={mcResult.yearly}
                xKey="year"
                p10Key="p10"
                p50Key="p50"
                p90Key="p90"
                p50Name="เงินคงเหลือรวม (มัธยฐาน)"
                xTickFormatter={(v) => `ปี ${v}`}
                yTickFormatter={(v) => formatBahtCompact(v)}
                tooltipFormatter={(v) => `${formatBaht(v)} บาท`}
              />
            </div>

            <p className="text-xs text-muted-foreground">
              พื้นที่แรเงาคือช่วงมูลค่าทรัพย์สินรวม (Safe + Low Risk + High Risk) ตั้งแต่ 10th ถึง 90th percentile
              จากการจำลอง 500 ครั้ง ซึ่งแต่ละครั้งใช้กลไกการใช้จ่ายและรักษาสมดุลแบบเดียวกับด้านบน
              เพียงแต่ผลตอบแทนรายปีของ Low Risk และ High Risk ถูกสุ่มขึ้นใหม่ทุกครั้ง
            </p>
          </CardContent>
        </Card>
      )}

      <InfoSection>
        <InfoBlock heading="แต่ละถังคืออะไร">
          <p>
            <span className="font-semibold text-foreground">Bucket 1 · Safe / Steady:</span> เงินสำรองใช้จ่าย
            เก็บในเงินฝาก กองทุนตลาดเงิน (MMF) หรือตราสารหนี้ระยะสั้น สภาพคล่องสูง ผันผวนต่ำ
            ใช้จ่ายประจำวันโดยตรงจากถังนี้เสมอ
          </p>
          <p>
            <span className="font-semibold text-foreground">Passive Income:</span> กระแสรายได้จากค่าเช่า เงินบำนาญ
            เงินปันผล หรือกอง REIT เงินที่ได้รับ (หลังหักภาษี) จะถูกนำเข้าไปสมทบ Bucket 1 ทุกปีโดยตรง
            ไม่ใช่เงินก้อนจึงไม่นับเป็นถัง
          </p>
          <p>
            <span className="font-semibold text-foreground">Bucket 2 · Low Risk:</span> ตราสารหนี้ ความเสี่ยงปานกลางค่อนข้างต่ำ
            ทำหน้าที่เป็นแหล่งเติมเงินสดหลักเมื่อ Bucket 1 ไม่พอ และเป็นตัวกลางที่ High Risk ใช้เติมเงินให้
            มูลค่าตั้งต้นของถังนี้จะกลายเป็น &ldquo;เป้าหมาย&rdquo; ที่ระบบพยายามรักษาไว้ตลอดการจำลอง
          </p>
          <p>
            <span className="font-semibold text-foreground">Bucket 3 · High Risk / Growth:</span> หุ้น ETF
            หรือกองทุนธีมการลงทุน ผลตอบแทนคาดหวังสูงสุดในระยะยาว เป็นเครื่องยนต์หลักในการเติบโตของพอร์ต
            และเป็นแหล่งสุดท้ายที่จะถูกดึงมาใช้เมื่อถังอื่นไม่พอ
          </p>
        </InfoBlock>

        <InfoBlock heading="ลำดับการคำนวณในแต่ละปี">
          <p>
            ทุกปีระบบจะทำ 3 ขั้นตอนตามลำดับนี้เสมอ ไม่มีการสลับลำดับตามสภาวะตลาดอีกต่อไป:
          </p>
          <BucketWaterfallDiagram />
          <p>
            <span className="font-semibold text-foreground">ขั้นที่ 1 — ใช้จ่าย:</span> นำ Passive Income
            (หลังหักภาษี) มาบวกและหักรายจ่ายของปีนั้นออกจาก Bucket 1 ก่อนเสมอ
          </p>
          <BucketMaintenanceDiagram />
          <p>
            <span className="font-semibold text-foreground">ขั้นที่ 2 — รักษาระดับ Low Risk:</span> เปรียบเทียบ Low Risk
            กับมูลค่าตั้งต้นของมัน (เป้าหมาย) หากสูงกว่าเป้าหมาย ส่วนเกินทั้งหมดจะโอนไปที่ Bucket 1 ทันที
            (ซึ่งอาจช่วยชดเชยการใช้จ่ายในขั้นที่ 1 ได้โดยไม่ต้องรอถึงขั้นที่ 3) หากต่ำกว่าเป้าหมาย High Risk / Growth
            จะโอนมาเติมให้ แต่ไม่เกิน &ldquo;เพดานการไถ่ถอนเข้า B2 (%/ปี)&rdquo; ที่กำหนดไว้ และไม่เติมเกินเป้าหมาย
          </p>
          <p>
            <span className="font-semibold text-foreground">ขั้นที่ 3 — ถ้ายังไม่พอ (Survival Waterfall):</span>{" "}
            หากหลังขั้นที่ 1-2 แล้ว Bucket 1 ยังติดลบ (เงินไม่พอใช้จ่ายจริงในปีนั้น) ระบบจะดึงเงินจาก Low Risk
            มาเติมก่อน เท่าที่จำเป็น โดย<span className="font-semibold text-foreground">ไม่มีเพดานจำกัด</span> —
            ถ้ายังไม่พออีก จึงดึงจาก High Risk / Growth เพิ่มเติมจนกว่าจะพอ เพราะการมีเงินพอใช้จ่ายในแต่ละปี
            สำคัญกว่าการรักษาสัดส่วนหรือเป้าหมายใด ๆ จะถือว่า &ldquo;เงินไม่พอใช้จ่ายจริง&rdquo; ก็ต่อเมื่อทั้ง Low Risk
            และ High Risk หมดแล้วเท่านั้น
          </p>
        </InfoBlock>

        <InfoBlock heading="ข้อควรระวัง">
          <p>
            โหมดปกติ (ด้านบน) จำลองด้วยอัตราผลตอบแทนคงที่ต่อปีตามที่คุณกำหนด เหมาะสำหรับดูกลไกการใช้จ่ายและรักษาสมดุลแบบชัดเจน
            ส่วนโหมด Monte Carlo จะช่วยให้เห็นความเสี่ยงจากความผันผวนของตลาดในแต่ละปี (Sequence of Returns Risk)
            ได้สมจริงมากขึ้น ทั้งสองโหมดเป็นเพียงภาพประกอบแนวคิดกลยุทธ์ 3 ถัง ไม่ใช่คำแนะนำการลงทุน
            ผลตอบแทนจริงของสินทรัพย์แต่ละประเภทมีความผันผวนและไม่สามารถรับประกันได้
          </p>
        </InfoBlock>
      </InfoSection>
    </div>
  )
}
