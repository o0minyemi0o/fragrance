from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.ingredient import Ingredient
from app.models.accord import Accord
from app.models.recommendation import Recommendation

router = APIRouter(prefix="/api/db-test", tags=["database-test"])

@router.get("/ingredients")
async def test_get_ingredients(db: Session = Depends(get_db)):
    """로컬 DB에서 모든 향료 조회"""
    try:
        ingredients = db.query(Ingredient).limit(10).all()
        
        return {
            "status": "success",
            "count": len(ingredients),
            "data": [
                {
                    "id": ing.id,
                    "name": ing.ingredient_name,
                    "inci_name": ing.inci_name,
                    "cas_number": ing.cas_number,
                    "note_family": ing.note_family,
                    "max_usage": ing.max_usage_percentage
                }
                for ing in ingredients
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@router.get("/accords")
async def test_get_accords(db: Session = Depends(get_db)):
    """로컬 DB에서 모든 어코드 조회"""
    try:
        accords = db.query(Accord).limit(10).all()
        
        return {
            "status": "success",
            "count": len(accords),
            "data": [
                {
                    "id": accord.id,
                    "name": accord.name,
                    "description": accord.description,
                    "total_concentration": accord.total_concentration
                }
                for accord in accords
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@router.get("/recommendations")
async def test_get_recommendations(db: Session = Depends(get_db)):
    """로컬 DB에서 모든 추천 이력 조회"""
    try:
        recommendations = db.query(Recommendation).limit(10).all()
        
        return {
            "status": "success",
            "count": len(recommendations),
            "data": [
                {
                    "id": rec.id,
                    "user_id": rec.user_id,
                    "preference_input": rec.preference_input,
                    "confidence_score": rec.confidence_score,
                    "created_at": rec.created_at.isoformat() if rec.created_at else None
                }
                for rec in recommendations
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@router.get("/status")
async def test_db_connection(db: Session = Depends(get_db)):
    """데이터베이스 연결 상태 확인"""
    try:
        # 간단한 쿼리로 연결 테스트
        result = db.execute("SELECT 1")
        
        return {
            "status": "connected",
            "message": "Database connection successful",
            "database_url": "postgresql://localhost:5432/fragrance-db"
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Database connection failed: {str(e)}"
        )

@router.post("/create-test-recommendation")
async def create_test_recommendation(db: Session = Depends(get_db)):
    """테스트용 추천 기록 생성"""
    try:
        test_rec = Recommendation(
            user_id="test_user@example.com",
            preference_input="따뜻하고 로맨틱한 향수를 추천해줘",
            preferred_notes=["Floral", "Woody"],
            budget_range="medium",
            restrictions=["Musk"],
            recommended_accord_id=1,
            confidence_score=0.92
        )
        
        db.add(test_rec)
        db.commit()
        db.refresh(test_rec)
        
        return {
            "status": "success",
            "message": "Test recommendation created",
            "data": {
                "id": test_rec.id,
                "user_id": test_rec.user_id,
                "confidence_score": test_rec.confidence_score,
                "created_at": test_rec.created_at.isoformat()
            }
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Create failed: {str(e)}")

