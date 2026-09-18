import {
  Area,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

interface FanChartProps {
  data: Array<Record<string, number>>
  xKey: string
  p10Key: string
  p50Key: string
  p90Key: string
  p50Name?: string
  bandName?: string
  color?: string
  extraLine?: { key: string; name: string; color?: string }
  xTickFormatter?: (value: number) => string
  yTickFormatter?: (value: number) => string
  tooltipFormatter?: (value: number) => string
}

export function FanChart({
  data,
  xKey,
  p10Key,
  p50Key,
  p90Key,
  p50Name = "มัธยฐาน (Median)",
  bandName = "ช่วง 10th–90th percentile",
  color = "var(--chart-1)",
  extraLine,
  xTickFormatter = (v) => `${v}`,
  yTickFormatter = (v) => `${v}`,
  tooltipFormatter = (v) => `${v}`,
}: FanChartProps) {
  const chartData = data.map((d) => ({ ...d, __band: d[p90Key] - d[p10Key] }))

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart data={chartData} margin={{ top: 8, right: 16, left: 8, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
        <XAxis dataKey={xKey} tickFormatter={xTickFormatter} className="text-xs" stroke="var(--muted-foreground)" />
        <YAxis tickFormatter={yTickFormatter} className="text-xs" stroke="var(--muted-foreground)" width={56} />
        <Tooltip
          formatter={(value) => tooltipFormatter(Number(value))}
          labelFormatter={(v) => xTickFormatter(Number(v))}
          contentStyle={{
            background: "var(--popover)",
            border: "1px solid var(--border)",
            borderRadius: 8,
            color: "var(--popover-foreground)",
          }}
        />
        <Legend />
        {extraLine && (
          <Line
            type="monotone"
            dataKey={extraLine.key}
            name={extraLine.name}
            stroke={extraLine.color ?? "var(--chart-2)"}
            strokeWidth={2}
            dot={false}
          />
        )}
        <Area dataKey={p10Key} stackId="band" stroke="none" fill="transparent" legendType="none" name="" />
        <Area dataKey="__band" stackId="band" stroke="none" fill={color} fillOpacity={0.15} name={bandName} />
        <Line type="monotone" dataKey={p50Key} name={p50Name} stroke={color} strokeWidth={2.5} dot={false} />
      </ComposedChart>
    </ResponsiveContainer>
  )
}
