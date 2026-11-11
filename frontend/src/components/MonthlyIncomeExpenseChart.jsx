import React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

export function MonthlyIncomeExpenseChart({ month, totalIncome, totalExpenses }) {
  const data = [
    { name: "Income", value: totalIncome, color: "#10b981" },
    { name: "Expenses", value: totalExpenses, color: "#ef4444" },
  ];

  return (
    <div style={{ height: 300, width: "100%" }}>
      <ResponsiveContainer>
        <BarChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="name"
            label={{ value: "Income vs Expenses", position: "bottom" }}
          />
          <YAxis
            label={{ value: "Amount ($)", angle: -90, position: "insideLeft" }}
          />
          <Tooltip />
          <Legend />
          <Bar dataKey="value" name="Amount" fill="#3b82f6" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
