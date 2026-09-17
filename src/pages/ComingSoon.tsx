import { Construction } from "lucide-react"

interface ComingSoonProps {
  title: string
}

export function ComingSoon({ title }: ComingSoonProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border py-24 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-accent text-accent-foreground">
        <Construction className="h-6 w-6" />
      </span>
      <h2 className="text-lg font-semibold text-foreground">{title}</h2>
      <p className="max-w-sm text-sm text-muted-foreground">
        เครื่องคำนวณนี้กำลังอยู่ระหว่างการพัฒนา เร็ว ๆ นี้จะพร้อมใช้งาน
      </p>
    </div>
  )
}
