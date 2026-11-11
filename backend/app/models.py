"""SQLAlchemy models for the expense tracker."""
from sqlalchemy import Column, Integer, Float, String, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
from datetime import datetime
from .database import Base


class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), nullable=False, unique=True)
    type = Column(String(20), nullable=False)  # "income" or "expense"
    color = Column(String(20), default="#3b82f6")
    icon = Column(String(50), default="folder")

    transactions = relationship("Transaction", back_populates="category")


class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    amount = Column(Float, nullable=False)
    type = Column(String(20), nullable=False)  # "income" or "expense"
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=True)
    description = Column(String(255), default="")
    date = Column(DateTime, default=datetime.utcnow, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    category = relationship("Category", back_populates="transactions")


class Budget(Base):
    __tablename__ = "budgets"

    id = Column(Integer, primary_key=True, index=True)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=False)
    amount = Column(Float, nullable=False)
    month = Column(String(7), nullable=False)  # "YYYY-MM"
    created_at = Column(DateTime, default=datetime.utcnow)

    category = relationship("Category")