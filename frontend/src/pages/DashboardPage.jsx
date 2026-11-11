import React, { useState, useEffect } from "react"
import { api } from "../api/client"
import { TransactionList } from "../components/TransactionList"
import { FilterBar } from "../components/FilterBar"
import { TransactionForm } from "../components/TransactionForm"
import { MonthlyChart } from "../components/MonthlyChart"
import { MonthlyIncomeExpenseChart } from "../components/MonthlyIncomeExpenseChart"
import { BudgetTracker } from "../components/BudgetTracker"
import { Plus, TrendingUp, TrendingDown, Wallet } from "lucide-react"

export function DashboardPage({ month, onMonthChange, dashboard, transactions, showForm, setShowForm, formData, setFormData, handleSubmit, onRefresh }) {
  return (
    <div>
      <header className="page-header flex justify-between items-center">
        <div>
          <h1 className="page-title">Financial Overview</h1>
          <p className="page-subtitle">Track your income, expenses, and budget progress.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>
          <Plus size={20} /> New Transaction
        </button>
      </header>

      {dashboard ? (
        <div className="dashboard-grid">
          <div className="summary-card income">
            <div className="card-header">
              <div className="card-icon income"><TrendingUp size={24} /></div>
              <h3 className="card-title">Total Income</h3>
            </div>
            <div className="card-value">${dashboard.total_income.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
            <div className="card-change positive"><TrendingUp size={16} /> Income recorded</div>
          </div>
          <div className="summary-card expense">
            <div className="card-header">
              <div className="card-icon expense"><TrendingDown size={24} /></div>
              <h3 className="card-title">Total Expenses</h3>
            </div>
            <div className="card-value">${dashboard.total_expenses.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
            <div className="card-change negative"><TrendingDown size={16} /> Expenses logged</div>
          </div>
          <div className={`summary-card balance ${dashboard.balance >= 0 ? "positive" : "negative"}`}>
            <div className="card-header">
              <div className={`card-icon balance ${dashboard.balance >= 0 ? "positive" : "negative"}`}><Wallet size={24} /></div>
              <h3 className="card-title">Balance</h3>
            </div>
            <div className="card-value">${dashboard.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
            <div className={`card-change ${dashboard.balance >= 0 ? "positive" : "negative"}`}>
              {dashboard.balance >= 0 ? "Healthy" : "Deficit"} status
            </div>
          </div>
        </div>
      ) : (
        <div className="dashboard-grid">
          {[1, 2, 3].map((i) => <div key={i} className="summary-card skeleton" style={{ height: 160 }} />)}
        </div>
      )}

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
        <div className="card-title">
          Recent Transactions
        </div>
        <FilterBar month={month} onMonthChange={onMonthChange} />
        <div className="table-container">
          <TransactionList transactions={transactions} onRefresh={onRefresh} />
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: "2rem" }}>
        {dashboard && (
          <div className="card">
            <h2 className="card-title">Monthly Income vs Expenses</h2>
            <MonthlyIncomeExpenseChart
              month={month}
              totalIncome={dashboard.total_income}
              totalExpenses={dashboard.total_expenses}
            />
          </div>
        )}
        {dashboard && (
          <div className="card">
            <h2 className="card-title">Monthly Expense Distribution</h2>
            <MonthlyChart month={month} data={dashboard.category_breakdown} />
          </div>
        )}
        {dashboard && (
          <div className="card">
            <h2 className="card-title">Monthly Budget Tracking</h2>
            <BudgetTracker month={month} />
          </div>
        )}
      </div>
    </div>
  )
}
