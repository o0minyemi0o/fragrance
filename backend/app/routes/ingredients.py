from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.initialization.session import get_db
from app.db.schema import Ingredient
from app.db.queries import (
    get_all_ingredients,
    get_ingredient_by_id,
    create_ingredient,
    update_ingredient,
    delete_ingredient,
    search_ingredients_by_name,
)
from app.db.vector import (
    search_ingredients_semantic,
    index_all_ingredients,
)
from google import genai
import json
import logging
import re
import os
from dotenv import load_dotenv
import os

# 최우선으로 .env 파일 로드
load_dotenv()


logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/ingredients", tags=["ingredients"])

@router.get("")
async def list_ingredients(db: Session = Depends(get_db)):
    """모든 재료 조회"""
    ingredients = get_all_ingredients(db)
    return {
        "ingredients": [
            {
                "id": ing.id,
                "ingredient_name": ing.ingredient_name,
                "inci_name": ing.inci_name,
                "cas_number": ing.cas_number,
                "synonyms": ing.synonyms,
                "odor_description": ing.odor_description,
                "note_family": ing.note_family,
                "suggested_usage_level": ing.suggested_usage_level,
                "max_usage_percentage": ing.max_usage_percentage,
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
        # 모든 빈 문자열을 None으로 변환
        def to_null_if_empty(val):
            return None if val == '' or val is None else val

        new_ingredient = Ingredient(
            ingredient_name=data.get("ingredient_name"),
            inci_name=to_null_if_empty(data.get("inci_name")),
            cas_number=to_null_if_empty(data.get("cas_number")),  
            synonyms=data.get("synonyms", []),
            odor_description=to_null_if_empty(data.get("odor_description")),
            note_family=to_null_if_empty(data.get("note_family")),
            suggested_usage_level=to_null_if_empty(data.get("suggested_usage_level")),
            max_usage_percentage=to_null_if_empty(data.get("max_usage_percentage")),
            stability=to_null_if_empty(data.get("stability")),
            tenacity=to_null_if_empty(data.get("tenacity")),
            volatility=to_null_if_empty(data.get("volatility")),
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
async def delete_ingredient_route(id: int, db: Session = Depends(get_db)):
    """재료 삭제"""
    success = delete_ingredient(db, id)
    if not success:
        raise HTTPException(status_code=404, detail="Ingredient not found")

    return {"message": "Ingredient deleted successfully"}

@router.post("/auto-fill")
async def auto_fill_ingredient(data: dict, db: Session = Depends(get_db)):
    """재료명으로 정보 자동 채우기 LLM"""
    ingredient_name = data.get("name", "").strip()
    
    logger.info(f"Auto-fill request received: '{ingredient_name}'")
    
    if not ingredient_name:
        logger.error("Ingredient name is empty")
        raise HTTPException(status_code=400, detail="Ingredient name is required")
    
    try:
        logger.info(f"Using LLM to generate {ingredient_name}")
        
        # LLM으로 생성
        api_key = os.getenv("GOOGLE_API_KEY")
        if not api_key:
            logger.error("GOOGLE_API_KEY environment variable not set")
            raise HTTPException(status_code=500, detail="API key not configured")
        
        logger.info("Initializing Gemini client...")
        client = genai.Client(api_key=api_key)
        
        prompt = f"""You are a fragrance chemistry expert. Given an ingredient name, provide detailed information in JSON format.

Ingredient Name: {ingredient_name}

Return ONLY valid JSON (no markdown, no code blocks, no additional text) with this exact structure:
{{
  "inci_name": "INCI chemical name",
  "cas_number": "CAS number",
  "synonyms": "comma-separated synonyms",
  "odor_description": "descriptive odor profile",
  "note_family": "Floral, Woody, Citrus, Herbal, Spicy, Fresh, Sweet, Oriental, or Other",
  "suggested_usage_level": "typical usage percentage (e.g., 0.1-1%)",
  "max_usage_percentage": "maximum allowed usage percentage",
  "stability": "description of chemical or environmental stability",
  "tenacity": "duration of scent on skin or blotter",
  "volatility": "high, medium, or low"
}}

Return ONLY the JSON object."""

        logger.info("Calling Gemini API...")
        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=prompt
        )
        
        logger.info(f"Gemini response received: {response.text[:100]}...")
        
        response_text = response.text.strip()

        # 마크다운 제거
        if response_text.startswith('```json'):
            response_text = response_text[7:]  
        if response_text.startswith('```'):
            response_text = response_text[3:]  

        # 줄바꿈 제거
        response_text = response_text.lstrip('\n').rstrip('\n')

        if response_text.endswith('```'):
            response_text = response_text[:-3]

        response_text = response_text.strip()

        logger.info(f"Cleaned response: {response_text}")
        parsed_data = json.loads(response_text)
        return {
            "success": True,
            "source": "llm",
            "data": {
                "inci_name": parsed_data.get("inci_name", ""),
                "cas_number": parsed_data.get("cas_number", ""),
                "synonyms": parsed_data.get("synonyms", ""),
                "odor_description": parsed_data.get("odor_description", ""),
                "note_family": parsed_data.get("note_family", ""),
                "suggested_usage_level": parsed_data.get("suggested_usage_level", ""),
                "max_usage_percentage": parsed_data.get("max_usage_percentage", ""),
                "stability": parsed_data.get("stability", ""),
                "tenacity": parsed_data.get("tenacity", ""),
                "volatility": parsed_data.get("volatility", "")   
            }
        }
        
    except json.JSONDecodeError as e:
        logger.error(f"JSON parsing error: {e}")
        logger.error(f"Response text was: {response_text}")
        raise HTTPException(status_code=500, detail=f"Failed to parse LLM response: {str(e)}")
    except Exception as e:
        logger.error(f"Auto-fill error: {type(e).__name__}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Auto-fill failed: {str(e)}")


@router.put("/{id}")
async def update_ingredient_route(id: int, data: dict, db: Session = Depends(get_db)):
    ingredient = update_ingredient(db, id, data)
    if not ingredient:
        raise HTTPException(status_code=404, detail="Ingredient not found")
    return {"id": ingredient.id, "message": "Ingredient updated successfully"}


@router.get("/search/name")
async def search_by_name(query: str, db: Session = Depends(get_db)):
    """Search ingredients by name (partial match)"""
    try:
        if not query or len(query) < 2:
            raise HTTPException(status_code=400, detail="Query must be at least 2 characters")

        results = search_ingredients_by_name(db, query)

        return {
            "query": query,
            "count": len(results),
            "results": [
                {
                    "id": ing.id,
                    "ingredient_name": ing.ingredient_name,
                    "inci_name": ing.inci_name,
                    "note_family": ing.note_family,
                    "odor_description": ing.odor_description,
                }
                for ing in results
            ]
        }
    except Exception as e:
        logger.error(f"Name search failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/search/semantic")
async def search_semantic(query: str, limit: int = 10):
    """Search ingredients using semantic similarity (ChromaDB)"""
    try:
        if not query or len(query) < 3:
            raise HTTPException(status_code=400, detail="Query must be at least 3 characters")

        if limit < 1 or limit > 50:
            raise HTTPException(status_code=400, detail="Limit must be between 1 and 50")

        results = search_ingredients_semantic(query, n_results=limit)

        return {
            "query": query,
            "count": len(results),
            "results": results
        }
    except Exception as e:
        logger.error(f"Semantic search failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/index/vector")
async def index_vector(db: Session = Depends(get_db)):
    """Index all ingredients into ChromaDB for semantic search"""
    try:
        count = index_all_ingredients(db)
        return {
            "status": "success",
            "message": f"Indexed {count} ingredients into ChromaDB",
            "count": count
        }
    except Exception as e:
        logger.error(f"Indexing failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))
