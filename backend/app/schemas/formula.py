from sqlalchemy import Column, Integer, String, Float, Text, DateTime, JSON, Enum
from sqlalchemy.sql import func
from app.schemas import Base
import enum

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

class Formula(Base):
    __tablename__ = "formulas"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), unique=True, index=True, nullable=False)
    formula_type = Column(String(50), nullable=False)  # "White Floral Soap Type"
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
