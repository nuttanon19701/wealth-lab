import type { ReactNode } from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface InfoSectionProps {
  title?: string
  children: ReactNode
}

export function InfoSection({ title = "ควรรู้ก่อนใช้เครื่องมือนี้", children }: InfoSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-5 text-sm leading-relaxed text-muted-foreground">
        {children}
      </CardContent>
    </Card>
  )
}

export function InfoHeading({ children }: { children: ReactNode }) {
  return <h4 className="text-sm font-semibold text-foreground">{children}</h4>
}

export function InfoBlock({ heading, children }: { heading?: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      {heading && <InfoHeading>{heading}</InfoHeading>}
      <div className="flex flex-col gap-2">{children}</div>
    </div>
  )
}
