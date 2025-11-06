from sqlalchemy import Column, Integer, String, Float, Text, DateTime, JSON
from sqlalchemy.sql import func
from app.models import Base

class Accord(Base):
    __tablename__ = "accords"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), unique=True, index=True, nullable=False)
    accordion_type = Column(String(100), nullable=True)  # "Pineapple", "Floral", etc.
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
