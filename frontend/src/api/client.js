const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

async function request(path, options = {}) {
  const url = `${API_BASE}${path}`;
  const config = {
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options,
  };

  if (options.body && typeof options.body !== "string") {
    config.body = JSON.stringify(options.body);
  }

  const response = await fetch(url, config);
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message = data?.detail || `Request failed with status ${response.status}`;
    throw new Error(message);
  }

  return data;
}

export const api = {
  // Categories
  getCategories: (type) => request(`/api/categories${type ? `?category_type=${type}` : ""}`),
  createCategory: (body) => request("/api/categories", { method: "POST", body }),
  deleteCategory: (id) => request(`/api/categories/${id}`, { method: "DELETE" }),

  // Transactions
  getTransactions: (params = {}) => {
    const qs = new URLSearchParams();
    if (params.type) qs.set("type", params.type);
    if (params.category_id) qs.set("category_id", params.category_id);
    if (params.month) qs.set("month", params.month);
    if (params.search) qs.set("search", params.search);
    if (params.limit) qs.set("limit", params.limit);
    const query = qs.toString();
    return request(`/api/transactions${query ? `?${query}` : ""}`);
  },
  createTransaction: (body) => request("/api/transactions", { method: "POST", body }),
  updateTransaction: (id, body) => request(`/api/transactions/${id}`, { method: "PUT", body }),
  deleteTransaction: (id) => request(`/api/transactions/${id}`, { method: "DELETE" }),

  // Dashboard
  getDashboard: (month) => request(`/api/dashboard${month ? `?month=${month}` : ""}`),

  // Budgets
  getBudgets: (month) => request(`/api/budgets${month ? `?month=${month}` : ""}`),
  createBudget: (body) => request("/api/budgets", { method: "POST", body }),
  deleteBudget: (id) => request(`/api/budgets/${id}`, { method: "DELETE" }),
};

export default api;