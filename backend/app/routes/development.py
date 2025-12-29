from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import List, AsyncGenerator
from sqlalchemy.orm import Session
from app.db.initialization.session import get_db
from app.agents.development.development_graph import get_development_workflow
from app.schema.states import DevelopmentState
import json

router = APIRouter(prefix="/api/development", tags=["development"])


class Message(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    messages: List[Message]


@router.post("/chat")
async def chat_stream(request: ChatRequest, db: Session = Depends(get_db)):
    """Development Mode AI chat using LangGraph workflow"""
    try:
        # Convert Pydantic models to dicts
        messages = [{"role": msg.role, "content": msg.content} for msg in request.messages]

        # Get current user input (last message)
        current_input = messages[-1]["content"] if messages else ""

        # Initialize DevelopmentState
        initial_state: DevelopmentState = {
            "messages": messages[:-1] if len(messages) > 1 else [],  # Previous messages
            "current_user_input": current_input,
            "conversation_stage": "initial",
            "available_ingredients": [],
            "ingredient_count": 0,
            "user_preferences": {},
            "suggested_ingredients": [],
            "formulations": [],
            "current_formulation": None,
            "next_action": None,
            "response": "",
            "api_error": None,
            "error_message": None,
            "iteration_count": 0
        }

        # Get compiled workflow
        workflow = get_development_workflow()

        # Stream workflow execution
        async def generate() -> AsyncGenerator[str, None]:
            try:
                # Execute workflow with streaming
                for output in workflow.stream(initial_state):
                    # LangGraph stream returns dict with node name as key
                    # We're interested in the final response
                    for node_name, node_output in output.items():
                        print(f"[workflow] Node '{node_name}' executed")

                        # If this node generated a response, stream it
                        if "response" in node_output and node_output["response"]:
                            response_text = node_output["response"]
                            # Send as SSE format
                            yield f"data: {json.dumps({'content': response_text})}\n\n"

                # Send completion signal
                yield "data: [DONE]\n\n"

            except Exception as e:
                print(f"[workflow] Error: {e}")
                import traceback
                traceback.print_exc()
                yield f"data: {json.dumps({'error': str(e)})}\n\n"

        return StreamingResponse(
            generate(),
            media_type="text/event-stream"
        )

    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
