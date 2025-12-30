"""
Formulas Routes - 완제품 향수 배합 관련 API 엔드포인트
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.initialization.session import get_db
from app.db.queries import (
    get_all_formulas,
    get_formula_by_id,
    get_formula_by_name,
    create_formula,
    update_formula,
    delete_formula,
)
from app.services.formula_service import formula_service
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/formulas", tags=["formulas"])


@router.post("/generate")
async def generate_formula(
    request: dict,
    db: Session = Depends(get_db)
):
    """Formula 조합 생성"""
    try:
        formula_type = request.get("formula_type", "").strip()
        if not formula_type:
            raise HTTPException(status_code=400, detail="Formula type required")

        logger.info(f"Formula 생성 요청: {formula_type}")
        result = formula_service.generate_formula(formula_type, db)

        return {
            "status": "success",
            "data": result
        }
    except Exception as e:
        logger.error(f"Formula 생성 실패: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/save")
async def save_formula(
    request: dict,
    db: Session = Depends(get_db)
):
    """생성된 Formula 저장"""
    try:
        name = request.get("name", "").strip()
        formula_type = request.get("formula_type", "").strip()
        description = request.get("description", "")
        ingredients_composition = request.get("ingredients", [])
        longevity = request.get("longevity")
        sillage = request.get("sillage")
        stability_notes = request.get("stability_notes")
        llm_recommendation = request.get("recommendation", "")

        if not name or not formula_type:
            raise HTTPException(status_code=400, detail="Name and type required")

        # 중복 확인
        existing = get_formula_by_name(db, name)
        if existing:
            raise HTTPException(status_code=409, detail="Formula already exists")

        formula_data = {
            "name": name,
            "formula_type": formula_type,
            "description": description,
            "ingredients_composition": ingredients_composition,
            "total_percentage": 100.0,
            "longevity": longevity,
            "sillage": sillage,
            "stability_notes": stability_notes,
            "llm_recommendation": llm_recommendation
        }

        formula = create_formula(db, formula_data)

        logger.info(f"Formula 저장 완료: ID={formula.id}, Name={name}")

        return {
            "status": "success",
            "message": f"Formula '{name}' saved",
            "formula_id": formula.id
        }
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Formula 저장 실패: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("")
async def list_formulas(db: Session = Depends(get_db)):
    """저장된 Formula 목록"""
    formulas = get_all_formulas(db)
    return {
        "count": len(formulas),
        "formulas": [
            {
                "id": f.id,
                "name": f.name,
                "type": f.formula_type,
                "ingredients_count": len(f.ingredients_composition) if f.ingredients_composition else 0,
                "created_at": f.created_at.isoformat() if f.created_at else None
            }
            for f in formulas
        ]
    }


@router.get("/{id}")
async def get_formula_detail(id: int, db: Session = Depends(get_db)):
    """특정 Formula 상세 조회"""
    formula = get_formula_by_id(db, id)
    if not formula:
        raise HTTPException(status_code=404, detail="Formula not found")

    return {
        "id": formula.id,
        "name": formula.name,
        "type": formula.formula_type,
        "description": formula.description,
        "ingredients_composition": formula.ingredients_composition,
        "longevity": formula.longevity,
        "sillage": formula.sillage,
        "stability_notes": formula.stability_notes,
        "llm_recommendation": formula.llm_recommendation,
        "created_at": formula.created_at.isoformat() if formula.created_at else None
    }


@router.put("/{id}")
async def update_formula_route(
    id: int,
    request: dict,
    db: Session = Depends(get_db)
):
    """Formula 수정"""
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
        if "stability_notes" in request:
            update_data["stability_notes"] = request["stability_notes"]
        if "llm_recommendation" in request:
            update_data["llm_recommendation"] = request["llm_recommendation"]

        formula = update_formula(db, id, update_data)
        if not formula:
            raise HTTPException(status_code=404, detail="Formula not found")

        logger.info(f"Formula 수정 완료: ID={id}")

        return {
            "status": "success",
            "message": f"Formula updated",
            "formula_id": formula.id
        }
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Formula 수정 실패: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{id}")
async def delete_formula_route(id: int, db: Session = Depends(get_db)):
    """Formula 삭제"""
    success = delete_formula(db, id)
    if not success:
        raise HTTPException(status_code=404, detail="Formula not found")

    logger.info(f"Formula 삭제 완료: ID={id}")

    return {"status": "success", "message": f"Formula deleted"}
