import React, { useState } from "react"
import { api } from "../api/client"

export function FilterBar({ month, onMonthChange }) {
  const [search, setSearch] = useState("")

  const handleSearch = async (e) => {
    setSearch(e.target.value)
  }

  // Generate dynamic month options for the current year and next year
  const generateMonthOptions = () => {
    const options = []
    const currentYear = new Date().getFullYear()

    for (let year = currentYear; year <= currentYear + 1; year++) {
      for (let m = 1; m <= 12; m++) {
        const monthStr = `${year}-${String(m).padStart(2, '0')}`
        const monthName = new Date(year, m - 1).toLocaleString('default', { month: 'long' })
        options.push({ value: monthStr, label: `${monthName} ${year}` })
      }
    }

    return options
  }

  const monthOptions = generateMonthOptions()

  return (
    <div style={{ marginBottom: "1.5rem", paddingBottom: "1rem", borderBottom: "1px solid var(--border-color)" }}>
      <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
        <span>Month: </span>
        <select
          value={month}
          onChange={(e) => {
            onMonthChange(e.target.value)
            setSearch("")
          }}
          style={{ padding: "0.5rem", border: "1px solid var(--border-color)", borderRadius: "4px", background: "var(--bg-card)" }}
        >
          {monthOptions.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>

        <input
          type="text"
          placeholder="Search description..."
          value={search}
          onChange={handleSearch}
          style={{ padding: "0.5rem", border: "1px solid var(--border-color)", borderRadius: "4px", flex: 1, background: "var(--bg-main)", color: "var(--text-main)" }}
        />
      </div>
    </div>
  )
}