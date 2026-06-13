"use client";

import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer } from "recharts";

interface WeeklyChartProps {
  data: { day: string; minutes: number }[];
}

export default function WeeklyChart({ data }: WeeklyChartProps) {
  const chartData = data.map((d) => ({
    day: d.day,
    valor: Math.min(Math.round((d.minutes / 60) * 100), 100),
  }));

  return (
    <ResponsiveContainer width="100%" height={110}>
      <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -35, bottom: 0 }}>
        <defs>
          <linearGradient id="gradOrange" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#F97316" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#F97316" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis
          dataKey="day"
          tick={{ fontSize: 10, fill: "#9CA3AF" }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          contentStyle={{
            borderRadius: "8px",
            border: "1px solid #E5E7EB",
            fontSize: "12px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          }}
          formatter={(v) => [`${v}%`, "Actividad"]}
          labelStyle={{ color: "#374151", fontWeight: 600 }}
        />
        <Area
          type="monotone"
          dataKey="valor"
          stroke="#F97316"
          strokeWidth={2}
          fill="url(#gradOrange)"
          dot={{ fill: "#F97316", strokeWidth: 0, r: 3 }}
          activeDot={{ r: 5, strokeWidth: 2, stroke: "#fff", fill: "#F97316" }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
