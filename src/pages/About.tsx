import { ShieldCheck, Sparkles, Target } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function About() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
          เกี่ยวกับเรา
        </h1>
        <p className="max-w-2xl text-muted-foreground">
          MoneySart คือแพลตฟอร์มเครื่องคำนวณทางการเงินที่ออกแบบมาเพื่อคนไทย
          ช่วยให้การวางแผนการเงินเป็นเรื่องที่เข้าใจง่ายและตัดสินใจได้อย่างมั่นใจมากขึ้น
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="gap-2">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent text-accent-foreground">
              <Target className="h-5 w-5" />
            </span>
            <CardTitle className="text-base">ภารกิจของเรา</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            ทำให้เครื่องมือวางแผนการเงินระดับมืออาชีพเข้าถึงได้ฟรีสำหรับทุกคน
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="gap-2">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent text-accent-foreground">
              <ShieldCheck className="h-5 w-5" />
            </span>
            <CardTitle className="text-base">แม่นยำและน่าเชื่อถือ</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            สูตรคำนวณอ้างอิงหลักการทางการเงินมาตรฐาน พร้อมกราฟและตารางแสดงผลอย่างละเอียด
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="gap-2">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent text-accent-foreground">
              <Sparkles className="h-5 w-5" />
            </span>
            <CardTitle className="text-base">ใช้งานง่าย</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            ออกแบบ UI ให้เรียบง่าย ทันสมัย และใช้งานได้ลื่นไหลบนทุกอุปกรณ์
          </CardContent>
        </Card>
      </div>

      <p className="text-sm text-muted-foreground">
        ข้อมูลและผลลัพธ์จากเครื่องคำนวณนี้จัดทำขึ้นเพื่อการศึกษาและประกอบการตัดสินใจเบื้องต้นเท่านั้น
        ไม่ถือเป็นคำแนะนำการลงทุนหรือคำแนะนำทางภาษีอย่างเป็นทางการ โปรดปรึกษาผู้เชี่ยวชาญก่อนตัดสินใจ
      </p>
    </div>
  )
}
