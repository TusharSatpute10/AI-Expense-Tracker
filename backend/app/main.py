"""FastAPI Application Entry Point."""
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from . import crud, models, schemas, database

app = FastAPI(title="AI Expense Tracker API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize DB on startup
@app.on_event("startup")
def startup_event():
    database.init_db()
    db = next(database.get_db())
    crud.seed_default_categories(db)


# ==========================================
# CATEGORIES ENDPOINTS
# ==========================================

@app.get("/api/categories", response_model=List[schemas.Category])
def read_categories(category_type: Optional[str] = None, db: Session = Depends(database.get_db)):
    return crud.get_categories(db, category_type=category_type)


@app.post("/api/categories", response_model=schemas.Category)
def create_category(category: schemas.CategoryCreate, db: Session = Depends(database.get_db)):
    db_category = crud.get_category_by_name(db, name=category.name)
    if db_category:
        raise HTTPException(status_code=400, detail="Category already exists")
    return crud.create_category(db, category=category)


@app.delete("/api/categories/{category_id}")
def delete_category(category_id: int, db: Session = Depends(database.get_db)):
    if not crud.delete_category(db, category_id):
        raise HTTPException(status_code=404, detail="Category not found")
    return {"message": "Category deleted"}


# ==========================================
# TRANSACTIONS ENDPOINTS
# ==========================================

@app.get("/api/transactions", response_model=List[schemas.Transaction])
def read_transactions(
    skip: int = 0,
    limit: int = 100,
    type: Optional[str] = None,
    category_id: Optional[int] = None,
    month: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(database.get_db)
):
    return crud.get_transactions(db, skip=skip, limit=limit, transaction_type=type, category_id=category_id, month=month, search=search)


@app.post("/api/transactions", response_model=schemas.Transaction)
def create_transaction(transaction: schemas.TransactionCreate, db: Session = Depends(database.get_db)):
    return crud.create_transaction(db, transaction=transaction)


@app.put("/api/transactions/{transaction_id}", response_model=schemas.Transaction)
def update_transaction(transaction_id: int, transaction: schemas.TransactionUpdate, db: Session = Depends(database.get_db)):
    db_tx = crud.update_transaction(db, transaction_id, transaction)
    if not db_tx:
        raise HTTPException(status_code=404, detail="Transaction not found")
    return db_tx


@app.delete("/api/transactions/{transaction_id}")
def delete_transaction(transaction_id: int, db: Session = Depends(database.get_db)):
    if not crud.delete_transaction(db, transaction_id):
        raise HTTPException(status_code=404, detail="Transaction not found")
    return {"message": "Transaction deleted"}


# ==========================================
# DASHBOARD & ANALYTICS ENDPOINTS
# ==========================================

@app.get("/api/dashboard", response_model=schemas.DashboardResponse)
def get_dashboard(month: str = datetime.utcnow().strftime("%Y-%m"), db: Session = Depends(database.get_db)):
    summary = crud.get_monthly_summary(db, month)
    transactions = crud.get_transactions(db, limit=10, month=month)

    # Map to custom response model
    recent_transactions = []
    for t in transactions:
        recent_transactions.append(schemas.TransactionWithCategory(
            id=t.id,
            amount=t.amount,
            type=t.type,
            category_id=t.category_id,
            description=t.description,
            date=t.date,
            created_at=t.created_at,
            category_name=t.category.name if t.category else None,
            category_color=t.category.color if t.category else None
        ))

    return schemas.DashboardResponse(
        total_income=summary["total_income"],
        total_expenses=summary["total_expenses"],
        balance=summary["balance"],
        month=month,
        recent_transactions=recent_transactions,
        category_breakdown=crud.get_category_spending(db, month),
        budget_status=crud.get_budget_status(db, month)
    )


# ==========================================
# BUDGETS ENDPOINTS
# ==========================================

@app.get("/api/budgets", response_model=List[schemas.Budget])
def read_budgets(month: Optional[str] = None, db: Session = Depends(database.get_db)):
    return crud.get_budgets(db, month=month)


@app.post("/api/budgets", response_model=schemas.Budget)
def set_budget(budget: schemas.BudgetCreate, db: Session = Depends(database.get_db)):
    return crud.set_budget(db, budget)


@app.delete("/api/budgets/{budget_id}")
def delete_budget(budget_id: int, db: Session = Depends(database.get_db)):
    if not crud.delete_budget(db, budget_id):
        raise HTTPException(status_code=404, detail="Budget not found")
    return {"message": "Budget deleted"}
