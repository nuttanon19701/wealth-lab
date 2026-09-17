import { ArrowRight } from "lucide-react"
import { Link } from "react-router-dom"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { calculators } from "@/lib/calculators"

export function Home() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
          วางแผนการเงินของคุณให้ง่ายขึ้น
        </h1>
        <p className="max-w-2xl text-muted-foreground">
          Wealth Lab รวมเครื่องคำนวณทางการเงินที่จำเป็นไว้ในที่เดียว ตั้งแต่การลงทุน การวางแผนเกษียณ
          ไปจนถึงสินเชื่อและภาษี ใช้งานง่าย แม่นยำ และเชื่อถือได้
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {calculators.map((calc) => (
          <Link key={calc.id} to={calc.path} className="group">
            <Card className="h-full transition-all group-hover:-translate-y-0.5 group-hover:border-primary/40 group-hover:shadow-md">
              <CardHeader className="flex flex-row items-start justify-between gap-2">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                  <calc.icon className="h-5 w-5" />
                </span>
                <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
              </CardHeader>
              <CardContent className="flex flex-col gap-1.5 pt-0">
                <CardTitle className="text-base">{calc.name}</CardTitle>
                <CardDescription>{calc.description}</CardDescription>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
