import { useState } from "react"

import { FormattedNumberInput } from "@/components/calculator/FormattedNumberInput"
import { InfoBlock, InfoSection } from "@/components/calculator/InfoSection"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  solveTvm,
  type CompoundingFrequency,
  type RateMode,
  type TimingMode,
  type TvmField,
  type TvmSettings,
  type TvmValues,
} from "@/calculators/tvm"
import { useCalculatorState } from "@/lib/calculatorStateStore"
import { cn } from "@/lib/utils"

const defaultValues: TvmValues = {
  pv: -100000,
  pmt: 5000,
  fv: 0,
  ratePct: 6,
  periods: 24,
}

const defaultSettings: TvmSettings = {
  rateMode: "nominal",
  timingMode: "end",
  compounding: "monthly",
}

const compoundingOptions: { value: CompoundingFrequency; label: string }[] = [
  { value: "annually", label: "Annually" },
  { value: "semiannually", label: "Semiannually" },
  { value: "quarterly", label: "Quarterly" },
  { value: "monthly", label: "Monthly" },
  { value: "semimonthly", label: "Semimonthly" },
  { value: "biweekly", label: "Bi-Weekly" },
  { value: "weekly", label: "Weekly" },
  { value: "daily", label: "Daily" },
]

function SegmentedToggle<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[]
  value: T
  onChange: (value: T) => void
}) {
  return (
    <div className="inline-flex rounded-md border border-input bg-background p-0.5">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={cn(
            "rounded px-3 py-1.5 text-sm font-medium transition-colors",
            value === o.value ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

interface TvmRowProps {
  label: string
  hint: string
  value: number
  onChange: (v: number) => void
  onSolve: () => void
  solved: boolean
  suffix?: string
}

function TvmRow({ label, hint, value, onChange, onSolve, solved, suffix }: TvmRowProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-2 rounded-lg border p-3 sm:flex-row sm:items-center sm:gap-4",
        solved ? "border-primary/40 bg-primary/5" : "border-border",
      )}
    >
      <div className="flex min-w-32 flex-col">
        <span className="text-sm font-semibold text-foreground">{label}</span>
        <span className="text-xs text-muted-foreground">{hint}</span>
      </div>
      <div className="relative flex-1">
        <FormattedNumberInput value={value} onChange={onChange} className={suffix ? "pr-10" : undefined} />
        {suffix && (
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
            {suffix}
          </span>
        )}
      </div>
      <Button variant={solved ? "default" : "outline"} size="sm" onClick={onSolve} className="shrink-0">
        คำนวณ
      </Button>
    </div>
  )
}

export function TvmCalculator() {
  const [values, setValues] = useCalculatorState<TvmValues>("tvm-values", defaultValues)
  const [settings, setSettings] = useCalculatorState<TvmSettings>("tvm-settings", defaultSettings)
  const [solvedField, setSolvedField] = useState<TvmField | null>(null)
  const [error, setError] = useState<string | null>(null)

  function update<K extends keyof TvmValues>(key: K, value: TvmValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }))
    setSolvedField(null)
    setError(null)
  }

  function handleSolve(field: TvmField) {
    const result = solveTvm(field, values, settings)
    if (!Number.isFinite(result)) {
      setError("ไม่พบคำตอบจากค่าที่กรอก ลองปรับค่าตัวเลขอื่นก่อนคำนวณใหม่")
      setSolvedField(null)
      return
    }
    setError(null)
    const rounded = Math.round(result * 100) / 100
    setValues((prev) => ({
      ...prev,
      [field === "rate" ? "ratePct" : field === "period" ? "periods" : field]: rounded,
    }))
    setSolvedField(field)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">TVM Calculator</h1>
        <p className="text-muted-foreground">
          คำนวณมูลค่าเงินตามเวลา (Time Value of Money) — กรอก 4 จาก 5 ช่อง แล้วกด &ldquo;คำนวณ&rdquo; ที่ช่องที่เหลือ
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>การตั้งค่า (Settings)</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label>Annual Rate</Label>
              <SegmentedToggle
                options={[
                  { value: "nominal", label: "Nominal" },
                  { value: "effective", label: "Effective" },
                ]}
                value={settings.rateMode}
                onChange={(v: RateMode) => {
                  setSettings((s) => ({ ...s, rateMode: v }))
                  setSolvedField(null)
                }}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Mode</Label>
              <SegmentedToggle
                options={[
                  { value: "end", label: "End" },
                  { value: "begin", label: "Beginning" },
                ]}
                value={settings.timingMode}
                onChange={(v: TimingMode) => {
                  setSettings((s) => ({ ...s, timingMode: v }))
                  setSolvedField(null)
                }}
              />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Compounding</Label>
            <Select
              value={settings.compounding}
              onValueChange={(v) => {
                setSettings((s) => ({ ...s, compounding: v as CompoundingFrequency }))
                setSolvedField(null)
              }}
            >
              <SelectTrigger className="w-full sm:w-60">
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
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>ตัวแปร (Fields)</CardTitle>
          <CardDescription>สัญลักษณ์: เงินจ่ายออกเป็นค่าลบ เงินรับเข้าเป็นค่าบวก</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <TvmRow
            label="Present Value (PV)"
            hint="มูลค่าปัจจุบัน"
            value={values.pv}
            onChange={(v) => update("pv", v)}
            onSolve={() => handleSolve("pv")}
            solved={solvedField === "pv"}
            suffix="บาท"
          />
          <TvmRow
            label="Payments (PMT)"
            hint="เงินจ่าย/รับต่องวด"
            value={values.pmt}
            onChange={(v) => update("pmt", v)}
            onSolve={() => handleSolve("pmt")}
            solved={solvedField === "pmt"}
            suffix="บาท"
          />
          <TvmRow
            label="Future Value (FV)"
            hint="มูลค่าในอนาคต"
            value={values.fv}
            onChange={(v) => update("fv", v)}
            onSolve={() => handleSolve("fv")}
            solved={solvedField === "fv"}
            suffix="บาท"
          />
          <TvmRow
            label="Annual Rate (Rate)"
            hint="อัตราดอกเบี้ยต่อปี"
            value={values.ratePct}
            onChange={(v) => update("ratePct", v)}
            onSolve={() => handleSolve("rate")}
            solved={solvedField === "rate"}
            suffix="%"
          />
          <TvmRow
            label="Periods (Period)"
            hint="จำนวนงวดทั้งหมด"
            value={values.periods}
            onChange={(v) => update("periods", v)}
            onSolve={() => handleSolve("period")}
            solved={solvedField === "period"}
          />

          {error && <p className="text-sm text-destructive">{error}</p>}
        </CardContent>
      </Card>

      <InfoSection>
        <InfoBlock heading="TVM คืออะไร">
          <p>
            Time Value of Money (TVM) คือหลักการที่ว่าเงินจำนวนเท่ากันในวันนี้มีมูลค่ามากกว่าในอนาคต เพราะสามารถนำไปลงทุนหาผลตอบแทนได้
            เครื่องมือนี้เป็นเครื่องคิดเลขการเงิน (Financial Calculator) แบบเดียวกับ TI BA II Plus หรือ HP 12C
            ใช้คำนวณความสัมพันธ์ระหว่าง 5 ตัวแปรหลัก: PV, PMT, FV, อัตราดอกเบี้ย และจำนวนงวด
          </p>
        </InfoBlock>
        <InfoBlock heading="วิธีใช้งาน">
          <p>
            กรอกค่าให้ครบ 4 จาก 5 ช่อง แล้วกดปุ่ม &ldquo;คำนวณ&rdquo; ที่ช่องตัวแปรที่เหลือ ระบบจะคำนวณค่าที่ขาดไปให้อัตโนมัติ
            ควรระวังเครื่องหมายบวก/ลบ — โดยทั่วไปเงินที่จ่ายออกจากกระเป๋า (เช่น เงินฝาก) ให้ใส่เป็นค่าลบ
            ส่วนเงินที่ได้รับเข้ามา (เช่น เงินถอน) ให้ใส่เป็นค่าบวก
          </p>
        </InfoBlock>
        <InfoBlock heading="Nominal vs Effective, End vs Beginning">
          <p>
            <span className="font-semibold text-foreground">Nominal Rate</span> คืออัตราดอกเบี้ยต่อปีที่ยังไม่ได้คิดผลของการทบต้นภายในปี
            ส่วน <span className="font-semibold text-foreground">Effective Rate</span> คืออัตราดอกเบี้ยต่อปีที่แท้จริงหลังคิดผลทบต้นแล้ว
          </p>
          <p>
            <span className="font-semibold text-foreground">End Mode</span> หมายถึงเงินงวด (PMT)
            จ่ายเมื่อสิ้นงวด (ปกติของเงินกู้ทั่วไป) ส่วน{" "}
            <span className="font-semibold text-foreground">Beginning Mode</span> หมายถึงจ่ายเมื่อต้นงวด
            (เช่น ค่าเช่าหรือประกันบางประเภท)
          </p>
        </InfoBlock>
      </InfoSection>
    </div>
  )
}
