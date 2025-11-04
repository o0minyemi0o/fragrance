from sqlalchemy import Column, Integer, String, Float, Text, DateTime, JSON
from sqlalchemy.sql import func
from app.models import Base

class Accord(Base):
    __tablename__ = "accords"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), index=True, nullable=False)
    description = Column(Text, nullable=True)
    
    top_notes = Column(JSON, nullable=True)
    middle_notes = Column(JSON, nullable=True)
    base_notes = Column(JSON, nullable=True)
    
    total_concentration = Column(Float, nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    def __repr__(self):
        return f"<Accord(id={self.id}, name={self.name})>"

