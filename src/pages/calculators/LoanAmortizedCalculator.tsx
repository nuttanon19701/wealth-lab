import { useMemo } from "react"

import { AmortizationTable } from "@/components/calculator/AmortizationTable"
import { BigStat } from "@/components/calculator/BigStat"
import { FieldGroup, NumberField, ReadonlyField } from "@/components/calculator/fields"
import { InfoBlock, InfoSection } from "@/components/calculator/InfoSection"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { calculateAmortizedLoan, type AmortizedLoanInputs } from "@/calculators/loanAmortized"
import { useCalculatorState } from "@/lib/calculatorStateStore"
import { formatBaht } from "@/lib/format"

const defaultInputs: AmortizedLoanInputs = {
  principal: 3000000,
  annualRatePct: 6.5,
  termMonths: 240,
  extraPayment: 0,
}

export function LoanAmortizedCalculator() {
  const [inputs, setInputs] = useCalculatorState<AmortizedLoanInputs>("loan-amortized-inputs", defaultInputs)

  const result = useMemo(() => calculateAmortizedLoan(inputs), [inputs])

  function update<K extends keyof AmortizedLoanInputs>(key: K, value: AmortizedLoanInputs[K]) {
    setInputs((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
          คำนวณสินเชื่อ ดอกเบี้ยลดต้นลดดอก
        </h1>
        <p className="text-muted-foreground">
          คำนวณค่างวดขั้นต่ำ ดอกเบี้ยรวม และดูว่าการโปะเพิ่มช่วยประหยัดดอกเบี้ยและลดระยะเวลาผ่อนได้เท่าไร
        </p>
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

          <FieldGroup title="ภาระการชำระ" columns={3}>
            <ReadonlyField label="ขั้นต่ำ/เดือน" value={`${formatBaht(result.minMonthlyPayment)} บาท`} />
            <NumberField
              label="โปะเพิ่ม/เดือน"
              value={inputs.extraPayment}
              onChange={(v) => update("extraPayment", Math.max(0, v))}
              suffix="บาท"
              min={0}
            />
            <ReadonlyField label="จ่ายรวม/เดือน" value={`${formatBaht(result.totalMonthlyPayment)} บาท`} />
          </FieldGroup>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>สรุปภาระกู้ยืม</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <BigStat label="ดอกเบี้ยรวม" value={`${formatBaht(result.totalInterest)} บาท`} />
          <BigStat label="ยอดชำระรวม" value={`${formatBaht(result.totalPayment)} บาท`} />
          <BigStat label="งวดชำระจริง" value={`${result.actualMonths} เดือน`} />
          <BigStat label="ประหยัดจากการโปะ" value={`${formatBaht(result.interestSaved)} บาท`} tone="success" />
          <BigStat label="ลดงวดชำระ" value={`${result.monthsReduced} เดือน`} tone="success" />
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
        <InfoBlock heading="ดอกเบี้ยลดต้นลดดอกคืออะไร">
          <p>
            ดอกเบี้ยลดต้นลดดอก (Effective Rate) คือวิธีคิดดอกเบี้ยจากยอดเงินต้นคงเหลือ ณ ปัจจุบัน ไม่ใช่เงินต้นเริ่มต้น
            ในแต่ละงวด ดอกเบี้ยจะถูกคำนวณก่อน ส่วนที่เหลือของค่างวดจะนำไปตัดเงินต้น
            เมื่อเงินต้นลดลง ดอกเบี้ยในงวดถัดไปก็จะลดลงตามไปด้วย เป็นวิธีคิดดอกเบี้ยที่สินเชื่อบ้านและสินเชื่อส่วนใหญ่ในไทยใช้
          </p>
        </InfoBlock>
        <InfoBlock heading="การโปะเพิ่มช่วยอย่างไร">
          <p>
            เมื่อจ่ายเกินค่างวดขั้นต่ำ ส่วนที่โปะเพิ่มจะถูกนำไปตัดเงินต้นทั้งหมด ทำให้เงินต้นลดเร็วขึ้น
            ดอกเบี้ยในงวดถัดไปก็จะน้อยลงตามไปด้วย ส่งผลให้ประหยัดดอกเบี้ยรวมและปิดหนี้ได้เร็วกว่ากำหนดเดิม
          </p>
        </InfoBlock>
        <InfoBlock heading="ข้อควรระวัง">
          <p>
            ตัวเลขนี้เป็นการประมาณการโดยสมมติว่าอัตราดอกเบี้ยคงที่ตลอดสัญญาและมีการโปะเพิ่มจำนวนเท่ากันทุกเดือน
            สินเชื่อจริงอาจมีการปรับอัตราดอกเบี้ยหรือมีเงื่อนไขค่าธรรมเนียมเพิ่มเติม ควรตรวจสอบกับสถาบันการเงินอีกครั้ง
          </p>
        </InfoBlock>
      </InfoSection>
    </div>
  )
}
