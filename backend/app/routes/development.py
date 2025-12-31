from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import List, AsyncGenerator
from sqlalchemy.orm import Session
from app.db.initialization.session import get_db
from app.services.development_service import development_service
import json
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/development", tags=["development"])


class Message(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    messages: List[Message]


@router.post("/chat")
async def chat_stream(request: ChatRequest, db: Session = Depends(get_db)):
    """
    Development Mode - 간단한 대화형 향수 개발 서비스

    복잡한 Agent 구조 없이 스트리밍 대화만 제공합니다.
    """
    try:
        # Convert Pydantic models to dicts
        messages = [{"role": msg.role, "content": msg.content} for msg in request.messages]

        logger.info(f"[/api/development/chat] 메시지 수: {len(messages)}")

        # Stream chat
        async def generate() -> AsyncGenerator[str, None]:
            try:
                # Development service로 스트리밍
                async for chunk in development_service.stream_chat(
                    messages=messages,
                    db=db
                ):
                    # SSE 형식으로 전송
                    yield f"data: {json.dumps({'content': chunk})}\n\n"

                # 완료 신호
                logger.info("[/api/development/chat] ✓ 완료")
                yield "data: [DONE]\n\n"

            except Exception as e:
                logger.error(f"[/api/development/chat] 에러: {e}", exc_info=True)
                yield f"data: {json.dumps({'error': str(e)})}\n\n"
                yield "data: [DONE]\n\n"

        return StreamingResponse(
            generate(),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
            }
        )

    except Exception as e:
        logger.error(f"[/api/development/chat] 초기화 에러: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))
