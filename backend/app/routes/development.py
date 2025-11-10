from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from google import genai
import os
import json

router = APIRouter(prefix="/api/development", tags=["development"]) 

# Gemini 클라이언트 초기화
gemini_client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

DEVELOP_MODE_SYSTEM_PROMPT = """당신은 전문 조향사 AI 어시스턴트입니다.

[역할]
사용자와 대화를 통해 원하는 향을 파악하고, 실제 조향 포뮬러(구체적인 원료명과 비율)를 단계적으로 개발합니다.

[중요: 실제 조향 원료 사용]
다음 원료 카테고리에서 구체적인 원료명을 제시하세요:

**Top Notes (휘발성 높음):**
- Citrus: Bergamot Oil, Lemon Oil, Orange Oil, Grapefruit Oil, Yuzu Oil
- Herbs: Lavender Oil, Rosemary Oil, Mint Oil, Eucalyptus Oil
- Spices: Pink Peppercorn Oil, Cardamom Oil, Coriander Oil

**Heart Notes (중간 휘발성):**
- Florals: Rose Absolute, Jasmine Absolute, Ylang-Ylang Oil, Geranium Oil, Neroli Oil
- Spices: Clove Bud Oil, Cinnamon Bark Oil
- Woods: Cedarwood Oil, Sandalwood Oil

**Base Notes (휘발성 낮음):**
- Woods: Patchouli Oil, Vetiver Oil, Sandalwood, Cedarwood
- Resins: Benzoin Resinoid, Labdanum Absolute, Frankincense Oil
- Musks: Ambroxan, Cashmeran, Iso E Super
- Vanilla: Vanilla Absolute, Tonka Bean Absolute

[대화 흐름]
1. **초기 대화 (1-3번 메시지):**
   - 사용자가 원하는 향의 느낌, 분위기, 용도 파악
   - 구체적 예시 3-4개 제시하여 방향 좁히기

2. **원료 제안 단계 (4-6번 메시지):**
   - 구체적인 원료명 3-5개 제시
   - 각 원료의 특성 간단히 설명
   - 사용자 피드백 받아 조정

3. **포뮬러 구체화 (7-10번 메시지):**
   - 선택된 원료들의 비율 제안
   - 전체 10-18개 원료로 구성
   - 비율은 백분율(%)로 표시
   - Top:Heart:Base = 대략 30:50:20 비율 유지

4. **최종 포뮬러 제시:**
{
"formula": {
"name": "사용자가 원하는 향 이름",
"totalIngredients": 15,
"ingredients": [
{"name": "Bergamot Oil (expressed)", "percentage": 8, "role": "top_note"},
{"name": "Pink Peppercorn Oil", "percentage": 2, "role": "top_note"},
{"name": "Rose Absolute (Bulgarian)", "percentage": 15, "role": "heart_note"},
{"name": "Patchouli Oil", "percentage": 18, "role": "heart_note"},
{"name": "Ambroxan", "percentage": 8, "role": "base_note"},
{"name": "Benzoin Resinoid", "percentage": 4, "role": "base_note"}
// ... 더 많은 원료
],
"clarityLevel": 95
}
}
[제약 조건]
- 추상적 키워드만 제시하지 마세요
- 항상 구체적인 원료명 사용
- 비율은 반드시 백분율로 표시
- 총 원료는 최소 10개, 최대 20개
- 전체 비율 합계는 100%에 가까워야 함
- 실제 조향 데이터베이스에 있을 법한 원료명 사용
"""





class ChatMessage(BaseModel):
    role: str  # 'user' 또는 'assistant'
    content: str


class ChatRequest(BaseModel):
    messages: list[ChatMessage]


@router.post("/chat")
async def chat_develop_mode(request: ChatRequest):
    """
    Develop Mode - AI 채팅 엔드포인트 (스트리밍)
    향수 개발을 위한 대화형 AI 인터페이스
    """
    try:
        # 메시지 형식 변환
        chat_history = []
        
        # 시스템 프롬프트를 첫 번째 사용자 메시지에 포함
        if request.messages:
            first_message = f"{DEVELOP_MODE_SYSTEM_PROMPT}\n\n사용자 요청: {request.messages[0].content}"
            chat_history.append({
                "role": "user",
                "parts": [{"text": first_message}]
            })
            
            # 나머지 메시지들 추가
            for msg in request.messages[1:]:
                role = "model" if msg.role == "assistant" else "user"
                chat_history.append({
                    "role": role,
                    "parts": [{"text": msg.content}]
                })
        
        # 스트리밍 응답 생성
        async def generate_stream():
            try:
                response = gemini_client.models.generate_content_stream(
                    model="gemini-2.0-flash",
                    contents=chat_history
                )
                
                for chunk in response:
                    if chunk.text:
                        data = json.dumps({"content": chunk.text}, ensure_ascii=False)
                        yield f"data: {data}\n\n"
                
                yield "data: [DONE]\n\n"
                
            except Exception as e:
                error_data = json.dumps({"error": str(e)}, ensure_ascii=False)
                yield f"data: {error_data}\n\n"
        
        return StreamingResponse(
            generate_stream(),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
            }
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))