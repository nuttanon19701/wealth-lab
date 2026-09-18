function Box({
  x,
  y,
  w,
  h,
  label,
  variant = "muted",
}: {
  x: number
  y: number
  w: number
  h: number
  label: string
  variant?: "muted" | "accent" | "primary"
}) {
  const classes =
    variant === "primary"
      ? "fill-primary/10 stroke-primary"
      : variant === "accent"
        ? "fill-accent stroke-border"
        : "fill-muted stroke-border"
  const textClass = variant === "primary" ? "fill-primary" : variant === "accent" ? "fill-accent-foreground" : "fill-muted-foreground"

  return (
    <>
      <rect x={x} y={y} width={w} height={h} rx="10" className={classes} strokeWidth="1.5" />
      <text x={x + w / 2} y={y + h / 2 + 5} textAnchor="middle" className={`${textClass} text-[13px] font-semibold`}>
        {label}
      </text>
    </>
  )
}

function Arrow({
  id,
  x1,
  y1,
  x2,
  y2,
  label,
  dashed = false,
}: {
  id: string
  x1: number
  y1: number
  x2: number
  y2: number
  label?: string
  dashed?: boolean
}) {
  return (
    <>
      <defs>
        <marker id={`arrow-${id}`} markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" className="fill-primary" />
        </marker>
      </defs>
      <line
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke="currentColor"
        className="text-primary"
        strokeWidth="2.5"
        strokeDasharray={dashed ? "4 3" : undefined}
        markerEnd={`url(#arrow-${id})`}
      />
      {label && (
        <text x={(x1 + x2) / 2 + 14} y={(y1 + y2) / 2} textAnchor="middle" className="fill-primary text-[11px] font-semibold">
          {label}
        </text>
      )}
    </>
  )
}

export function BucketWaterfallDiagram() {
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border bg-muted/30 p-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-semibold text-foreground">ลำดับการใช้จ่ายประจำปี (Spending Waterfall)</p>
        <span className="rounded-full bg-primary/15 px-2 py-0.5 text-xs font-medium text-primary">ลำดับตายตัว</span>
      </div>
      <svg viewBox="0 0 320 260" className="h-auto w-full">
        <Box x={20} y={12} w={280} h={48} label="Safe / Steady + Passive Income" variant="primary" />
        <Box x={20} y={106} w={280} h={48} label="Bucket 2 · Low Risk" variant="accent" />
        <Box x={20} y={200} w={280} h={48} label="Bucket 3 · High Risk / Growth" variant="muted" />

        <Arrow id="wf-1" x1={160} y1={60} x2={160} y2={104} label="1" />
        <Arrow id="wf-2" x1={160} y1={154} x2={160} y2={198} label="2" />
      </svg>
      <div className="flex flex-col gap-1 text-xs text-muted-foreground">
        <p>
          <span className="font-semibold text-foreground">ก่อนอื่น:</span> ใช้เงินใน Safe / Steady รวมกับ Passive
          Income (ค่าเช่า/บำนาญ) จ่ายค่าใช้จ่ายของปีนั้นก่อนเสมอ
        </p>
        <p>
          <span className="font-semibold text-foreground">1) ถ้าไม่พอ:</span> ดึงเงินจาก Low Risk มาเติม
          — ดึงเท่าที่จำเป็น ไม่มีเพดานจำกัด เพราะการมีเงินพอใช้จ่ายสำคัญที่สุด
        </p>
        <p>
          <span className="font-semibold text-foreground">2) ถ้ายังไม่พอ:</span> จึงดึงเงินจาก High Risk / Growth
          เพิ่มเติม เท่าที่จำเป็นเช่นกัน
        </p>
      </div>
    </div>
  )
}

export function BucketMaintenanceDiagram() {
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border bg-muted/30 p-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-semibold text-foreground">การรักษาระดับ Low Risk ให้ตรงเป้าหมาย</p>
        <span className="rounded-full bg-primary/15 px-2 py-0.5 text-xs font-medium text-primary">ทำทุกปี</span>
      </div>
      <svg viewBox="0 0 320 190" className="h-auto w-full">
        <Box x={8} y={12} w={130} h={48} label="Bucket 3 · High Risk" variant="muted" />
        <Box x={182} y={12} w={130} h={48} label="Safe / Steady" variant="primary" />
        <Box x={95} y={122} w={130} h={48} label="Bucket 2 · Low Risk" variant="accent" />

        <Arrow id="mnt-1" x1={90} y1={60} x2={140} y2={120} label="เติม" />
        <Arrow id="mnt-2" x1={230} y1={120} x2={247} y2={62} label="ส่วนเกิน" />
      </svg>
      <div className="flex flex-col gap-1 text-xs text-muted-foreground">
        <p>
          &ldquo;มูลค่าปัจจุบัน&rdquo; ที่ตั้งไว้ตอนเริ่มต้นของ Low Risk คือ <span className="font-semibold text-foreground">เป้าหมาย (เพดาน)</span>{" "}
          ของถังนี้เสมอ
        </p>
        <p>
          <span className="font-semibold text-foreground">ต่ำกว่าเป้า:</span> High Risk / Growth จะโอนมาเติมให้ ไม่เกิน
          &ldquo;เพดานการไถ่ถอนเข้า B2 (%/ปี)&rdquo; ที่กำหนดไว้ และไม่เติมเกินเป้าหมาย
        </p>
        <p>
          <span className="font-semibold text-foreground">สูงกว่าเป้า:</span> ส่วนที่เกินเป้าหมายจะถูกโอนกลับไปไว้ที่
          Safe / Steady ทั้งหมด
        </p>
      </div>
    </div>
  )
}
