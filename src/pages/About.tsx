import { BadgeCheck, ExternalLink, MessageCircle, ShieldCheck, Sparkles, Target } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const SEC_LICENSE_URL = "https://market.sec.or.th/LicenseCheck/PersonDetail/0000191655"
const FINNOMENA_URL =
  "https://www.finnomena.com/advisor/profile/140127?_gl=1*150ainn*_gcl_au*MTQ5ODU5MTUzOS4xNzgzMDcwMzA4LjEwMTc4NjgwMjAuMTc4OTYzNzc4OS4xNzg5NjM3Nzg4LjE2NDA3NzQ4NDIuMTc4OTYzNzc4OS4xNzg5NjM3Nzg4*_ga*MTIyNTc4NzUyMi4xNzA5NzkxMTMx*_ga_0NC17XMT62*czE3ODk2Mzc3NjYkbzYxNCRnMSR0MTc4OTYzNzc5MiRqMzQkbDAkaDE4NzAzNjk2NzQ.*_fplc*Y2J2eVBKU0tGRVpCdlglMkJGOUJlJTJGS1JQSHRFS3BYVTBEbkFKeG9qSVNZUSUyQnpwRU5sT1VDSXhETkthYkFIUFdoJTJCU3ZEMFBuMHJqc2I2dE9CUUpiZGVhaUZYZ2F0U1poZDB3OEJ2RUJIamxWYlBFSjN6RnNzJTJGUzc1JTJGbkE0YmNBJTNEJTNE"
const FACEBOOK_URL = "https://www.facebook.com/profile.php?id=61567463055678"

export function About() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
          เกี่ยวกับเรา
        </h1>
        <p className="max-w-2xl text-muted-foreground">
          Wealth Lab เป็นเว็บไซต์ให้ความรู้เกี่ยวกับการวางแผนการเงินและการลงทุน
          รวมถึงจัดทำและรวบรวมเครื่องมือวางแผนการเงินไว้ในที่เดียว
          เพื่อให้ทุกคนเข้าถึงเครื่องมือคุณภาพและตัดสินใจเรื่องเงินได้อย่างมั่นใจมากขึ้น
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

      <Card>
        <CardHeader className="gap-2">
          <CardTitle className="text-lg">ผู้จัดทำ</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
            <img
              src="/images/nuttanon.jpg"
              alt="ณัฐฐนนท์ ทรงสุวรรณ"
              className="h-24 w-24 shrink-0 rounded-full border border-border object-cover"
            />
            <div>
              <p className="text-base font-semibold text-foreground">
                ณัฐฐนนท์ ทรงสุวรรณ (Nuttanon Songsuwan)
              </p>
              <p className="text-sm text-muted-foreground">ผู้ก่อตั้งและผู้จัดทำ Wealth Lab</p>
            </div>
          </div>

          <ul className="flex flex-col gap-3">
            <li className="flex items-start gap-3">
              <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                <BadgeCheck className="h-4 w-4" />
              </span>
              <div className="flex flex-col gap-0.5">
                <p className="text-sm text-foreground">
                  ผู้วางแผนการลงทุน (Investment Planner) ขึ้นทะเบียนกับสำนักงาน ก.ล.ต. (SEC)
                </p>
                <a
                  href={SEC_LICENSE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex w-fit items-center gap-1 text-sm text-primary hover:underline"
                >
                  ตรวจสอบใบอนุญาตที่ market.sec.or.th
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                <BadgeCheck className="h-4 w-4" />
              </span>
              <div className="flex flex-col gap-0.5">
                <p className="text-sm text-foreground">
                  ผู้แนะนำการลงทุน อิสระ (Independent Financial Advisor) กับ Finnomena
                </p>
                <a
                  href={FINNOMENA_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex w-fit items-center gap-1 text-sm text-primary hover:underline"
                >
                  ดูโปรไฟล์บน Finnomena
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            </li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="gap-2">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent text-accent-foreground">
            <MessageCircle className="h-5 w-5" />
          </span>
          <CardTitle className="text-base">มีข้อเสนอแนะถึงเรา?</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 text-sm text-muted-foreground">
          <p>
            ท่านใดมีข้อแนะนำ หรืออยากให้เราเพิ่มเติมเครื่องมือคำนวณอะไร เชิญส่งข้อความมาได้ที่ Facebook
            Page ครับ
          </p>
          <a
            href={FACEBOOK_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex w-fit items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <MessageCircle className="h-4 w-4" />
            ไปที่ Facebook Page
          </a>
        </CardContent>
      </Card>

      <p className="text-sm text-muted-foreground">
        ข้อมูลและผลลัพธ์จากเครื่องคำนวณนี้จัดทำขึ้นเพื่อการศึกษาและประกอบการตัดสินใจเบื้องต้นเท่านั้น
        ไม่ถือเป็นคำแนะนำการลงทุนหรือคำแนะนำทางภาษีอย่างเป็นทางการ โปรดปรึกษาผู้เชี่ยวชาญก่อนตัดสินใจ
      </p>
    </div>
  )
}
