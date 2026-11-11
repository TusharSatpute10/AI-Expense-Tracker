import React from "react"

export function StatCard({ title, value, icon, color = "#3b82f6" }) {
  return (
    <div className="stat-card">
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <span style={{ color: color, fontSize: "1.25rem" }}>{icon}</span>
        <h3>{title}</h3>
      </div>
      <div style={{ fontSize: "2rem", fontWeight: 600, color: color }}>{value}</div>
    </div>
  )
}