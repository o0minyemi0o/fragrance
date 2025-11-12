from sqlalchemy import Column, Integer, String, Float, Text, DateTime, ARRAY
from sqlalchemy.sql import func
from app.schemas import Base

class Ingredient(Base):
    __tablename__ = "ingredients"
    
    id = Column(Integer, primary_key=True, index=True)
    ingredient_name = Column(String(255), unique=True, index=True, nullable=False)
    inci_name = Column(String(255), nullable=False)
    synonyms = Column(ARRAY(String), nullable=True)
    cas_number = Column(String(50), unique=True, nullable=True)
    
    odor_description = Column(String(255), nullable=True)
    odor_threshold = Column(Float, nullable=True)
    suggested_usage_level = Column(String(100), nullable=True)
    note_family = Column(String(100), nullable=True)
    
    max_usage_percentage = Column(Float, nullable=True)
    perfume_applications = Column(ARRAY(String), nullable=True)
    stability = Column(Text, nullable=True)
    tenacity = Column(String(50), nullable=True)
    volatility = Column(String(50), nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    def __repr__(self):
        return f"<Ingredient(id={self.id}, name={self.ingredient_name})>"

