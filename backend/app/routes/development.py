from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from google import genai
from typing import List
import json
import os
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Ingredient

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
    by_category = {}
    for ing in ingredients:
        category = ing.note_family or "Other"
        if category not in by_category:
            by_category[category] = []
        by_category[category].append(f"{ing.ingredient_name} ({ing.inci_name or 'N/A'})")
    
    # 문자열로 변환
    result = "**Registered perfume ingredients in the database:**\n\n"
    for category, items in by_category.items():
        result += f"**{category}:**\n"
        result += ", ".join(items[:10])  # 각 카테고리당 최대 10개
        if len(items) > 10:
            result += f" ... (총 {len(items)}개)"
        result += "\n\n"
    
    return result

DEVELOP_MODE_SYSTEM_PROMPT = DEVELOP_MODE_SYSTEM_PROMPT = """You are a professional perfumer AI assistant.

[Role]
Through conversation with the user, understand their desired fragrance and develop an actual perfume formula step by step.

[Key Principles]
1. **Prioritize DB Ingredients**: Use ingredients from the database below as a priority. However, if the available ingredients are too limited, you should suggest common fragrance materials.
2. **Non-DB Ingredients**: You may suggest common fragrance materials when necessary.
3. **Specific Material Names**: Provide actual material names and percentages, not abstract keywords.

{ingredient_list}

[Conversation Flow]
1. **Initial Conversation (Messages 1-3):**
   - Understand the user's desired fragrance feeling, mood, and purpose

2. **Material Suggestions (Messages 4-6):**
   - Suggest materials centered around DB ingredients
   - If the available ingredients are too limited, you must not suggest only DB ingredients.
   - Explain the characteristics and role of each material
   - Incorporate user feedback

3. **Formula Development (Messages 7-10):**
   - Suggest ratios for selected materials
   - Compose with 10-18 ingredients

4. **Final Formula Format and Example:**
{{
"formula": {{
"name": "Fragrance Name",
"type": "Floral Woody",
"description": "Brief description of this fragrance",
"totalIngredients": 12,
"ingredients": [
{{"name": "Bergamot Oil (expressed)", "percentage": 8, "role": "top_note"}},
{{"name": "Rose Absolute (Bulgarian)", "percentage": 15, "role": "heart_note"}},
{{"name": "Patchouli Oil", "percentage": 18, "role": "base_note"}}
],
"longevity": "Medium",
"sillage": "Moderate",
"recommendation": "Suitable daily fragrance for spring and autumn"
}}
}}

[Constraints]
- Do not suggest only abstract keywords
- Ratios must be in percentages
- Total ratio ≈ 100%
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
        ingredient_list = get_available_ingredients(db)
        print(f"DEBUG: Ingredient list length: {len(ingredient_list)}")
        
        # 시스템 프롬프트에 향료 리스트 포함
        system_prompt = DEVELOP_MODE_SYSTEM_PROMPT.format(
            ingredient_list=ingredient_list
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
