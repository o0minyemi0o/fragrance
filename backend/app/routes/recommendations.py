from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.recommendation import RecommendationRequest, RecommendationResponse
from app.models.recommendation import Recommendation

router = APIRouter(prefix="/api/recommendations", tags=["recommendations"])

@router.post("/", response_model=RecommendationResponse)
async def create_recommendation(
    request: RecommendationRequest,
    db: Session = Depends(get_db)
):
    """사용자 선호도 기반 향수 추천"""
    try:
        # TODO: LLM 서비스 통합
        # accord_id, confidence = await llm_service.recommend_accord(...)
        
        # 일단 샘플 데이터
        recommendation = Recommendation(
            user_id=request.user_id,
            preference_input=request.preference_input,
            preferred_notes=request.preferred_notes,
            budget_range=request.budget_range,
            restrictions=request.restrictions,
            recommended_accord_id=1,  # 임시
            confidence_score=0.85  # 임시
        )
        
        db.add(recommendation)
        db.commit()
        db.refresh(recommendation)
        
        return recommendation
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{id}", response_model=RecommendationResponse)
async def get_recommendation(id: int, db: Session = Depends(get_db)):
    """추천 기록 조회"""
    recommendation = db.query(Recommendation).filter(Recommendation.id == id).first()
    if not recommendation:
        raise HTTPException(status_code=404, detail="Recommendation not found")
    return recommendation

