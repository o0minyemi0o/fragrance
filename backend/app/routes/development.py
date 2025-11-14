from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from google import genai
from typing import List
import json
import os
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.schemas import Ingredient

router = APIRouter(prefix="/api/development", tags=["development"])

class Message(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: List[Message]

# 향료 DB 가져오기 함수
def get_available_ingredients(db: Session) -> str:
    """DB에서 향료 목록을 가져와 문자열로 변환"""
    ingredients = db.query(Ingredient).all()
    
    if not ingredients:
        return "There are no ingredients registered in the current database."
    
    # 카테고리별로 그룹화
    by_note_family= {}
    for ing in ingredients:
        note_family = ing.note_family or "Other"
        if note_family not in by_note_family:
            by_note_family[note_family] = []
        by_note_family[note_family].append(f"{ing.ingredient_name} ({ing.inci_name or 'N/A'})")
    
    # 문자열로 변환
    result = "**Registered perfume ingredients in the database:**\n\n"
    total_cnt = 0
    for note_family, items in by_note_family.items():
        result += f"**{note_family}:**\n"
        result += ", ".join(items)  # 각 카테고리당 최대 10개
        result += "\n\n"
        total_cnt += len(items)
    
    return result, total_cnt

DEVELOP_MODE_SYSTEM_PROMPT = """You are a professional perfumer AI assistant.

[Role]
Through conversation with the user, understand their desired fragrance and develop an actual perfume formula step by step.

[Key Principles - INGREDIENT USAGE RULES]
1. **Database Ingredient Check**: FIRST, check how many ingredients are available in the database.
   
2. **Minimum Ingredient Requirement**: 
   - A complete perfume formula requires AT LEAST 10-12 ingredients
   - If database has insufficient ingredients, YOU MUST supplement with common fragrance materials
   
3. **Ingredient Selection Strategy**:
   - If DB has 150+ ingredients: Prioritize DB ingredients (use 80-90% from DB)
   - If DB has 100-150 ingredients: Mix DB ingredients with common materials (60-70% from DB)
   - If DB has fewer than 100 ingredients: YOU MUST use mostly common materials. 
   
4. **Critical Rule**: 
   - NEVER limit your formula to only what's in the database if it's insufficient
   - ALWAYS aim for 10-18 total ingredients for a complete, professional formula

{ingredient_list}

**Available DB Ingredients: {ingredient_count}**

[Conversation Flow]
1. **Initial Conversation (Messages 1-3):**
   - Understand the user's desired fragrance feeling, mood, and purpose
   - **IMPORTANT**: If ingredient count is low, inform the user:
     * "I see you have {ingredient_count} ingredients in your library. To create a complete, professional formula, I'll combine these with essential fragrance materials commonly used in perfumery."

2. **Material Suggestions (Messages 4-6):**
   - Suggest a COMPLETE palette of 10-18 ingredients
   - Use available DB ingredients as your foundation
   - Fill gaps with common professional-grade materials to ensure balanced formula
   - Explain the characteristics and role of each material
   - Incorporate user feedback

3. **Formula Development (Messages 7-10):**
   - Develop final formula with 10-18 ingredients total
   - Ensure proper fragrance pyramid structure (Top/Heart/Base)
   - Provide specific percentages

4. **Final Formula Format:**
{{
"formula": {{
"name": "Fragrance Name",
"type": "Floral Woody",
"description": "Brief description of this fragrance",
"totalIngredients": 12,
"ingredients": [
{{"name": "Bergamot Oil (expressed)", "percentage": 8, "note": "top", "role": "Top Impact"}},
{{"name": "Rose Absolute (Bulgarian)", "percentage": 15, "note": "middle", "role": "Main Accord"}},
{{"name": "Patchouli Oil", "percentage": 18, "note": "base", "role": "Fixative"}},
],
"longevity": "Medium",
"sillage": "Strong and patchouli-heavy",
"recommendation": "Suitable daily fragrance for spring and autumn"
}}
}}

[Constraints]
- NEVER create formulas with fewer than 10 ingredients
- Do not suggest only abstract keywords - use actual material names
- Ratios must be in percentages
- Total percentage ≈ 100%
- All formulas must have complete Top/Heart/Base note structure
- If the user's ingredient library is insufficient to create a complete formula, DO NOT attempt to create a formula based on their limited ingredients. Instead, make proper formula with commonly used fragrance materials.
"""


@router.post("/chat")
async def chat_stream(request: ChatRequest, db: Session = Depends(get_db)):
    """Develop Mode AI 채팅 (스트리밍)"""
    try:
        print("=== DEBUG: chat_stream called ===")
        
        api_key = os.getenv("GOOGLE_API_KEY")
        if not api_key:
            print("ERROR: GOOGLE_API_KEY not set")
            raise HTTPException(status_code=500, detail="GOOGLE_API_KEY not set")
        
        print(f"DEBUG: API key loaded: {api_key[:10]}...")
        
        # DB에서 향료 목록 가져오기
        print("DEBUG: Getting ingredients from DB...")
        ingredient_list, total_cnt = get_available_ingredients(db)
        print(f"DEBUG: Ingredient list length: {len(ingredient_list)}")
        
        # 시스템 프롬프트에 향료 리스트 포함
        print("ingredient_list for prompt:", ingredient_list)
        print("ingredient_count for prompt:", total_cnt)

        system_prompt = DEVELOP_MODE_SYSTEM_PROMPT.format(
            ingredient_list=ingredient_list,
            ingredient_count=total_cnt
        )
        print(f"DEBUG: System prompt created, length: {len(system_prompt)}")
        
        # 대화 히스토리 구성
        chat_history = [{"role": "user", "parts": [{"text": system_prompt}]}]
        
        for msg in request.messages:
            chat_history.append({
                "role": msg.role,
                "parts": [{"text": msg.content}]
            })
        
        print(f"DEBUG: Chat history length: {len(chat_history)}")
        
        # 스트리밍 응답 - 함수 밖에서 클라이언트 생성
        print("DEBUG: Calling Gemini API...")
        
        async def generate():
            try:
                # 여기서 클라이언트 생성!
                client = genai.Client(api_key=api_key)
                
                response = client.models.generate_content_stream(
                    model="gemini-2.0-flash",
                    contents=chat_history
                )
                
                for chunk in response:
                    if chunk.text:
                        yield f"data: {json.dumps({'content': chunk.text})}\n\n"
                
                yield "data: [DONE]\n\n"
                
            except Exception as e:
                print(f"ERROR in generate: {e}")
                import traceback
                traceback.print_exc()
                yield f"data: {json.dumps({'error': str(e)})}\n\n"
        
        return StreamingResponse(generate(), media_type="text/event-stream")
        
    except Exception as e:
        print(f"ERROR in chat_stream: {type(e).__name__}: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
