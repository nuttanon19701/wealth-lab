import {
  Calculator,
  Info,
  Landmark,
  Layers,
  LineChart,
  PiggyBank,
  Receipt,
  Scale,
  ShieldCheck,
  Wallet,
} from "lucide-react"
import type { ComponentType } from "react"

export interface CalculatorMeta {
  id: string
  path: string
  name: string
  shortName: string
  description: string
  icon: ComponentType<{ className?: string }>
}

export const calculators: CalculatorMeta[] = [
  {
    id: "dca",
    path: "/calculators/dca",
    name: "DCA Calculator",
    shortName: "DCA",
    description: "จำลองผลตอบแทนการลงทุนแบบถัวเฉลี่ยต้นทุนรายเดือน",
    icon: LineChart,
  },
  {
    id: "rebalance",
    path: "/calculators/rebalance",
    name: "Portfolio Rebalancing",
    shortName: "Rebalance",
    description: "คำนวณการซื้อ-ขายเพื่อปรับสัดส่วนพอร์ตให้ตรงเป้าหมาย",
    icon: Scale,
  },
  {
    id: "retirement",
    path: "/calculators/retirement",
    name: "Retirement Calculator",
    shortName: "เกษียณ",
    description: "วางแผนเงินออมเพื่อการเกษียณอายุอย่างมั่นใจ",
    icon: PiggyBank,
  },
  {
    id: "loan-amortized",
    path: "/calculators/loan-amortized",
    name: "สินเชื่อดอกเบี้ยลดต้นลดดอก",
    shortName: "ลดต้นลดดอก",
    description: "คำนวณตารางผ่อนชำระสินเชื่อแบบลดต้นลดดอก",
    icon: Landmark,
  },
  {
    id: "loan-flat",
    path: "/calculators/loan-flat",
    name: "สินเชื่อดอกเบี้ยคงที่",
    shortName: "ดอกเบี้ยคงที่",
    description: "คำนวณตารางผ่อนชำระสินเชื่อแบบดอกเบี้ยคงที่",
    icon: Receipt,
  },
  {
    id: "tvm",
    path: "/calculators/tvm",
    name: "TVM Calculator",
    shortName: "TVM",
    description: "คำนวณมูลค่าเงินตามเวลา (Time Value of Money)",
    icon: Calculator,
  },
  {
    id: "tax",
    path: "/calculators/tax",
    name: "Tax Planning",
    shortName: "ภาษี",
    description: "วางแผนภาษีเงินได้บุคคลธรรมดาตามอัตราขั้นบันได",
    icon: Wallet,
  },
  {
    id: "pvd",
    path: "/calculators/pvd",
    name: "กองทุนสำรองเลี้ยงชีพ",
    shortName: "กองทุนสำรองฯ",
    description: "ประมาณการเงินกองทุนสำรองเลี้ยงชีพเมื่อเกษียณอายุ",
    icon: ShieldCheck,
  },
  {
    id: "bucket-strategy",
    path: "/calculators/bucket-strategy",
    name: "3 Bucket Strategies",
    shortName: "3 Bucket",
    description: "จำลองกลยุทธ์แบ่งเงินเกษียณเป็น 3 ถัง (Safe / Low Risk / High Risk) พร้อม Passive Income",
    icon: Layers,
  },
]

export const otherNav = [
  {
    id: "about",
    path: "/about",
    name: "เกี่ยวกับเรา",
    icon: Info,
  },
]
