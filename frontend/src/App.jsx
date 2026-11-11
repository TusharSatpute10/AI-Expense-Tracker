import React, { useState, useEffect } from "react"
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useLocation,
} from "react-router-dom"
import {
  LayoutDashboard,
  ReceiptText,
  PieChart,
  Settings,
  Plus,
  Wallet,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Menu,
  X,
} from "./icons"
import { api } from "./api/client"
import { TransactionForm } from "./components/TransactionForm"
import { FilterBar } from "./components/FilterBar"
import { TransactionList } from "./components/TransactionList"
import { MonthlyChart } from "./components/MonthlyChart"
import { BudgetTracker } from "./components/BudgetTracker"
import { DashboardPage } from "./pages/DashboardPage"
import { TransactionsPage } from "./pages/TransactionsPage"
import { BudgetsPage } from "./pages/BudgetsPage"
import { AnalyticsPage } from "./pages/AnalyticsPage"
import SettingsPage from "./pages/SettingsPage"
import "./styles/theme.css"

// Navigation component that uses useLocation inside Router context
function Sidebar({ isSidebarOpen, toggleSidebar, theme, toggleTheme }) {
  const location = useLocation()

  const navItems = [
    { path: "/", label: "Dashboard", icon: LayoutDashboard },
    { path: "/transactions", label: "Transactions", icon: ReceiptText },
    { path: "/budgets", label: "Budgets", icon: PieChart },
    { path: "/analytics", label: "Analytics", icon: TrendingUp },
    { path: "/settings", label: "Settings", icon: Settings },
  ]

  return (
    <aside className={`sidebar ${isSidebarOpen ? "open" : ""}`}>
      <div className="sidebar-brand">
        <Wallet size={24} />
        <span>ExpenseTracker</span>
      </div>
      <nav className="sidebar-nav">
        {navItems.map(({ path, label, icon: Icon }) => (
          <Link
            key={path}
            to={path}
            className={`nav-item ${location.pathname === path ? "active" : ""}`}
            onClick={() => toggleSidebar()}
          >
            <Icon size={20} /> {label}
          </Link>
        ))}
      </nav>
      <div className="mt-auto">
        <button className="btn btn-secondary w-full" onClick={toggleTheme}>
          {theme === "light" ? "🌙 Dark Mode" : "☀️ Light Mode"}
        </button>
      </div>
    </aside>
  )
}

export function App() {
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7))
  const [transactions, setTransactions] = useState([])
  const [dashboard, setDashboard] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({ amount: "", type: "expense", category: "", description: "" })
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'light'
  })

  useEffect(() => {
    loadDashboardData()
    loadTransactions()
  }, [month])

  useEffect(() => {
    localStorage.setItem('theme', theme)
    document.documentElement.setAttribute("data-theme", theme)
  }, [theme])

  const loadDashboardData = async () => {
    try {
      const data = await api.getDashboard(month)
      setDashboard(data)
    } catch (e) {
      console.error("Dashboard load error:", e)
    }
  }

  const loadTransactions = async () => {
    try {
      const data = await api.getTransactions({ month, limit: 15 })
      setTransactions(data || [])
    } catch (e) {
      console.error("Transactions load error:", e)
    }
  }

  // Shared refresh function that updates both dashboard and transactions
  const refreshAllData = async () => {
    await Promise.all([loadDashboardData(), loadTransactions()])
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.amount || !formData.type || !formData.category) return

    try {
      await api.createTransaction({
        amount: parseFloat(formData.amount),
        type: formData.type,
        category_id: formData.category,
        description: formData.description
      })

      setFormData({ amount: "", type: "expense", category: "", description: "" })
      setShowForm(false)
      refreshAllData()
    } catch (e) {
      console.error("Transaction creation failed:", e)
      alert("Failed to create transaction.")
    }
  }

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light")
  }

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  // Close sidebar when route changes
  useEffect(() => {
    setIsSidebarOpen(false)
  }, [month])

  return (
    <Router>
      <div className="app-layout">
        <button
          className="btn btn-icon sidebar-toggle-btn"
          onClick={toggleSidebar}
          aria-label="Toggle navigation"
          style={{ position: "fixed", top: "1rem", left: "1rem", zIndex: 1060 }}
        >
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        <Sidebar
          isSidebarOpen={isSidebarOpen}
          toggleSidebar={toggleSidebar}
          theme={theme}
          toggleTheme={toggleTheme}
        />

        <main className="main-content">
          <Routes>
            <Route path="/" element={
              <DashboardPage
                month={month}
                onMonthChange={setMonth}
                dashboard={dashboard}
                transactions={transactions}
                showForm={showForm}
                setShowForm={setShowForm}
                formData={formData}
                setFormData={setFormData}
                handleSubmit={handleSubmit}
                onRefresh={refreshAllData}
              />
            } />
            <Route path="/transactions" element={<TransactionsPage refreshData={refreshAllData} />} />
            <Route path="/budgets" element={<BudgetsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}
