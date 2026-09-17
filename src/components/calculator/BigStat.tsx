interface BigStatProps {
  label: string
  value: string
  sub?: string
  tone?: "primary" | "success" | "destructive"
}

const toneClasses: Record<NonNullable<BigStatProps["tone"]>, string> = {
  primary: "border-primary/20 bg-primary/5 text-primary",
  success: "border-success/30 bg-success/10 text-success",
  destructive: "border-destructive/30 bg-destructive/10 text-destructive",
}

export function BigStat({ label, value, sub, tone = "primary" }: BigStatProps) {
  return (
    <div
      className={`flex flex-col items-center gap-1 rounded-xl border p-6 text-center ${toneClasses[tone]}`}
    >
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <p className="text-3xl font-extrabold tracking-tight md:text-4xl">{value}</p>
      {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
    </div>
  )
}
