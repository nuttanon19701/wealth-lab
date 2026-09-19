import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts"

import { formatPercent } from "@/lib/format"

const CHART_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
]

interface AllocationDatum {
  name: string
  value: number
}

interface AllocationDonutChartProps {
  title: string
  data: AllocationDatum[]
}

export function AllocationDonutChart({ title, data }: AllocationDonutChartProps) {
  const total = data.reduce((sum, d) => sum + Math.max(d.value, 0), 0)
  const chartData = data.filter((d) => d.value > 0)

  return (
    <div className="flex flex-col gap-3">
      <p className="text-center text-sm font-semibold text-foreground">{title}</p>
      {chartData.length === 0 ? (
        <div className="flex h-56 items-center justify-center text-sm text-muted-foreground">ยังไม่มีข้อมูล</div>
      ) : (
        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={chartData} dataKey="value" nameKey="name" innerRadius="55%" outerRadius="85%" paddingAngle={2}>
                {chartData.map((entry, i) => (
                  <Cell key={entry.name} fill={CHART_COLORS[i % CHART_COLORS.length]} stroke="var(--card)" strokeWidth={2} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value, name) => [
                  `${formatPercent(total > 0 ? (Number(value) / total) * 100 : 0)}%`,
                  name,
                ]}
                contentStyle={{
                  background: "var(--popover)",
                  border: "1px solid var(--border)",
                  borderRadius: 8,
                  color: "var(--popover-foreground)",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
      <div className="flex flex-col gap-1.5">
        {data.map((d, i) => (
          <div key={d.name} className="flex items-center gap-2 text-xs">
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ background: CHART_COLORS[i % CHART_COLORS.length] }}
            />
            <span className="truncate text-muted-foreground">{d.name}</span>
            <span className="ml-auto shrink-0 font-medium text-foreground">
              {formatPercent(total > 0 ? (d.value / total) * 100 : 0)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
