import React, { useState, useEffect } from "react"
import { api } from "../api/client"
import { TransactionList } from "../components/TransactionList"
import { FilterBar } from "../components/FilterBar"
import { TransactionForm } from "../components/TransactionForm"
import { Plus } from "lucide-react"

export function TransactionsPage() {
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7))
  const [transactions, setTransactions] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({ amount: "", type: "expense", category: "", description: "" })
  const [loading, setLoading] = useState(true)

  const loadTransactions = async () => {
    try {
      setLoading(true)
      const data = await api.getTransactions({ month, limit: 100 })
      setTransactions(data || [])
    } catch (e) {
      console.error("Transactions load error:", e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadTransactions()
  }, [month])

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
      loadTransactions()
    } catch (e) {
      console.error("Transaction creation failed:", e)
      alert("Failed to create transaction. Please check your input.")
    }
  }

  return (
    <div>
      <header className="page-header flex justify-between items-center">
        <div>
          <h1 className="page-title">Transactions</h1>
          <p className="page-subtitle">View and manage all your transactions.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>
          <Plus size={20} /> New Transaction
        </button>
      </header>

      {showForm && (
        <TransactionForm
          open={showForm}
          onClose={() => setShowForm(false)}
          onSubmit={handleSubmit}
          formData={formData}
          setFormData={setFormData}
        />
      )}

      <div className="card">
        <div className="card-title">All Transactions</div>
        <FilterBar month={month} onMonthChange={setMonth} />
        <div className="table-container">
          {loading ? (
            <div className="empty-state">
              <div className="skeleton skeleton-text"></div>
              <div className="skeleton skeleton-text"></div>
            </div>
          ) : (
            <TransactionList transactions={transactions} />
          )}
        </div>
      </div>
    </div>
  )
}
