from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class RecommendationRequest(BaseModel):
    user_id: Optional[str] = None
    preference_input: str
    preferred_notes: Optional[List[str]] = None
    budget_range: Optional[str] = None
    restrictions: Optional[List[str]] = None

class RecommendationResponse(BaseModel):
    id: int
    user_id: Optional[str]
    preference_input: str
    recommended_accord_id: Optional[int]
    confidence_score: Optional[float]
    created_at: datetime
    
    class Config:
        from_attributes = True

