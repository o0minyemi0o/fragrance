from sqlalchemy import Column, Integer, String, Float, Text, DateTime, ARRAY
from sqlalchemy.sql import func
from app.schemas import Base

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

