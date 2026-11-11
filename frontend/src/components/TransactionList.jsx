import React, { useState, useEffect } from "react"
import {
  Trash2,
  ArrowUpRight,
  ArrowDownRight,
  Tag,
  FileText,
} from "lucide-react"

import { api } from "../api/client"

export function TransactionList({ transactions }) {
  const [txns, setTxns] = useState(transactions)

  useEffect(() => {
    setTxns(transactions)
  }, [transactions])

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this transaction?")) {
      try {
        await api.deleteTransaction(id)
        setTxns(txns.filter((t) => t.id !== id))
      } catch (e) {
        console.error("Failed to delete transaction:", e)
      }
    }
  }

  const formatAmount = (amount, type) => {
    const formatted = Math.abs(amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    return type === "income" ? `+$${formatted}` : `-$${formatted}`
  }

  return (
    <table>
      <thead>
        <tr>
          <th>Date</th>
          <th>Type</th>
          <th>Category</th>
          <th>Amount</th>
          <th>Description</th>
          <th style={{ textAlign: "right" }}>Actions</th>
        </tr>
      </thead>
      <tbody>
        {txns.map((t) => (
          <tr key={t.id}>
            <td className="text-secondary font-medium">
              {new Date(t.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
            </td>
            <td>
              <span className={`badge badge-${t.type} text-xs font-semibold px-sm py-xs rounded flex items-center gap-xs`}>
                {t.type === "income" ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                {t.type.charAt(0).toUpperCase() + t.type.slice(1)}
              </span>
            </td>
            <td>
              <div className="flex items-center gap-sm">
                {t.category_color ? (
                  <span
                    style={{
                      width: "10px",
                      height: "10px",
                      backgroundColor: t.category_color,
                      borderRadius: "50%",
                      display: "inline-block"
                    }}
                  />
                ) : (
                  <Tag size={14} className="text-muted" />
                )}
                <span className="font-medium">{t.category_name || "Uncategorized"}</span>
              </div>
            </td>
            <td className={`font-bold ${t.type === "income" ? "text-success" : "text-main"}`} style={{ color: t.type === "income" ? "var(--success)" : "inherit" }}>
              {formatAmount(t.amount, t.type)}
            </td>
            <td className="text-muted">{t.description || "—"}</td>
            <td style={{ textAlign: "right" }}>
              <button
                onClick={() => handleDelete(t.id)}
                className="btn btn-danger btn-sm"
                title="Delete Transaction"
              >
                <Trash2 size={14} /> Delete
              </button>
            </td>
          </tr>
        ))}
        {txns.length === 0 && (
          <tr>
            <td colSpan={6}>
              <div className="empty-state">
                <div className="empty-state-icon"><FileText size={48} /></div>
                <div className="empty-state-title">No transactions found</div>
                <div className="empty-state-description">Get started by creating your first income or expense transaction.</div>
              </div>
            </td>
          </tr>
        )}
      </tbody>
    </table>
  )
}