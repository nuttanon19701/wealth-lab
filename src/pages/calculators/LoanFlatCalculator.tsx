import { useMemo } from "react"

import { AmortizationTable } from "@/components/calculator/AmortizationTable"
import { BigStat } from "@/components/calculator/BigStat"
import { FieldGroup, NumberField, ReadonlyField } from "@/components/calculator/fields"
import { InfoBlock, InfoSection } from "@/components/calculator/InfoSection"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { calculateFlatLoan, type FlatLoanInputs } from "@/calculators/loanFlat"
import { useCalculatorState } from "@/lib/calculatorStateStore"
import { formatBaht } from "@/lib/format"

const defaultInputs: FlatLoanInputs = {
  principal: 500000,
  annualRatePct: 4,
  termMonths: 60,
}

export function LoanFlatCalculator() {
  const [inputs, setInputs] = useCalculatorState<FlatLoanInputs>("loan-flat-inputs", defaultInputs)

  const result = useMemo(() => calculateFlatLoan(inputs), [inputs])

  function update<K extends keyof FlatLoanInputs>(key: K, value: FlatLoanInputs[K]) {
    setInputs((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
          คำนวณสินเชื่อ ดอกเบี้ยคงที่
        </h1>
        <p className="text-muted-foreground">คำนวณค่างวดและดอกเบี้ยรวมของสินเชื่อแบบดอกเบี้ยคงที่ (Flat Rate)</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>เงื่อนไขการกู้ยืม</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <FieldGroup columns={3}>
            <NumberField
              label="เงินต้น"
              value={inputs.principal}
              onChange={(v) => update("principal", Math.max(0, v))}
              suffix="บาท"
              min={0}
            />
            <NumberField
              label="ดอกเบี้ย/ปี"
              value={inputs.annualRatePct}
              onChange={(v) => update("annualRatePct", Math.max(0, v))}
              suffix="%"
              min={0}
            />
            <NumberField
              label="งวดชำระ"
              value={inputs.termMonths}
              onChange={(v) => update("termMonths", Math.max(0, Math.round(v)))}
              suffix="เดือน"
              min={0}
            />
          </FieldGroup>

          <FieldGroup title="ภาระการชำระ" columns={1}>
            <ReadonlyField label="ขั้นต่ำ/เดือน" value={`${formatBaht(result.monthlyPayment)} บาท`} />
          </FieldGroup>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>สรุปภาระกู้ยืม</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <BigStat label="ดอกเบี้ยรวม" value={`${formatBaht(result.totalInterest)} บาท`} />
          <BigStat label="ยอดชำระรวม" value={`${formatBaht(result.totalPayment)} บาท`} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>ตารางการผ่อนชำระ (Amortization Table)</CardTitle>
        </CardHeader>
        <CardContent>
          <AmortizationTable rows={result.rows} />
        </CardContent>
      </Card>

      <InfoSection>
        <InfoBlock heading="ดอกเบี้ยคงที่คืออะไร">
          <p>
            ดอกเบี้ยคงที่ (Flat Rate) คือวิธีคิดดอกเบี้ยจากเงินต้นเริ่มต้นตลอดสัญญา โดยไม่ลดลงตามเงินต้นคงเหลือ
            ดอกเบี้ยรวมทั้งสัญญาจะถูกคำนวณไว้ล่วงหน้าและหารเฉลี่ยเท่ากันทุกงวด ทำให้ค่างวดคงที่ตลอดอายุสัญญา
            มักใช้กับสินเชื่อเช่าซื้อรถยนต์หรือสินเชื่อส่วนบุคคลบางประเภท
          </p>
        </InfoBlock>
        <InfoBlock heading="ต่างจากดอกเบี้ยลดต้นลดดอกอย่างไร">
          <p>
            เมื่อเทียบอัตราดอกเบี้ยตัวเลขเท่ากัน สินเชื่อดอกเบี้ยคงที่จะมีภาระดอกเบี้ยรวมสูงกว่าดอกเบี้ยลดต้นลดดอกเสมอ
            เพราะไม่ได้คิดดอกเบี้ยจากยอดคงเหลือที่ลดลงในแต่ละงวด ควรเปรียบเทียบอัตราดอกเบี้ยที่แท้จริง (Effective Rate)
            ก่อนตัดสินใจเลือกสินเชื่อ
          </p>
        </InfoBlock>
        <InfoBlock heading="ข้อควรระวัง">
          <p>
            ตัวเลขนี้เป็นการประมาณการเบื้องต้น สินเชื่อจริงอาจมีค่าธรรมเนียมหรือเงื่อนไขเพิ่มเติม ควรตรวจสอบกับสถาบันการเงินอีกครั้ง
          </p>
        </InfoBlock>
      </InfoSection>
    </div>
  )
}
