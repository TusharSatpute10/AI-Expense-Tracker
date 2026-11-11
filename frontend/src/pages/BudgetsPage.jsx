import React, { useState, useEffect } from "react"
import { api } from "../api/client"
import { Plus, Trash2 } from "lucide-react"
import { FilterBar } from "../components/FilterBar"

export function BudgetsPage() {
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7))
  const [budgets, setBudgets] = useState([])
  const [categories, setCategories] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({ category_id: "", amount: "" })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [spentByCategory, setSpentByCategory] = useState({})

  useEffect(() => {
    loadData()
  }, [month])

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)
      const [budgetData, categoriesData] = await Promise.all([
        api.getBudgets(month),
        api.getCategories("expense")
      ])
      setBudgets(budgetData || [])
      setCategories(categoriesData || [])

      // Fetch spending data for each budgeted category
      const spendingData = {}
      for (const budget of budgetData || []) {
        const txns = await api.getTransactions({
          month,
          type: "expense",
          category_id: budget.category_id
        })
        const total = (txns || []).reduce((sum, t) => sum + t.amount, 0)
        spendingData[budget.id] = total
      }
      setSpentByCategory(spendingData)
    } catch (e) {
      console.error("Budgets load error:", e)
      setError("Failed to load budgets. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.category_id || !formData.amount) return

    try {
      await api.createBudget({
        category_id: parseInt(formData.category_id),
        amount: parseFloat(formData.amount),
        month: month
      })
      setFormData({ category_id: "", amount: "" })
      setShowForm(false)
      loadData()
    } catch (e) {
      console.error("Budget creation failed:", e)
      alert("Failed to create budget. Please check your input.")
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this budget?")) return

    try {
      await api.deleteBudget(id)
      setBudgets(budgets.filter(b => b.id !== id))
    } catch (e) {
      console.error("Budget deletion failed:", e)
      alert("Failed to delete budget. Please try again.")
    }
  }

  const getBudgetForCategory = (categoryId) => {
    return budgets.find(b => b.category_id === categoryId)
  }

  return (
    <div>
      <header className="page-header flex justify-between items-center">
        <div>
          <h1 className="page-title">Budgets</h1>
          <p className="page-subtitle">Set and manage monthly spending limits.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          <Plus size={20} /> Set Budget
        </button>
      </header>

      <FilterBar month={month} onMonthChange={setMonth} style={{ marginBottom: "1.5rem" }} />

      {showForm && (
        <div className="card mb-xl">
          <div className="card-title">Add New Budget</div>
          <form onSubmit={handleSubmit} style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: "1rem", alignItems: "end" }}>
            <div className="form-group mb-0">
              <label className="form-label">Category</label>
              <select
                className="form-control form-select"
                value={formData.category_id}
                onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
              >
                <option value="">Select a category...</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group mb-0">
              <label className="form-label">Monthly Limit ($)</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                className="form-control"
                placeholder="Enter amount..."
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              />
            </div>
            <div className="flex items-end gap-sm">
              <button type="submit" className="btn btn-primary">
                Add
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="card">
        <div className="card-title">Budget Progress</div>

        {loading ? (
          <div className="empty-state">
            <div className="skeleton skeleton-text"></div>
            <div className="skeleton skeleton-text"></div>
            <div className="skeleton skeleton-text"></div>
          </div>
        ) : error ? (
          <div className="empty-state">
            <div className="empty-state-title text-danger">{error}</div>
            <button className="btn btn-secondary mt-lg" onClick={loadData}>
              Retry
            </button>
          </div>
        ) : budgets.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon"><Trash2 size={48} /></div>
            <div className="empty-state-title">No budgets set</div>
            <div className="empty-state-description">
              Set monthly budget limits to track your spending against each category.
            </div>
            <button
              className="btn btn-primary mt-lg"
              onClick={() => setShowForm(true)}
            >
              <Plus size={16} /> Create Your First Budget
            </button>
          </div>
        ) : (
          <div style={{ display: "grid", gap: "1.5rem" }}>
            {budgets.map((budget) => {
              const spent = spentByCategory[budget.id] || 0
              const limit = budget.amount
              const remaining = limit - spent
              const percentageUsed = limit > 0 ? (spent / limit) * 100 : 0
              const category = categories.find(c => c.id === budget.category_id)

              return (
                <div key={budget.id} className="border rounded-lg p-lg">
                  <div className="flex justify-between items-start mb-md">
                    <div className="flex items-center gap-sm">
                      {category?.color && (
                        <span
                          style={{
                            width: "12px",
                            height: "12px",
                            backgroundColor: category.color,
                            borderRadius: "50%",
                            display: "inline-block"
                          }}
                        />
                      )}
                      <div>
                        <div className="font-semibold text-lg">{category?.name || `Category #${budget.category_id}`}</div>
                        <div className="text-sm text-muted">
                          {new Date(month + "-01").toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDelete(budget.id)}
                      className="btn btn-danger btn-sm"
                      title="Delete Budget"
                    >
                      <Trash2 size={14} /> Delete
                    </button>
                  </div>

                  <div className="mb-sm">
                    <div className="text-sm text-muted mb-xs">Spent vs Budget</div>
                    <div className="flex justify-between text-base font-medium">
                      <span className="text-danger">${spent.toFixed(2)}</span>
                      <span className="text-success">${limit.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="w-full h-3 bg-tertiary rounded-full overflow-hidden mb-xs">
                    <div
                      className="h-full transition-all duration-300"
                      style={{
                        width: `${Math.min(percentageUsed, 100)}%`,
                        backgroundColor: percentageUsed > 100 ? "var(--danger)" : "var(--primary)"
                      }}
                    />
                  </div>

                  <div className="flex justify-between text-xs text-muted">
                    <span>{percentageUsed.toFixed(1)}% used</span>
                    <span className={remaining >= 0 ? "text-success" : "text-danger"}>
                      {remaining >= 0
                        ? `$${remaining.toFixed(2)} remaining`
                        : `-$${Math.abs(remaining).toFixed(2)} over budget`}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
