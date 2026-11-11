import React, { useState, useEffect } from "react"
import { api } from "../api/client"
import {
  TrendingUp,
  TrendingDown,
  PieChart as PieIcon,
  BarChart2,
  AlertTriangle,
  Award,
  DollarSign
} from "lucide-react"
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid
} from "recharts"

export function AnalyticsPage() {
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7))
  const [dashboard, setDashboard] = useState(null)
  const [budgets, setBudgets] = useState([])
  const [trends, setTrends] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadAnalytics() {
      try {
        setLoading(true)
        const [dashData, budgetData, trendData] = await Promise.all([
          api.getDashboard(month),
          api.getBudgets(month),
          api.getSpendingTrends ? api.getSpendingTrends({ month }) : Promise.resolve([])
        ])
        setDashboard(dashData)
        setBudgets(budgetData || [])
        setTrends(trendData || [])
      } catch (e) {
        console.error("Failed to load analytics:", e)
      } finally {
        setLoading(false)
      }
    }
    loadAnalytics()
  }, [month])

  // Savings rate calculation
  const totalIncome = dashboard?.total_income || 0
  const totalExpenses = dashboard?.total_expenses || 0
  const savings = totalIncome - totalExpenses
  const savingsRate = totalIncome > 0 ? ((savings / totalIncome) * 100).toFixed(1) : 0

  // Category-wise spending
  const categoryBreakdown = dashboard?.category_breakdown || []

  // Insights generation
  const highestCategory = categoryBreakdown.reduce((max, cat) => cat.amount > (max?.amount || 0) ? cat : max, null)
  const insights = []
  if (highestCategory) {
    insights.push({
      title: "Highest Spending Category",
      desc: `Your highest spending is in ${highestCategory.category} with $${highestCategory.amount.toLocaleString()}.`,
      icon: Award,
      type: "warning"
    })
  }
  if (Number(savingsRate) < 20 && totalIncome > 0) {
    insights.push({
      title: "Low Savings Rate Alert",
      desc: `Your current savings rate is ${savingsRate}%. Aim for at least 20% savings for financial health.`,
      icon: AlertTriangle,
      type: "danger"
    })
  } else if (Number(savingsRate) >= 20) {
    insights.push({
      title: "Great Savings Rate!",
      desc: `You are saving ${savingsRate}% of your income this month. Keep up the good work!`,
      icon: TrendingUp,
      type: "success"
    })
  }

  return (
    <div>
      <header className="page-header flex justify-between items-center">
        <div>
          <h1 className="page-title">Advanced Analytics</h1>
          <p className="page-subtitle">Deep dive into your spending habits, trends, and financial health.</p>
        </div>
        <div>
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="form-control"
            style={{ width: "auto" }}
          />
        </div>
      </header>

      {/* Summary Metrics Row */}
      <div className="dashboard-grid">
        <div className="summary-card income">
          <div className="card-header">
            <div className="card-icon income"><DollarSign size={24} /></div>
            <h3 className="card-title">Savings Rate</h3>
          </div>
          <div className="card-value">{savingsRate}%</div>
          <div className={`card-change ${Number(savingsRate) >= 0 ? "positive" : "negative"}`}>
            ${savings.toLocaleString(undefined, { minimumFractionDigits: 2 })} saved this month
          </div>
        </div>
        <div className="summary-card expense">
          <div className="card-header">
            <div className="card-icon expense"><PieIcon size={24} /></div>
            <h3 className="card-title">Top Expense Category</h3>
          </div>
          <div className="card-value" style={{ fontSize: "1.75rem" }}>
            {highestCategory ? highestCategory.category : "None"}
          </div>
          <div className="card-change negative">
            {highestCategory ? `$${highestCategory.amount.toLocaleString()} spent` : "No expenses"}
          </div>
        </div>
        <div className="summary-card balance positive">
          <div className="card-header">
            <div className="card-icon balance positive"><TrendingUp size={24} /></div>
            <h3 className="card-title">Income vs Expense Ratio</h3>
          </div>
          <div className="card-value">
            {totalExpenses > 0 ? (totalIncome / totalExpenses).toFixed(2) : "∞"}
          </div>
          <div className="card-change positive">Coverage multiplier</div>
        </div>
      </div>

      {/* Financial Insights Section */}
      <div className="card">
        <h2 className="card-title">💡 Financial Insights & Patterns</h2>
        <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))" }}>
          {insights.map((ins, idx) => {
            const IconComponent = ins.icon
            return (
              <div key={idx} className="p-lg rounded border bg-secondary flex items-center gap-md">
                <div style={{ padding: "10px", borderRadius: "50%", background: "var(--bg-card)" }}>
                  <IconComponent size={24} className="text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold mb-sm">{ins.title}</h4>
                  <p className="text-muted text-sm m-0">{ins.desc}</p>
                </div>
              </div>
            )
          })}
          {insights.length === 0 && (
            <p className="text-muted">No insights available for this month yet. Add more transactions to unlock analytics.</p>
          )}
        </div>
      </div>

      {/* Charts Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(500px, 1fr))", gap: "2rem", marginBottom: "2rem" }}>
        {/* Category-wise Spending (Donut Chart) */}
        <div className="card">
          <h2 className="card-title">Category-wise Spending (Donut Chart)</h2>
          <div style={{ height: 350, width: "100%" }}>
            {categoryBreakdown.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryBreakdown}
                    dataKey="amount"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={110}
                    paddingAngle={4}
                    label={({ category, percentage }) => `${category}: ${percentage}%`}
                  >
                    {categoryBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color || "#3b82f6"} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, "Amount"]} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="empty-state">
                <div className="empty-state-title">No spending data</div>
                <div className="empty-state-description">Record expenses in this month to see category distribution.</div>
              </div>
            )}
          </div>
        </div>

        {/* Budget vs Actual */}
        <div className="card">
          <h2 className="card-title">Budget vs Actual Spending</h2>
          <div style={{ height: 350, width: "100%", overflowY: "auto" }}>
            {dashboard?.budget_status && dashboard.budget_status.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {dashboard.budget_status.map((b) => (
                  <div key={b.budget_id} className="p-md rounded border bg-secondary">
                    <div className="flex justify-between items-center mb-sm">
                      <span className="font-semibold" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ width: 10, height: 10, borderRadius: "50%", background: b.color }} />
                        {b.category}
                      </span>
                      <span className="text-sm">
                        ${b.spent.toLocaleString()} / <strong>${b.budget_limit.toLocaleString()}</strong>
                      </span>
                    </div>
                    <div style={{ width: "100%", background: "var(--border-color)", height: "8px", borderRadius: "4px", overflow: "hidden" }}>
                      <div
                        style={{
                          width: `${Math.min(b.percentage_used, 100)}%`,
                          background: b.percentage_used > 100 ? "var(--danger)" : "var(--primary)",
                          height: "100%"
                        }}
                      />
                    </div>
                    <div className="flex justify-between items-center mt-xs text-xs text-muted">
                      <span>{b.percentage_used}% used</span>
                      <span>{b.remaining >= 0 ? `$${b.remaining.toLocaleString()} remaining` : `$${Math.abs(b.remaining).toLocaleString()} over budget!`}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-state-title">No Budgets Set</div>
                <div className="empty-state-description">Set budgets on the Budgets page to compare limits against actual spending.</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AnalyticsPage
