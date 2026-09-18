import { useMemo, useState } from "react"
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
import { BucketFlowDiagram, BucketSurplusDiagram } from "@/components/calculator/BucketFlowDiagram"
import { FanChart } from "@/components/calculator/FanChart"
import { FieldGroup, NumberField } from "@/components/calculator/fields"
import { InfoBlock, InfoSection } from "@/components/calculator/InfoSection"
import { MonteCarloToggle } from "@/components/calculator/MonteCarloToggle"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BUCKET_POLICY_DEFAULTS, calculateBucketStrategy, type BucketInputs } from "@/calculators/bucket"
import { runBucketMonteCarlo } from "@/calculators/bucketMonteCarlo"
import { formatBaht, formatBahtCompact, formatPercent } from "@/lib/format"

const defaultInputs: BucketInputs = {
  safe: { pv: 300000, returnPct: 1.5 },
  passive: { annualIncome: 60000, taxPct: 10 },
  bond: { pv: 1500000, returnPct: 3, redemptionToB1Pct: 20 },
  growth: { pv: 2200000, returnPct: 7, redemptionToB1Pct: 15 },
  spending: { monthlySpending: 30000, inflationPct: 3, years: 30 },
}

const defaultBondVolatilityPct = 6
const defaultGrowthVolatilityPct = 18

const bucketColors = {
  cash: "var(--chart-2)",
  bond: "var(--chart-3)",
  growth: "var(--chart-1)",
}

export function BucketStrategyCalculator() {
  const [inputs, setInputs] = useState<BucketInputs>(defaultInputs)
  const [monteCarloEnabled, setMonteCarloEnabled] = useState(false)
  const [bondVolatilityPct, setBondVolatilityPct] = useState(defaultBondVolatilityPct)
  const [growthVolatilityPct, setGrowthVolatilityPct] = useState(defaultGrowthVolatilityPct)

  const result = useMemo(() => calculateBucketStrategy(inputs), [inputs])

  const mcResult = useMemo(() => {
    if (!monteCarloEnabled) return null
    return runBucketMonteCarlo({ ...inputs, bondVolatilityPct, growthVolatilityPct })
  }, [monteCarloEnabled, inputs, bondVolatilityPct, growthVolatilityPct])

  const chartData = useMemo(() => {
    const first = {
      year: 0,
      cash: inputs.safe.pv,
      bond: inputs.bond.pv,
      growth: inputs.growth.pv,
    }
    return [
      first,
      ...result.rows.map((r) => ({
        year: r.year,
        cash: Math.round(r.cash),
        bond: Math.round(r.bond),
        growth: Math.round(r.growth),
      })),
    ]
  }, [result.rows, inputs.safe.pv, inputs.bond.pv, inputs.growth.pv])

  function update<K extends keyof BucketInputs>(key: K, value: BucketInputs[K]) {
    setInputs((prev) => ({ ...prev, [key]: value }))
  }

  const proportions = result.startingProportions

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
          Retirement Bucket Strategy — 4 Bucket Simulator
        </h1>
        <p className="text-muted-foreground">
          จำลองการแบ่งเงินเกษียณเป็น 4 ถัง และดูว่าแต่ละถังจะเคลื่อนไหวอย่างไรตามกลไกการเติมเงินแบบมีกฎเกณฑ์
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>ข้อมูลนำเข้า</CardTitle>
          <CardDescription>กำหนดมูลค่าตั้งต้นและสมมติฐานผลตอบแทนของแต่ละถัง</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <FieldGroup title="a. Safe / Steady (Bucket 1 — เงินสำรองใช้จ่าย)">
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

          <FieldGroup title="b. Passive Income (Bucket 2 — เงินปันผล/บำนาญ)">
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

          <FieldGroup title="c. Low Risk (Bucket 3 — ตราสารหนี้)" columns={3}>
            <NumberField
              label="มูลค่าปัจจุบัน"
              value={inputs.bond.pv}
              onChange={(v) => update("bond", { ...inputs.bond, pv: Math.max(0, v) })}
              suffix="บาท"
              min={0}
            />
            <NumberField
              label="ผลตอบแทนต่อปี"
              value={inputs.bond.returnPct}
              onChange={(v) => update("bond", { ...inputs.bond, returnPct: v })}
              suffix="%"
            />
            <NumberField
              label="เพดานการไถ่ถอนเข้า B1"
              value={inputs.bond.redemptionToB1Pct}
              onChange={(v) => update("bond", { ...inputs.bond, redemptionToB1Pct: Math.max(0, v) })}
              suffix="%/ปี"
              min={0}
              max={100}
            />
          </FieldGroup>

          <FieldGroup title="d. High Risk / Growth (Bucket 4 — หุ้น/ETF)" columns={3}>
            <NumberField
              label="มูลค่าปัจจุบัน"
              value={inputs.growth.pv}
              onChange={(v) => update("growth", { ...inputs.growth, pv: Math.max(0, v) })}
              suffix="บาท"
              min={0}
            />
            <NumberField
              label="ผลตอบแทนต่อปี"
              value={inputs.growth.returnPct}
              onChange={(v) => update("growth", { ...inputs.growth, returnPct: v })}
              suffix="%"
            />
            <NumberField
              label="เพดานการไถ่ถอนเข้า B1"
              value={inputs.growth.redemptionToB1Pct}
              onChange={(v) => update("growth", { ...inputs.growth, redemptionToB1Pct: Math.max(0, v) })}
              suffix="%/ปี"
              min={0}
              max={100}
            />
          </FieldGroup>

          <FieldGroup title="e. Spending & Horizon (ถอนออกจาก Bucket 1)" columns={3}>
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
          <CardDescription>มูลค่ารวมของ Bucket 1, 3 และ 4 ณ วันเริ่มต้น (ไม่รวม Bucket 2 ซึ่งเป็นกระแสรายได้)</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <BigStat label="เงินตั้งต้นรวม" value={`${formatBaht(result.startingWealth)} บาท`} />
          <div className="flex h-3 w-full overflow-hidden rounded-full bg-muted">
            <div style={{ width: `${proportions.safe * 100}%`, background: bucketColors.cash }} />
            <div style={{ width: `${proportions.bond * 100}%`, background: bucketColors.bond }} />
            <div style={{ width: `${proportions.growth * 100}%`, background: bucketColors.growth }} />
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="flex items-center gap-2 text-sm">
              <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: bucketColors.cash }} />
              <span className="text-muted-foreground">Safe / Steady</span>
              <span className="ml-auto font-semibold text-foreground">{formatPercent(proportions.safe * 100)}%</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: bucketColors.bond }} />
              <span className="text-muted-foreground">Low Risk (Bond)</span>
              <span className="ml-auto font-semibold text-foreground">{formatPercent(proportions.bond * 100)}%</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: bucketColors.growth }} />
              <span className="text-muted-foreground">High Risk / Growth</span>
              <span className="ml-auto font-semibold text-foreground">
                {formatPercent(proportions.growth * 100)}%
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <BigStat
          label="Bucket 3 (Bond) หมดในปีที่"
          value={result.bondDepletedYear ? `ปีที่ ${result.bondDepletedYear}` : "ไม่หมด"}
          tone={result.bondDepletedYear ? "destructive" : "success"}
        />
        <BigStat
          label="Bucket 4 (Growth) หมดในปีที่"
          value={result.growthDepletedYear ? `ปีที่ ${result.growthDepletedYear}` : "ไม่หมด"}
          tone={result.growthDepletedYear ? "destructive" : "success"}
        />
        <BigStat
          label="เงินไม่พอใช้จ่ายจริงในปีที่"
          value={result.insolventYear ? `ปีที่ ${result.insolventYear}` : "ไม่เกิดขึ้น"}
          sub={result.insolventYear ? "ทั้ง Bond และ Growth หมดแล้ว ไม่เหลือเงินให้ดึงมาใช้จ่ายอีก" : undefined}
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
                  dataKey="cash"
                  name="Bucket 1 · Cash"
                  stackId="1"
                  stroke={bucketColors.cash}
                  fill={bucketColors.cash}
                  fillOpacity={0.6}
                />
                <Area
                  type="monotone"
                  dataKey="bond"
                  name="Bucket 3 · Bond"
                  stackId="1"
                  stroke={bucketColors.bond}
                  fill={bucketColors.bond}
                  fillOpacity={0.6}
                />
                <Area
                  type="monotone"
                  dataKey="growth"
                  name="Bucket 4 · Growth"
                  stackId="1"
                  stroke={bucketColors.growth}
                  fill={bucketColors.growth}
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
              สุ่มผลตอบแทนรายปีของ Bond และ Growth 500 ครั้ง ตามค่าเฉลี่ยและความผันผวนที่กำหนด
              (Safe และ Passive Income ยังคงใช้ค่าคงที่ตามที่ตั้งไว้ด้านบน)
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            <FieldGroup>
              <NumberField
                label="ความผันผวนของ Bond (SD ต่อปี)"
                value={bondVolatilityPct}
                onChange={setBondVolatilityPct}
                suffix="%"
                min={0}
              />
              <NumberField
                label="ความผันผวนของ Growth (SD ต่อปี)"
                value={growthVolatilityPct}
                onChange={setGrowthVolatilityPct}
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
                label="โอกาสที่ Bucket 3 (Bond) จะหมดภายในระยะเวลาจำลอง"
                value={`${formatPercent(mcResult.bondDepletionProbability * 100)}%`}
                sub={
                  mcResult.medianBondDepletedYear
                    ? `เมื่อหมด มักหมดราวปีที่ ${mcResult.medianBondDepletedYear} (มัธยฐาน)`
                    : undefined
                }
                tone={mcResult.bondDepletionProbability > 0.2 ? "destructive" : "success"}
              />
              <BigStat
                label="โอกาสที่ Bucket 4 (Growth) จะหมดภายในระยะเวลาจำลอง"
                value={`${formatPercent(mcResult.growthDepletionProbability * 100)}%`}
                sub={
                  mcResult.medianGrowthDepletedYear
                    ? `เมื่อหมด มักหมดราวปีที่ ${mcResult.medianGrowthDepletedYear} (มัธยฐาน)`
                    : undefined
                }
                tone={mcResult.growthDepletionProbability > 0.2 ? "destructive" : "success"}
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
              พื้นที่แรเงาคือช่วงมูลค่าทรัพย์สินรวม (Cash + Bond + Growth) ตั้งแต่ 10th ถึง 90th percentile
              จากการจำลอง 500 ครั้ง ซึ่งแต่ละครั้งใช้กลไกการเติมเงินและ Market Regime แบบเดียวกับด้านบน
              เพียงแต่ผลตอบแทนรายปีของ Bond และ Growth ถูกสุ่มขึ้นใหม่ทุกครั้ง
            </p>
          </CardContent>
        </Card>
      )}

      <InfoSection>
        <InfoBlock heading="แต่ละถังคืออะไร">
          <p>
            <span className="font-semibold text-foreground">Bucket 1 · Safe / Steady:</span> เงินสำรองใช้จ่าย
            เก็บในเงินฝาก กองทุนตลาดเงิน (MMF) หรือตราสารหนี้ระยะสั้น สภาพคล่องสูง ผันผวนต่ำ
            ใช้จ่ายประจำวันโดยตรงจากถังนี้
          </p>
          <p>
            <span className="font-semibold text-foreground">Bucket 2 · Passive Income:</span>{" "}
            กระแสรายได้จากเงินปันผล กอง REIT หรือกองทุนเน้นจ่ายรายได้ เงินที่ได้รับ (หลังหักภาษี)
            จะถูกนำเข้าไปสมทบในถังเงินสดทุกปีโดยตรง
          </p>
          <p>
            <span className="font-semibold text-foreground">Bucket 3 · Low Risk (Bond):</span>{" "}
            ตราสารหนี้ ความเสี่ยงปานกลางค่อนข้างต่ำ ทำหน้าที่เป็นแหล่งเติมเงินสดในช่วงตลาดผันผวน
            เพื่อไม่ต้องขายหุ้นตอนราคาตก
          </p>
          <p>
            <span className="font-semibold text-foreground">Bucket 4 · High Risk / Growth:</span>{" "}
            หุ้น ETF หรือกองทุนธีมการลงทุน ผลตอบแทนคาดหวังสูงสุดในระยะยาว
            เป็นเครื่องยนต์หลักในการเติบโตของพอร์ตและเป็นแหล่งเติมเงินสดหลักในช่วงตลาดปกติ
          </p>
        </InfoBlock>

        <InfoBlock heading="กลไกการเติมเงิน (Refill Mechanism) และ Market Regime">
          <p>
            ทุกสิ้นปี ระบบจะตรวจสอบว่าถังเงินสด (Bucket 1) มีเพียงพอต่อรายจ่ายที่ตั้งเป้าไว้หรือไม่
            (ค่าเริ่มต้น: สำรอง {BUCKET_POLICY_DEFAULTS.reserveYears} ปีของรายจ่ายสุทธิ)
            หากไม่พอ ระบบจะเติมเงินจากถังอื่นตามกฎที่กำหนดไว้ล่วงหน้า แทนการตัดสินใจเฉพาะหน้า
          </p>
          <p>
            การเลือกว่าจะดึงเงินจากถังไหนก่อนขึ้นอยู่กับ &ldquo;สภาวะตลาด&rdquo; (Market Regime) ซึ่งประเมินจาก
            การลดลงของมูลค่า Bucket 4 เทียบกับจุดสูงสุดที่เคยทำได้ (Drawdown) — หากลดลงเกิน{" "}
            {formatPercent(BUCKET_POLICY_DEFAULTS.drawdownBadThreshold * 100)}% ถือว่าเป็นช่วง{" "}
            <span className="font-semibold text-foreground">&ldquo;Bad Phase&rdquo;</span> นอกนั้นถือเป็น{" "}
            <span className="font-semibold text-foreground">&ldquo;Good Phase&rdquo;</span>
          </p>
          <BucketFlowDiagram />
          <BucketSurplusDiagram />
          <p>
            ทุกการดึงเงินจากถัง Bond หรือ Growth เข้าสู่ Bucket 1 จะถูกจำกัดด้วย &ldquo;เพดานการไถ่ถอนเข้า B1
            (%/ปี)&rdquo; ที่กำหนดไว้ เพื่อไม่ให้ดึงเงินออกจากถังใดถังหนึ่งมากเกินไปในปีเดียว
            และเปิดโอกาสให้ถัง Growth มีเวลาฟื้นตัวหลังช่วงตลาดตก
          </p>
          <p>
            <span className="font-semibold text-foreground">ข้อยกเว้นเพื่อความอยู่รอด:</span> เพดานนี้ใช้เฉพาะการเติมเงินเข้าสู่
            &ldquo;เงินสำรอง 1 ปี&rdquo; ตามปกติเท่านั้น หากถึงขั้นที่เงินสดไม่พอสำหรับรายจ่ายจริงในปีนั้น (ไม่ใช่แค่ต่ำกว่าเป้าเงินสำรอง)
            ระบบจะดึงเงินเพิ่มจากถัง Bond/Growth ตามลำดับความสำคัญเดิม โดยไม่ยึดติดกับเพดานอีกต่อไป
            เพราะการมีเงินพอใช้จ่ายในแต่ละปีสำคัญกว่าการรักษาเพดานการถอน จะถือว่า &ldquo;เงินไม่พอใช้จ่ายจริง&rdquo;
            ก็ต่อเมื่อทั้ง Bond และ Growth หมดแล้วเท่านั้น
          </p>
        </InfoBlock>

        <InfoBlock heading="ข้อควรระวัง">
          <p>
            โหมดปกติ (ด้านบน) จำลองด้วยอัตราผลตอบแทนคงที่ต่อปีตามที่คุณกำหนด เหมาะสำหรับดูกลไกการเติมเงินแบบชัดเจน
            ส่วนโหมด Monte Carlo จะช่วยให้เห็นความเสี่ยงจากความผันผวนของตลาดในแต่ละปี (Sequence of Returns Risk)
            ได้สมจริงมากขึ้น ทั้งสองโหมดเป็นเพียงภาพประกอบแนวคิดกลยุทธ์ 4 ถัง ไม่ใช่คำแนะนำการลงทุน
            ผลตอบแทนจริงของสินทรัพย์แต่ละประเภทมีความผันผวนและไม่สามารถรับประกันได้
          </p>
        </InfoBlock>
      </InfoSection>
    </div>
  )
}
