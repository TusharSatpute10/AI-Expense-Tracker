"""Pydantic schemas for API validation."""
from pydantic import BaseModel, field_validator
from typing import Optional, List
from datetime import datetime


class CategoryBase(BaseModel):
    name: str
    type: str  # "income" or "expense"
    color: Optional[str] = "#3b82f6"
    icon: Optional[str] = "folder"

    @field_validator("type")
    @classmethod
    def validate_type(cls, v: str) -> str:
        v = v.lower()
        if v not in ("income", "expense"):
            raise ValueError("Type must be 'income' or 'expense'")
        return v

    @field_validator("name")
    @classmethod
    def validate_name(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("Category name cannot be empty")
        return v


class CategoryCreate(CategoryBase):
    pass


class Category(CategoryBase):
    id: int

    class Config:
        from_attributes = True


class TransactionBase(BaseModel):
    amount: float
    type: str
    category_id: Optional[int] = None
    description: Optional[str] = ""

    @field_validator("amount")
    @classmethod
    def validate_amount(cls, v: float) -> float:
        if v <= 0:
            raise ValueError("Amount must be greater than zero")
        return v

    @field_validator("type")
    @classmethod
    def validate_type(cls, v: str) -> str:
        v = v.lower()
        if v not in ("income", "expense"):
            raise ValueError("Type must be 'income' or 'expense'")
        return v


class TransactionCreate(TransactionBase):
    pass


class TransactionUpdate(BaseModel):
    amount: Optional[float] = None
    type: Optional[str] = None
    category_id: Optional[int] = None
    description: Optional[str] = None

    @field_validator("amount")
    @classmethod
    def validate_amount(cls, v: Optional[float]) -> Optional[float]:
        if v is not None and v <= 0:
            raise ValueError("Amount must be greater than zero")
        return v

    @field_validator("type")
    @classmethod
    def validate_type(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            v = v.lower()
            if v not in ("income", "expense"):
                raise ValueError("Type must be 'income' or 'expense'")
        return v


class Transaction(TransactionBase):
    id: int
    date: datetime
    created_at: datetime
    category: Optional[Category] = None

    class Config:
        from_attributes = True


class TransactionWithCategory(BaseModel):
    id: int
    amount: float
    type: str
    category_id: Optional[int] = None
    description: Optional[str] = ""
    date: datetime
    created_at: datetime
    category_name: Optional[str] = None
    category_color: Optional[str] = None

    class Config:
        from_attributes = True


class BudgetCreate(BaseModel):
    category_id: int
    amount: float
    month: str

    @field_validator("amount")
    @classmethod
    def validate_amount(cls, v: float) -> float:
        if v <= 0:
            raise ValueError("Amount must be greater than zero")
        return v

    @field_validator("month")
    @classmethod
    def validate_month(cls, v: str) -> str:
        import re
        if not re.match(r"^\d{4}-\d{2}$", v):
            raise ValueError("Month must be in YYYY-MM format")
        return v


class Budget(BudgetCreate):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


class SummaryResponse(BaseModel):
    total_income: float
    total_expenses: float
    balance: float
    month: str


class MonthlyChartItem(BaseModel):
    category: str
    amount: float
    color: Optional[str] = None


class MonthlyChartResponse(BaseModel):
    month: str
    data: List[MonthlyChartItem]


class CategorySpending(BaseModel):
    category: str
    amount: float
    color: Optional[str] = None
    percentage: float = 0.0


class DashboardResponse(BaseModel):
    total_income: float
    total_expenses: float
    balance: float
    month: str
    recent_transactions: List[TransactionWithCategory]
    category_breakdown: List[CategorySpending]
    budget_status: List[dict] = []