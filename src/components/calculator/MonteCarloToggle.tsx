import { Dices } from "lucide-react"

import { Switch } from "@/components/ui/switch"

interface MonteCarloToggleProps {
  enabled: boolean
  onToggle: (value: boolean) => void
}

export function MonteCarloToggle({ enabled, onToggle }: MonteCarloToggleProps) {
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border bg-muted/30 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3 sm:pr-4">
        <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground">
          <Dices className="h-4 w-4" />
        </span>
        <div className="flex flex-col gap-1">
          <p className="text-sm font-semibold text-foreground">โหมด Monte Carlo Simulation</p>
          <p className="text-xs leading-relaxed text-muted-foreground">
            แทนที่จะใช้ผลตอบแทนคงที่ทุกปี โหมดนี้จะสุ่มผลตอบแทนแต่ละงวดหลายร้อยครั้งตามค่าเฉลี่ยและความผันผวนที่คุณกำหนด
            เพื่อแสดง &ldquo;ช่วง&rdquo; ของผลลัพธ์ที่เป็นไปได้ (เช่น กรณีแย่ กลาง และดี) แทนตัวเลขเดียว
            ช่วยให้เห็นความเสี่ยงจากความผันผวนของตลาดชัดเจนขึ้น
          </p>
        </div>
      </div>
      <Switch checked={enabled} onCheckedChange={onToggle} className="shrink-0" />
    </div>
  )
}
