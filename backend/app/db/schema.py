from sqlalchemy import Column, Integer, String, Float, Text, DateTime, JSON, ARRAY, Enum
from sqlalchemy.sql import func
from sqlalchemy.orm import declarative_base
import enum

Base = declarative_base()

# =====================
# Enums
# =====================

class FormulaType(str, enum.Enum):
    """포뮬러 타입"""
    FLORAL = "floral"
    FRUITY = "fruity"
    WOODY = "woody"
    FRESH = "fresh"
    CHYPRE = "chypre"
    ORIENTAL = "oriental"
    SOAP = "soap"
    AROMATIC = "aromatic"
    OTHER = "other"


# =====================
# Models
# =====================

class Ingredient(Base):
    __tablename__ = "ingredients"

    id = Column(Integer, primary_key=True, index=True)
    ingredient_name = Column(Text, unique=True, index=True, nullable=False)
    inci_name = Column(Text, nullable=False)
    synonyms = Column(ARRAY(String), nullable=True)
    cas_number = Column(Text, unique=True, nullable=True)

    odor_description = Column(Text, nullable=True)
    odor_threshold = Column(Float, nullable=True)
    suggested_usage_level = Column(Text, nullable=True)
    note_family = Column(Text, nullable=True)

    max_usage_percentage = Column(Text, nullable=True)
    perfume_applications = Column(ARRAY(String), nullable=True)
    stability = Column(Text, nullable=True)
    tenacity = Column(Text, nullable=True)
    volatility = Column(Text, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    def __repr__(self):
        return f"<Ingredient(id={self.id}, name={self.ingredient_name})>"


class Formula(Base):
    __tablename__ = "formulas"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), unique=True, index=True, nullable=False)
    formula_type = Column(Text, nullable=False)  # "White Floral Soap Type"
    description = Column(Text, nullable=True)

    # 원료 구성
    ingredients_composition = Column(JSON, nullable=False)  # [{name, percentage, notes}, ...]
    total_percentage = Column(Float, nullable=True)  # 보통 100%

    # 특성
    top_notes_time = Column(String(100), nullable=True)  # "15-30 minutes"
    middle_notes_time = Column(String(100), nullable=True)
    base_notes_time = Column(String(100), nullable=True)
    longevity = Column(String(50), nullable=True)  # "8 hours", "12 hours"
    sillage = Column(String(50), nullable=True)  # "moderate", "strong"

    # 규정/안전성
    stability_notes = Column(Text, nullable=True)
    shelf_life_months = Column(Integer, nullable=True)

    # 추가 정보
    cost_per_ml = Column(Float, nullable=True)
    llm_recommendation = Column(Text, nullable=True)
    user_id = Column(String(255), nullable=True, index=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    def __repr__(self):
        return f"<Formula(id={self.id}, name={self.name}, type={self.formula_type})>"


class Accord(Base):
    __tablename__ = "accords"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), unique=True, index=True, nullable=False)
    accord_type = Column(String(100), nullable=True)  # "Pineapple", "Floral", etc.
    description = Column(Text, nullable=True)

    # 원료 구성 (JSON 형식)
    ingredients_composition = Column(JSON, nullable=False)
    # 예: [
    #   {"name": "Pineapple Ester", "percentage": 40, "cas_number": "..."},
    #   {"name": "Green Note", "percentage": 30, "cas_number": "..."},
    #   ...
    # ]

    total_percentage = Column(Float, nullable=True)

    # 특성
    top_notes = Column(JSON, nullable=True)
    middle_notes = Column(JSON, nullable=True)
    base_notes = Column(JSON, nullable=True)

    longevity = Column(String(50), nullable=True)
    sillage = Column(String(50), nullable=True)

    # LLM 추천 내용
    llm_recommendation = Column(Text, nullable=True)
    user_id = Column(String(255), nullable=True, index=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    def __repr__(self):
        return f"<Accord(id={self.id}, name={self.name})>"


__all__ = ["Base", "Ingredient", "Formula", "Accord", "FormulaType"]
