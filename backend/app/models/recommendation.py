from sqlalchemy import Column, Integer, String, Float, Text, DateTime, ARRAY
from sqlalchemy.sql import func
from app.models import Base

class Recommendation(Base):
    __tablename__ = "recommendations"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String(255), nullable=True)
    
    preference_input = Column(Text, nullable=False)
    preferred_notes = Column(ARRAY(String), nullable=True)
    budget_range = Column(String(50), nullable=True)
    restrictions = Column(ARRAY(String), nullable=True)
    
    recommended_accord_id = Column(Integer, nullable=True)
    confidence_score = Column(Float, nullable=True)
    
    user_feedback = Column(String(50), nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())

