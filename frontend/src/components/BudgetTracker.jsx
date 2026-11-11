import React, { useState, useEffect } from "react"
import { api } from "../api/client"

export function BudgetTracker({ month }) {
  const [budgets, setBudgets] = useState([])
  const [categories, setCategories] = useState([])
  const [spentByCategory, setSpentByCategory] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Fetch budgets and categories in parallel
        const [budgetData, categoriesData] = await Promise.all([
          api.getBudgets(month),
          api.getCategories("expense")
        ])

        setBudgets(budgetData || [])
        setCategories(categoriesData || [])

        // Calculate spending for each budgeted category
        const spendingMap = {}
        for (const budget of budgetData || []) {
          const txns = await api.getTransactions({
            month,
            type: "expense",
            category_id: budget.category_id,
            limit: 1000
          })
          const total = (txns || []).reduce((sum, t) => sum + t.amount, 0)
          spendingMap[budget.id] = total
        }
        setSpentByCategory(spendingMap)
      } catch (e) {
        console.error("Budget data load error:", e)
        setError("Failed to load budget data.")
      } finally {
        setLoading(false)
      }
    }

    if (month) loadData()
  }, [month])

  return (
    <div className="budget-tracker">
      {loading && (
        <div className="empty-state">
          <div className="skeleton skeleton-text"></div>
          <div className="skeleton skeleton-text"></div>
        </div>
      )}

      {error && (
        <div style={{ padding: "1rem", color: "var(--danger)", textAlign: "center" }}>
          {error}
        </div>
      )}

      {!loading && !error && budgets.length === 0 && (
        <div style={{ padding: "1rem", color: "var(--text-muted)", textAlign: "center" }}>
          No budgets set for this month.
        </div>
      )}

      {!loading && budgets.map((budget) => {
        const spent = spentByCategory[budget.id] || 0
        const limit = budget.amount
        const remaining = limit - spent
        const percentageUsed = limit > 0 ? (spent / limit) * 100 : 0
        const category = categories.find(c => c.id === budget.category_id)

        return (
          <div key={budget.id} style={{
            border: "1px solid var(--border-color)",
            borderRadius: "8px",
            padding: "1rem",
            marginBottom: "0.5rem"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
              <span style={{ fontWeight: 600 }}>{category?.name || `Category #${budget.category_id}`}</span>
              <span>${spent.toFixed(2)} / ${limit.toFixed(2)}</span>
            </div>

            <div style={{ width: "100%", height: "8px", background: "var(--bg-tertiary)", borderRadius: "4px", overflow: "hidden" }}>
              <div
                style={{
                  width: `${Math.min(percentageUsed, 100)}%`,
                  height: "100%",
                  background: percentageUsed > 100 ? "var(--danger)" : category?.color || "var(--primary)",
                  transition: "width 0.3s ease",
                }}
              />
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "0.25rem", fontSize: "0.75rem" }}>
              <span style={{ color: percentageUsed > 100 ? "var(--danger)" : "var(--text-muted)" }}>
                {percentageUsed.toFixed(1)}% used
              </span>
              <span style={{ color: remaining >= 0 ? "var(--success)" : "var(--danger)" }}>
                {remaining >= 0 ? `$${remaining.toFixed(2)} left` : `-$${Math.abs(remaining).toFixed(2)} over`}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
