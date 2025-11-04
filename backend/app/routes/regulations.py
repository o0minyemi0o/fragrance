from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db

router = APIRouter(prefix="/api/regulations", tags=["regulations"])

@router.get("/{ingredient_name}")
async def get_regulations(ingredient_name: str, region: str = "US", db: Session = Depends(get_db)):
    """성분별 규제 정보 조회"""
    # TODO: regulations 테이블에서 쿼리
    return {
        "ingredient": ingredient_name,
        "region": region,
        "max_concentration": 5.0,
        "prohibited": False,
        "restriction_details": "Sample restriction"
    }

