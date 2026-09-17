interface FlowPanelProps {
  title: string
  badge: string
  badgeTone: "success" | "destructive" | "primary"
  primaryFrom: string
  secondaryFrom: string
  primaryLabel: string
  secondaryLabel: string
}

const toneClasses: Record<FlowPanelProps["badgeTone"], string> = {
  success: "bg-success/15 text-success",
  destructive: "bg-destructive/15 text-destructive",
  primary: "bg-primary/15 text-primary",
}

function FlowPanel({
  title,
  badge,
  badgeTone,
  primaryFrom,
  secondaryFrom,
  primaryLabel,
  secondaryLabel,
}: FlowPanelProps) {
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border bg-muted/30 p-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-semibold text-foreground">{title}</p>
        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${toneClasses[badgeTone]}`}>{badge}</span>
      </div>
      <svg viewBox="0 0 320 190" className="h-auto w-full">
        <defs>
          <marker id={`arrow-${title}`} markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
            <path d="M0,0 L6,3 L0,6 Z" className="fill-primary" />
          </marker>
        </defs>

        <rect x="8" y="12" width="120" height="48" rx="10" className="fill-accent stroke-border" strokeWidth="1" />
        <text x="68" y="41" textAnchor="middle" className="fill-accent-foreground text-[13px] font-semibold">
          {primaryFrom}
        </text>

        <rect x="192" y="12" width="120" height="48" rx="10" className="fill-muted stroke-border" strokeWidth="1" />
        <text x="252" y="41" textAnchor="middle" className="fill-muted-foreground text-[13px] font-semibold">
          {secondaryFrom}
        </text>

        <rect
          x="100"
          y="128"
          width="120"
          height="48"
          rx="10"
          className="fill-primary/10 stroke-primary"
          strokeWidth="1.5"
        />
        <text x="160" y="157" textAnchor="middle" className="fill-primary text-[13px] font-bold">
          Bucket 1 · Cash
        </text>

        <line
          x1="80"
          y1="60"
          x2="140"
          y2="126"
          stroke="currentColor"
          className="text-primary"
          strokeWidth="2.5"
          markerEnd={`url(#arrow-${title})`}
        />
        <text x="70" y="90" textAnchor="middle" className="fill-primary text-[11px] font-semibold">
          1
        </text>

        <line
          x1="248"
          y1="60"
          x2="190"
          y2="126"
          stroke="currentColor"
          className="text-muted-foreground"
          strokeWidth="2"
          strokeDasharray="4 3"
          markerEnd={`url(#arrow-${title})`}
        />
        <text x="252" y="90" textAnchor="middle" className="fill-muted-foreground text-[11px] font-semibold">
          2
        </text>
      </svg>
      <div className="flex flex-col gap-1 text-xs text-muted-foreground">
        <p>
          <span className="font-semibold text-foreground">1) ใช้ก่อน:</span> {primaryLabel}
        </p>
        <p>
          <span className="font-semibold text-foreground">2) ถ้าไม่พอ:</span> {secondaryLabel}
        </p>
      </div>
    </div>
  )
}

export function BucketFlowDiagram() {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <FlowPanel
        title="ช่วงตลาดปกติ (Good Phase)"
        badge="Good"
        badgeTone="success"
        primaryFrom="Bucket 4 · Growth"
        secondaryFrom="Bucket 3 · Bond"
        primaryLabel="ดึงเงินจากถัง Growth (หุ้น/ETF) มาเติมถังเงินสดก่อน"
        secondaryLabel="ถ้า Growth ดึงได้ไม่พอ (ติดเพดาน % ที่ตั้งไว้) จึงดึงจากถัง Bond เพิ่ม"
      />
      <FlowPanel
        title="ช่วงตลาดผันผวน (Bad Phase)"
        badge="Bad"
        badgeTone="destructive"
        primaryFrom="Bucket 3 · Bond"
        secondaryFrom="Bucket 4 · Growth"
        primaryLabel="ดึงเงินจากถัง Bond มาเติมถังเงินสดก่อน เพื่อปกป้องถัง Growth"
        secondaryLabel="ถ้า Bond ดึงได้ไม่พอ จึงจำเป็นต้องดึงจากถัง Growth เพิ่ม"
      />
    </div>
  )
}

export function BucketSurplusDiagram() {
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border bg-muted/30 p-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-semibold text-foreground">ปรับสมดุลส่วนเกิน (Surplus Rebalancing)</p>
        <span className="rounded-full bg-primary/15 px-2 py-0.5 text-xs font-medium text-primary">
          เฉพาะช่วง Good
        </span>
      </div>
      <svg viewBox="0 0 320 110" className="h-auto w-full">
        <defs>
          <marker id="arrow-surplus" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
            <path d="M0,0 L6,3 L0,6 Z" className="fill-primary" />
          </marker>
        </defs>
        <rect x="8" y="30" width="120" height="48" rx="10" className="fill-muted stroke-border" strokeWidth="1" />
        <text x="68" y="59" textAnchor="middle" className="fill-muted-foreground text-[13px] font-semibold">
          Bucket 3 · Bond
        </text>

        <rect x="192" y="30" width="120" height="48" rx="10" className="fill-accent stroke-border" strokeWidth="1" />
        <text x="252" y="59" textAnchor="middle" className="fill-accent-foreground text-[13px] font-semibold">
          Bucket 4 · Growth
        </text>

        <line
          x1="130"
          y1="54"
          x2="190"
          y2="54"
          stroke="currentColor"
          className="text-primary"
          strokeWidth="2.5"
          markerEnd="url(#arrow-surplus)"
        />
      </svg>
      <p className="text-xs text-muted-foreground">
        เมื่อ Bond สูงกว่าระดับเป้าหมายเกินกรอบที่ยอมรับได้ (surplus) ส่วนเกินจะถูกโยกไปไว้ในถัง Growth
        เพื่อรักษาโครงสร้างพอร์ตให้กลับสู่สัดส่วนเดิมโดยไม่ต้องซื้อขายบ่อย
      </p>
    </div>
  )
}
