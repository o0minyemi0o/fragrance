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
        return "현재 데이터베이스에 등록된 향료가 없습니다."
    
    # 카테고리별로 그룹화
    by_category = {}
    for ing in ingredients:
        category = ing.note_family or "Other"
        if category not in by_category:
            by_category[category] = []
        by_category[category].append(f"{ing.ingredient_name} ({ing.inci_name or 'N/A'})")
    
    # 문자열로 변환
    result = "**데이터베이스에 등록된 향료:**\n\n"
    for category, items in by_category.items():
        result += f"**{category}:**\n"
        result += ", ".join(items[:10])  # 각 카테고리당 최대 10개
        if len(items) > 10:
            result += f" ... (총 {len(items)}개)"
        result += "\n\n"
    
    return result

DEVELOP_MODE_SYSTEM_PROMPT = """당신은 전문 조향사 AI 어시스턴트입니다.

[역할]
사용자와 대화를 통해 원하는 향을 파악하고, 실제 조향 포뮬러를 단계적으로 개발합니다.

[중요 원칙]
1. **DB 향료 우선 사용**: 아래 데이터베이스에 있는 향료를 우선으로 사용하세요. 하지만 보유 향료가 너무 적은 경우에는 일반적인 조향 원료를 제안하는 편이 좋습니다.
2. **DB에 없는 향료**: 필요시 일반적인 조향 원료를 제안할 수 있지만, "(DB 미등록)"이라고 표시하세요.
3. **구체적 원료명**: 추상적 키워드가 아닌 실제 원료명과 비율을 제시하세요.

{ingredient_list}

[대화 흐름]
1. **초기 대화 (1-3번 메시지):**
   - 사용자가 원하는 향의 느낌, 분위기, 용도 파악

2. **원료 제안 (4-6번 메시지):**
   - DB에 있는 원료 중심으로 제안
   - 각 원료의 특성과 역할 설명
   - 사용자 피드백 반영

3. **포뮬러 구체화 (7-10번 메시지):**
   - 선택된 원료의 비율 제안
   - 10-18개 원료로 구성

4. **최종 포뮬러:**
{{
"formula": {{
"name": "향수 이름",
"totalIngredients": 12,
"ingredients": [
{{"name": "Bergamot Oil (expressed)", "percentage": 8, "role": "top_note"}},
{{"name": "Rose Absolute (Bulgarian)", "percentage": 15, "role": "heart_note"}},
{{"name": "Patchouli Oil", "percentage": 18, "role": "heart_note"}},
{{"name": "Ambroxan", "percentage": 8, "role": "base_note"}}
]
}}
}}

[제약]
- 추상적 키워드만 제시하지 마세요
- 비율은 반드시 백분율로
- DB 미등록 향료는 "(DB 미등록)" 표시
- 총 비율 ≈ 100%
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
