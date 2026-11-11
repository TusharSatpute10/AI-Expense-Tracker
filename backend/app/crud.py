"""Database CRUD operations for categories, transactions, budgets, and aggregations."""
from sqlalchemy.orm import Session
from sqlalchemy import func, extract
from typing import List, Optional, Dict
from datetime import datetime
from . import models, schemas


# ==========================================
# CATEGORIES CRUD
# ==========================================

def get_category(db: Session, category_id: int) -> Optional[models.Category]:
    return db.query(models.Category).filter(models.Category.id == category_id).first()


def get_category_by_name(db: Session, name: str) -> Optional[models.Category]:
    return db.query(models.Category).filter(func.lower(models.Category.name) == func.lower(name)).first()


def get_categories(db: Session, category_type: Optional[str] = None) -> List[models.Category]:
    query = db.query(models.Category)
    if category_type:
        query = query.filter(models.Category.type == category_type)
    return query.all()


def create_category(db: Session, category: schemas.CategoryCreate) -> models.Category:
    db_category = models.Category(
        name=category.name,
        type=category.type,
        color=category.color or "#3b82f6",
        icon=category.icon or "folder"
    )
    db.add(db_category)
    db.commit()
    db.refresh(db_category)
    return db_category


def update_category(db: Session, category_id: int, category_data: schemas.CategoryCreate) -> Optional[models.Category]:
    db_category = get_category(db, category_id)
    if not db_category:
        return None
    db_category.name = category_data.name
    db_category.type = category_data.type
    if category_data.color:
        db_category.color = category_data.color
    if category_data.icon:
        db_category.icon = category_data.icon
    db.commit()
    db.refresh(db_category)
    return db_category


def delete_category(db: Session, category_id: int) -> bool:
    db_category = get_category(db, category_id)
    if not db_category:
        return False
    # Set category_id to NULL on dependent transactions before deleting
    db.query(models.Transaction).filter(models.Transaction.category_id == category_id).update({"category_id": None})
    db.query(models.Budget).filter(models.Budget.category_id == category_id).delete()
    db.delete(db_category)
    db.commit()
    return True


def seed_default_categories(db: Session):
    """Seed initial set of categories if none exist."""
    if db.query(models.Category).count() > 0:
        return

    defaults = [
        # Expenses
        {"name": "Food & Dining", "type": "expense", "color": "#ef4444", "icon": "utensils"},
        {"name": "Transportation", "type": "expense", "color": "#f59e0b", "icon": "car"},
        {"name": "Housing & Utilities", "type": "expense", "color": "#10b981", "icon": "home"},
        {"name": "Entertainment", "type": "expense", "color": "#8b5cf6", "icon": "film"},
        {"name": "Shopping", "type": "expense", "color": "#ec4899", "icon": "shopping-bag"},
        {"name": "Health & Medical", "type": "expense", "color": "#06b6d4", "icon": "activity"},
        {"name": "Education", "type": "expense", "color": "#3b82f6", "icon": "book"},
        {"name": "Miscellaneous", "type": "expense", "color": "#6b7280", "icon": "more-horizontal"},
        # Income
        {"name": "Salary", "type": "income", "color": "#10b981", "icon": "dollar-sign"},
        {"name": "Freelance", "type": "income", "color": "#3b82f6", "icon": "briefcase"},
        {"name": "Investments", "type": "income", "color": "#8b5cf6", "icon": "trending-up"},
        {"name": "Gifts & Grants", "type": "income", "color": "#f59e0b", "icon": "gift"}
    ]
    for cat in defaults:
        db.add(models.Category(**cat))
    db.commit()


# ==========================================
# TRANSACTIONS CRUD
# ==========================================

def get_transaction(db: Session, transaction_id: int) -> Optional[models.Transaction]:
    return db.query(models.Transaction).filter(models.Transaction.id == transaction_id).first()


def get_transactions(
    db: Session,
    skip: int = 0,
    limit: int = 100,
    transaction_type: Optional[str] = None,
    category_id: Optional[int] = None,
    month: Optional[str] = None,  # YYYY-MM
    search: Optional[str] = None
) -> List[models.Transaction]:
    query = db.query(models.Transaction)

    if transaction_type:
        query = query.filter(models.Transaction.type == transaction_type)

    if category_id:
        query = query.filter(models.Transaction.category_id == category_id)

    if month:
        try:
            year, m = map(int, month.split("-"))
            query = query.filter(
                extract('year', models.Transaction.date) == year,
                extract('month', models.Transaction.date) == m
            )
        except ValueError:
            pass

    if search:
        query = query.filter(models.Transaction.description.ilike(f"%{search}%"))

    return query.order_by(models.Transaction.date.desc(), models.Transaction.id.desc()).offset(skip).limit(limit).all()


def create_transaction(db: Session, transaction: schemas.TransactionCreate) -> models.Transaction:
    db_tx = models.Transaction(
        amount=transaction.amount,
        type=transaction.type,
        category_id=transaction.category_id,
        description=transaction.description or "",
        date=datetime.utcnow()
    )
    db.add(db_tx)
    db.commit()
    db.refresh(db_tx)
    return db_tx


def update_transaction(
    db: Session,
    transaction_id: int,
    transaction_update: schemas.TransactionUpdate
) -> Optional[models.Transaction]:
    db_tx = get_transaction(db, transaction_id)
    if not db_tx:
        return None

    update_data = transaction_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        if value is not None:
            setattr(db_tx, key, value)

    db.commit()
    db.refresh(db_tx)
    return db_tx


def delete_transaction(db: Session, transaction_id: int) -> bool:
    db_tx = get_transaction(db, transaction_id)
    if not db_tx:
        return False
    db.delete(db_tx)
    db.commit()
    return True


# ==========================================
# BUDGETS CRUD
# ==========================================

def get_budgets(db: Session, month: Optional[str] = None) -> List[models.Budget]:
    query = db.query(models.Budget)
    if month:
        query = query.filter(models.Budget.month == month)
    return query.all()


def get_budget_by_category_and_month(db: Session, category_id: int, month: str) -> Optional[models.Budget]:
    return db.query(models.Budget).filter(
        models.Budget.category_id == category_id,
        models.Budget.month == month
    ).first()


def set_budget(db: Session, budget_data: schemas.BudgetCreate) -> models.Budget:
    existing = get_budget_by_category_and_month(db, budget_data.category_id, budget_data.month)
    if existing:
        existing.amount = budget_data.amount
        db.commit()
        db.refresh(existing)
        return existing

    db_budget = models.Budget(
        category_id=budget_data.category_id,
        amount=budget_data.amount,
        month=budget_data.month
    )
    db.add(db_budget)
    db.commit()
    db.refresh(db_budget)
    return db_budget


def delete_budget(db: Session, budget_id: int) -> bool:
    db_budget = db.query(models.Budget).filter(models.Budget.id == budget_id).first()
    if not db_budget:
        return False
    db.delete(db_budget)
    db.commit()
    return True


# ==========================================
# AGGREGATIONS & ANALYTICS
# ==========================================

def get_monthly_summary(db: Session, month: str) -> Dict[str, float]:
    """Calculate total income, expenses, and balance for a given YYYY-MM."""
    try:
        year, m = map(int, month.split("-"))
    except ValueError:
        year, m = datetime.utcnow().year, datetime.utcnow().month

    income = db.query(func.coalesce(func.sum(models.Transaction.amount), 0.0)).filter(
        models.Transaction.type == "income",
        extract('year', models.Transaction.date) == year,
        extract('month', models.Transaction.date) == m
    ).scalar() or 0.0

    expenses = db.query(func.coalesce(func.sum(models.Transaction.amount), 0.0)).filter(
        models.Transaction.type == "expense",
        extract('year', models.Transaction.date) == year,
        extract('month', models.Transaction.date) == m
    ).scalar() or 0.0

    return {
        "total_income": float(income),
        "total_expenses": float(expenses),
        "balance": float(income - expenses),
        "month": month
    }


def get_category_spending(db: Session, month: str) -> List[Dict]:
    """Breakdown of expense spending by category for a month."""
    try:
        year, m = map(int, month.split("-"))
    except ValueError:
        year, m = datetime.utcnow().year, datetime.utcnow().month

    results = db.query(
        models.Category.name,
        models.Category.color,
        func.coalesce(func.sum(models.Transaction.amount), 0.0).label("total")
    ).join(
        models.Transaction, models.Transaction.category_id == models.Category.id
    ).filter(
        models.Transaction.type == "expense",
        extract('year', models.Transaction.date) == year,
        extract('month', models.Transaction.date) == m
    ).group_by(models.Category.id).all()

    total_expense = sum(r.total for r in results) or 1.0

    return [
        {
            "category": r.name,
            "amount": float(r.total),
            "color": r.color or "#3b82f6",
            "percentage": round((r.total / total_expense) * 100, 1)
        }
        for r in results
    ]


def get_budget_status(db: Session, month: str) -> List[Dict]:
    """Compare budgets vs actual spent for each category in a month."""
    budgets = get_budgets(db, month)
    status = []

    try:
        year, m = map(int, month.split("-"))
    except ValueError:
        year, m = datetime.utcnow().year, datetime.utcnow().month

    for b in budgets:
        spent = db.query(func.coalesce(func.sum(models.Transaction.amount), 0.0)).filter(
            models.Transaction.category_id == b.category_id,
            models.Transaction.type == "expense",
            extract('year', models.Transaction.date) == year,
            extract('month', models.Transaction.date) == m
        ).scalar() or 0.0

        cat = get_category(db, b.category_id)
        cat_name = cat.name if cat else "Unknown"
        color = cat.color if cat else "#3b82f6"

        status.append({
            "budget_id": b.id,
            "category_id": b.category_id,
            "category": cat_name,
            "color": color,
            "budget_limit": float(b.amount),
            "spent": float(spent),
            "remaining": float(b.amount - spent),
            "percentage_used": round((spent / b.amount) * 100, 1) if b.amount > 0 else 0.0
        })

    return status
