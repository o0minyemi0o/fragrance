from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import List
from sqlalchemy.orm import Session
from app.db.initialization.session import get_db
from app.services.chat_service import chat_service

router = APIRouter(prefix="/api/development", tags=["development"])


class Message(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    messages: List[Message]


@router.post("/chat")
async def chat_stream(request: ChatRequest, db: Session = Depends(get_db)):
    """Development Mode AI chat (streaming)"""
    try:
        # Convert Pydantic models to dicts
        messages = [{"role": msg.role, "content": msg.content} for msg in request.messages]

        # Stream response using chat service
        return StreamingResponse(
            chat_service.stream_chat(messages, db),
            media_type="text/event-stream"
        )

    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
