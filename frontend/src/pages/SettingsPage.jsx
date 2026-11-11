import React, { useState, useEffect } from "react"

export default function SettingsPage() {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'light'
  })

  useEffect(() => {
    localStorage.setItem('theme', theme)
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light')
  }

  return (
    <div className="card">
      <h2 className="card-title">Settings</h2>
      <div className="form-group">
        <label className="form-label">Theme</label>
        <button
          onClick={toggleTheme}
          className="btn btn-secondary w-full"
        >
          {theme === 'light' ? '🌙 Dark Mode' : '☀️ Light Mode'}
        </button>
      </div>
    </div>
  )
}