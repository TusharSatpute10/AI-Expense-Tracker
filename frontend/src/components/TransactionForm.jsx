import React, { useState } from "react"
import { api } from "../api/client"

export function TransactionForm({ open, onClose, onSubmit, formData, setFormData }) {
  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>Add Transaction</h2>
        <form onSubmit={onSubmit}>

          <div style={{ marginBottom: "1rem" }}>
            <label>Amount</label>
            <input
              type="number"
              placeholder="0.00"
              step="0.01"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              required
              style={{ width: "100%", padding: "0.5rem", marginTop: "0.25rem" }}
            />
          </div>

          <div style={{ marginBottom: "1rem" }}>
            <label>Type</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              style={{ width: "100%", padding: "0.5rem", marginTop: "0.25rem" }}
            >
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
          </div>

          <div style={{ marginBottom: "1rem" }}>
            <label>Category</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              style={{ width: "100%", padding: "0.5rem", marginTop: "0.25rem" }}
              required
            >
              <option value="">Select category...</option>
              <option value="1">Food & Dining</option>
              <option value="2">Transportation</option>
              <option value="3">Housing & Utilities</option>
              <option value="4">Entertainment</option>
              <option value="5">Shopping</option>
              <option value="6">Health & Medical</option>
              <option value="7">Education</option>
              <option value="8">Miscellaneous</option>
              <option value="9">Salary</option>
              <option value="10">Freelance</option>
              <option value="11">Investments</option>
              <option value="12">Gifts & Grants</option>
            </select>
          </div>

          <div style={{ marginBottom: "1rem" }}>
            <label>Description</label>
            <input
              placeholder="Optional description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              style={{ width: "100%", padding: "0.5rem", marginTop: "0.25rem" }}
            />
          </div>

          <div style={{ display: "flex", gap: "1rem" }}>
            <button type="submit" className="btn btn-primary">Submit</button>
            <button type="button" className="btn" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  )
}