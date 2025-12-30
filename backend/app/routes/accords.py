"""
Accords Routes - Accord 조합 관련 API 엔드포인트
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.initialization.session import get_db
from app.db.queries import (
    get_all_accords,
    get_accord_by_id,
    get_accord_by_name,
    create_accord,
    update_accord,
    delete_accord,
)
from app.services.accord_service import accord_service
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/accords", tags=["accords"])


@router.post("/generate")
async def generate_accord(
    request: dict,
    db: Session = Depends(get_db)
):
    """Accord 조합 생성"""
    try:
        accord_type = request.get("accord_type", "").strip()
        if not accord_type:
            raise HTTPException(status_code=400, detail="Accord type required")

        logger.info(f"Accord 생성 요청: {accord_type}")
        result = accord_service.generate_accord(accord_type, db)

        return {
            "status": "success",
            "data": result
        }
    except Exception as e:
        logger.error(f"Accord 생성 실패: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/save")
async def save_accord(
    request: dict,
    db: Session = Depends(get_db)
):
    """생성된 Accord 저장"""
    try:
        name = request.get("name", "").strip()
        accord_type = request.get("accord_type", "").strip()
        description = request.get("description", "")
        ingredients_composition = request.get("ingredients", [])
        longevity = request.get("longevity")
        sillage = request.get("sillage")
        llm_recommendation = request.get("recommendation", "")

        if not name or not accord_type:
            raise HTTPException(status_code=400, detail="Name and type required")

        # 중복 확인
        existing = get_accord_by_name(db, name)
        if existing:
            raise HTTPException(status_code=409, detail="Accord already exists")

        accord_data = {
            "name": name,
            "accord_type": accord_type,
            "description": description,
            "ingredients_composition": ingredients_composition,
            "total_percentage": 100.0,
            "longevity": longevity,
            "sillage": sillage,
            "llm_recommendation": llm_recommendation
        }

        accord = create_accord(db, accord_data)

        logger.info(f"Accord 저장 완료: ID={accord.id}, Name={name}")

        return {
            "status": "success",
            "message": f"Accord '{name}' saved",
            "accord_id": accord.id
        }
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Accord 저장 실패: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("")
async def list_accords(db: Session = Depends(get_db)):
    """저장된 Accord 목록"""
    accords = get_all_accords(db)
    return {
        "count": len(accords),
        "accords": [
            {
                "id": a.id,
                "name": a.name,
                "type": a.accord_type,
                "ingredients_count": len(a.ingredients_composition) if a.ingredients_composition else 0,
                "created_at": a.created_at.isoformat() if a.created_at else None
            }
            for a in accords
        ]
    }


@router.get("/{id}")
async def get_accord_detail(id: int, db: Session = Depends(get_db)):
    """특정 Accord 상세 조회"""
    accord = get_accord_by_id(db, id)
    if not accord:
        raise HTTPException(status_code=404, detail="Accord not found")

    return {
        "id": accord.id,
        "name": accord.name,
        "type": accord.accord_type,
        "description": accord.description,
        "ingredients_composition": accord.ingredients_composition,
        "longevity": accord.longevity,
        "sillage": accord.sillage,
        "llm_recommendation": accord.llm_recommendation,
        "created_at": accord.created_at.isoformat() if accord.created_at else None
    }


@router.put("/{id}")
async def update_accord_route(
    id: int,
    request: dict,
    db: Session = Depends(get_db)
):
    """Accord 수정"""
    try:
        # 수정 가능한 필드들 필터링
        update_data = {}
        if "name" in request:
            update_data["name"] = request["name"].strip()
        if "description" in request:
            update_data["description"] = request["description"]
        if "ingredients_composition" in request:
            update_data["ingredients_composition"] = request["ingredients_composition"]
        if "longevity" in request:
            update_data["longevity"] = request["longevity"]
        if "sillage" in request:
            update_data["sillage"] = request["sillage"]
        if "llm_recommendation" in request:
            update_data["llm_recommendation"] = request["llm_recommendation"]

        accord = update_accord(db, id, update_data)
        if not accord:
            raise HTTPException(status_code=404, detail="Accord not found")

        logger.info(f"Accord 수정 완료: ID={id}")

        return {
            "status": "success",
            "message": f"Accord updated",
            "accord_id": accord.id
        }
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Accord 수정 실패: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{id}")
async def delete_accord_route(id: int, db: Session = Depends(get_db)):
    """Accord 삭제"""
    success = delete_accord(db, id)
    if not success:
        raise HTTPException(status_code=404, detail="Accord not found")

    logger.info(f"Accord 삭제 완료: ID={id}")

    return {"status": "success", "message": f"Accord deleted"}
