import React from "react"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"

export function MonthlyChart({ month, data }) {
  if (!data || data.length === 0) {
    return (
      <div style={{ height: 300, display: "flex", justifyContent: "center", alignItems: "center", color: "#6b7280" }}>
        No data for this month
      </div>
    )
  }

  return (
    <div style={{ height: 400, width: "100%" }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={5}
            dataKey="amount"
            nameKey="category"
            label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color || "#3b82f6"} />
            ))}
          </Pie>
          <Tooltip />
          <Legend verticalAlign="bottom" height={36} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}