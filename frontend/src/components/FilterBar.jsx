import React, { useState } from "react"
import { api } from "../api/client"

export function FilterBar({ month, onMonthChange }) {
  const [search, setSearch] = useState("")

  const handleSearch = async (e) => {
    setSearch(e.target.value)
  }

  return (
    <div style={{ marginBottom: "1.5rem", paddingBottom: "1rem", borderBottom: "1px solid var(--border)" }}>
      <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
        <span>Month: </span>
        <select
          value={month}
          onChange={(e) => {
            onMonthChange(e.target.value)
            setSearch("")
          }}
          style={{ padding: "0.5rem", border: "1px solid var(--border)", borderRadius: "4px" }}
        >
          <option value="2026-01">January 2026</option>
          <option value="2026-02">February 2026</option>
          <option value="2026-03">March 2026</option>
          <option value="2026-04">April 2026</option>
          <option value="2026-05">May 2026</option>
          <option value="2026-06">June 2026</option>
          <option value="2026-07">July 2026</option>
          <option value="2026-08">August 2026</option>
          <option value="2026-09">September 2026</option>
          <option value="2026-10">October 2026</option>
          <option value="2026-11">November 2026</option>
          <option value="2026-12">December 2026</option>
        </select>

        <input
          type="text"
          placeholder="Search description..."
          value={search}
          onChange={handleSearch}
          style={{ padding: "0.5rem", border: "1px solid var(--border)", borderRadius: "4px", flex: 1 }}
        />
      </div>
    </div>
  )
}