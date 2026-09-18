import { useMemo, useState } from "react"

import { BigStat } from "@/components/calculator/BigStat"
import { FieldGroup, NumberField, ReadonlyField } from "@/components/calculator/fields"
import { InfoBlock, InfoSection } from "@/components/calculator/InfoSection"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  calculateTax,
  ESG_CAP,
  RETIREMENT_FUNDS_CAP,
  SOCIAL_SECURITY_CAP,
  type TaxInputs,
} from "@/calculators/tax"
import { formatBaht, formatPercent } from "@/lib/format"
import { cn } from "@/lib/utils"

const defaultInputs: TaxInputs = {
  salaryIncome: 720000,
  hasOtherIncome: false,
  otherIncome: 0,
  bonus: 50000,
  withholdingTax: 25000,
  socialSecurity: 9000,
  retirementFunds: 50000,
  thaiEsgX: 0,
  thaiEsgXFromLtf: 0,
  otherDeductions: 0,
}

export function TaxCalculator() {
  const [inputs, setInputs] = useState<TaxInputs>(defaultInputs)

  const result = useMemo(() => calculateTax(inputs), [inputs])

  function update<K extends keyof TaxInputs>(key: K, value: TaxInputs[K]) {
    setInputs((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">Tax Planning Calculator</h1>
        <p className="text-muted-foreground">ประมาณการภาษีเงินได้บุคคลธรรมดาตามอัตราภาษีขั้นบันได</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>รายได้</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <FieldGroup columns={3}>
            <NumberField
              label="รายได้ประเภท 40(1)"
              value={inputs.salaryIncome}
              onChange={(v) => update("salaryIncome", Math.max(0, v))}
              suffix="บาท/ปี"
              min={0}
            />
            <NumberField
              label="โบนัส"
              value={inputs.bonus}
              onChange={(v) => update("bonus", Math.max(0, v))}
              suffix="บาท"
              min={0}
            />
            <NumberField
              label="ภาษีหัก ณ ที่จ่าย"
              value={inputs.withholdingTax}
              onChange={(v) => update("withholdingTax", Math.max(0, v))}
              suffix="บาท"
              min={0}
            />
          </FieldGroup>

          <div className="flex items-center justify-between gap-4 rounded-lg border border-border bg-muted/30 p-3">
            <div className="flex flex-col gap-0.5">
              <Label>มีรายได้ประเภทอื่น ๆ</Label>
              <p className="text-xs text-muted-foreground">เช่น ค่าเช่า ค่าวิชาชีพ หรือเงินได้ประเภทอื่นนอกเหนือจากเงินเดือน</p>
            </div>
            <Switch
              checked={inputs.hasOtherIncome}
              onCheckedChange={(v) => update("hasOtherIncome", v)}
            />
          </div>

          {inputs.hasOtherIncome && (
            <FieldGroup columns={1}>
              <NumberField
                label="รายได้ประเภทอื่น ๆ"
                value={inputs.otherIncome}
                onChange={(v) => update("otherIncome", Math.max(0, v))}
                suffix="บาท/ปี"
                min={0}
              />
            </FieldGroup>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>ค่าลดหย่อน</CardTitle>
          <CardDescription>ลดหย่อนส่วนบุคคลเป็นค่าคงที่ตามกฎหมาย ส่วนรายการอื่นมีเพดานตามที่กำหนด</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <FieldGroup columns={1}>
            <ReadonlyField label="ลดหย่อนส่วนบุคคล" value={`${formatBaht(result.personalAllowance)} บาท`} />
          </FieldGroup>

          <FieldGroup title="ค่าลดหย่อนการออม/การลงทุน" columns={2}>
            <NumberField
              label="เงินประกันสังคม"
              value={inputs.socialSecurity}
              onChange={(v) => update("socialSecurity", Math.max(0, v))}
              suffix="บาท"
              min={0}
              hint={`ไม่เกิน ${formatBaht(SOCIAL_SECURITY_CAP)} บาท`}
            />
            <NumberField
              label="กองทุนกลุ่มเกษียณ (ไม่รวม RMF)"
              value={inputs.retirementFunds}
              onChange={(v) => update("retirementFunds", Math.max(0, v))}
              suffix="บาท"
              min={0}
              hint={`ไม่เกิน ${formatBaht(RETIREMENT_FUNDS_CAP)} บาท`}
            />
            <NumberField
              label="กองทุน ThaiESGX"
              value={inputs.thaiEsgX}
              onChange={(v) => update("thaiEsgX", Math.max(0, v))}
              suffix="บาท"
              min={0}
              hint={`ไม่เกิน 30% ของรายได้ทั้งปี สูงสุด ${formatBaht(ESG_CAP)} บาท`}
            />
            <NumberField
              label="กองทุน ThaiESGX โอนจาก LTF"
              value={inputs.thaiEsgXFromLtf}
              onChange={(v) => update("thaiEsgXFromLtf", Math.max(0, v))}
              suffix="บาท"
              min={0}
              hint={`ไม่เกิน 30% ของรายได้ทั้งปี สูงสุด ${formatBaht(ESG_CAP)} บาท`}
            />
          </FieldGroup>

          <FieldGroup columns={1}>
            <NumberField
              label="ค่าลดหย่อนอื่น ๆ"
              value={inputs.otherDeductions}
              onChange={(v) => update("otherDeductions", Math.max(0, v))}
              suffix="บาท"
              min={0}
              hint="เช่น ดอกเบี้ยบ้าน ประกันชีวิต บริจาค ฯลฯ"
            />
          </FieldGroup>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <BigStat
          label={result.additionalTaxToPay >= 0 ? "ภาษีที่ต้องจ่ายเพิ่ม" : "ภาษีที่ได้รับคืน"}
          value={`${formatBaht(Math.abs(result.additionalTaxToPay))} บาท`}
          tone={result.additionalTaxToPay > 0 ? "destructive" : "success"}
        />
        <BigStat label="ภาษีที่คำนวณได้ทั้งหมด" value={`${formatBaht(result.taxDue)} บาท`} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>สรุปการคำนวณ</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <ReadonlyField label="รายได้รวมทั้งปี" value={`${formatBaht(result.totalIncome)} บาท`} />
          <ReadonlyField label="หักค่าใช้จ่าย (50% ไม่เกิน 100,000)" value={`${formatBaht(result.expenseDeduction)} บาท`} />
          <ReadonlyField label="ค่าลดหย่อนรวม" value={`${formatBaht(result.totalDeductions)} บาท`} />
          <ReadonlyField label="เงินได้สุทธิ (ฐานภาษี)" value={`${formatBaht(result.taxableIncome)} บาท`} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>ตารางอัตราภาษีขั้นบันได</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-lg border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ช่วงเงินได้สุทธิ</TableHead>
                  <TableHead className="text-right">อัตราภาษี</TableHead>
                  <TableHead className="text-right">เงินได้ในช่วงนี้</TableHead>
                  <TableHead className="text-right">ภาษีในช่วงนี้</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {result.brackets.map((b) => (
                  <TableRow key={b.from} className={cn(b.taxableInBracket > 0 && "bg-primary/5")}>
                    <TableCell>
                      {formatBaht(b.from)} — {b.to === null ? "ขึ้นไป" : formatBaht(b.to)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">{formatPercent(b.ratePct)}%</TableCell>
                    <TableCell className="text-right tabular-nums text-muted-foreground">
                      {formatBaht(b.taxableInBracket)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums font-medium text-foreground">
                      {formatBaht(b.taxInBracket)}
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow className="bg-muted/40 font-semibold">
                  <TableCell colSpan={3}>รวมภาษีที่คำนวณได้</TableCell>
                  <TableCell className="text-right tabular-nums">{formatBaht(result.taxDue)}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <InfoSection>
        <InfoBlock heading="ภาษีเงินได้บุคคลธรรมดาคำนวณอย่างไร">
          <p>
            ภาษีเงินได้บุคคลธรรมดาของไทยใช้อัตราภาษีแบบขั้นบันได (Progressive Tax) เงินได้แต่ละช่วงจะถูกคิดภาษีในอัตราที่ต่างกัน
            ยิ่งเงินได้สุทธิสูงขึ้น อัตราภาษีของเงินได้ส่วนที่เกินก็จะยิ่งสูงขึ้นตามไปด้วย ไม่ใช่การคิดอัตราเดียวกับเงินได้ทั้งก้อน
          </p>
          <p>
            เงินได้ประเภท 40(1) (เงินเดือน/ค่าจ้าง) สามารถหักค่าใช้จ่ายแบบเหมาได้ 50% ของเงินได้ แต่ไม่เกิน 100,000 บาท
            ก่อนจะนำมาหักค่าลดหย่อนต่าง ๆ เพื่อหาเงินได้สุทธิที่ใช้เป็นฐานคำนวณภาษี
          </p>
        </InfoBlock>
        <InfoBlock heading="ข้อควรระวัง">
          <p>
            เครื่องมือนี้ใช้อัตราภาษีและเพดานค่าลดหย่อนตามหลักเกณฑ์ทั่วไปที่ใช้อยู่ในปัจจุบัน ซึ่งอาจมีการเปลี่ยนแปลงในแต่ละปีภาษี
            และไม่ได้ครอบคลุมกรณีพิเศษทุกกรณี (เช่น เงินได้ประเภทอื่นที่มีวิธีคำนวณต่างกัน) ควรตรวจสอบกับกรมสรรพากร
            หรือผู้เชี่ยวชาญด้านภาษีก่อนยื่นแบบจริง
          </p>
        </InfoBlock>
      </InfoSection>
    </div>
  )
}
