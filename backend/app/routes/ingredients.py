from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Ingredient
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/ingredients", tags=["ingredients"])

@router.get("")
async def list_ingredients(db: Session = Depends(get_db)):
    """모든 재료 조회"""
    ingredients = db.query(Ingredient).all()
    return {
        "ingredients": [
            {
                "id": ing.id,
                "ingredient_name": ing.ingredient_name,
                "inci_name": ing.inci_name,
                "synonyms": ing.synonyms,
                "cas_number": ing.cas_number,
                "odor_description": ing.odor_description,
                "odor_threshold": ing.odor_threshold,
                "suggested_usage_level": ing.suggested_usage_level,
                "note_family": ing.note_family,
                "max_usage_percentage": ing.max_usage_percentage,
                "perfume_applications": ing.perfume_applications,
                "stability": ing.stability,
                "tenacity": ing.tenacity,
                "volatility": ing.volatility,
            }
            for ing in ingredients
        ]
    }

@router.post("")
async def create_ingredient(data: dict, db: Session = Depends(get_db)):
    """새 재료 추가"""
    try:
        new_ingredient = Ingredient(
            ingredient_name=data.get("ingredient_name"),
            inci_name=data.get("inci_name", ""),
            synonyms=data.get("synonyms", []),
            cas_number=data.get("cas_number"),
            odor_description=data.get("odor_description"),
            odor_threshold=data.get("odor_threshold"),
            suggested_usage_level=data.get("suggested_usage_level"),
            note_family=data.get("note_family"),
            max_usage_percentage=data.get("max_usage_percentage"),
            perfume_applications=data.get("perfume_applications", []),
            stability=data.get("stability"),
            tenacity=data.get("tenacity"),
            volatility=data.get("volatility"),
        )
        db.add(new_ingredient)
        db.commit()
        db.refresh(new_ingredient)
        return {"id": new_ingredient.id, "message": "Ingredient created successfully"}
    except Exception as e:
        db.rollback()
        logger.error(f"Error creating ingredient: {e}")
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/{id}")
async def delete_ingredient(id: int, db: Session = Depends(get_db)):
    """재료 삭제"""
    ingredient = db.query(Ingredient).filter(Ingredient.id == id).first()
    if not ingredient:
        raise HTTPException(status_code=404, detail="Ingredient not found")
    
    db.delete(ingredient)
    db.commit()
    return {"message": "Ingredient deleted successfully"}
