"""
Chat service for development mode
"""

from google import genai
from app.config import settings
from app.prompts.development_prompts import get_development_system_prompt
from sqlalchemy.orm import Session
from app.db.schema import Ingredient
from typing import List, Dict, Tuple, AsyncGenerator
import logging
import json

logger = logging.getLogger(__name__)


class ChatService:
    """Service for development mode chat operations"""

    def __init__(self):
        """Initialize Gemini client"""
        try:
            logger.info("Initializing Gemini Client for ChatService...")
            self.client = genai.Client(api_key=settings.GOOGLE_API_KEY)
            logger.info("Gemini Client initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize Gemini Client: {e}")
            raise

    def get_available_ingredients(self, db: Session) -> Tuple[str, int]:
        """
        Get available ingredients from database

        Args:
            db: Database session

        Returns:
            Tuple of (formatted ingredient list string, total count)
        """
        ingredients = db.query(Ingredient).all()

        if not ingredients:
            return "There are no ingredients registered in the current database.", 0

        # Group by note family
        by_note_family = {}
        for ing in ingredients:
            note_family = ing.note_family or "Other"
            if note_family not in by_note_family:
                by_note_family[note_family] = []
            by_note_family[note_family].append(
                f"{ing.ingredient_name} ({ing.inci_name or 'N/A'})"
            )

        # Format as string
        result = "**Registered perfume ingredients in the database:**\n\n"
        total_cnt = 0
        for note_family, items in by_note_family.items():
            result += f"**{note_family}:**\n"
            result += ", ".join(items)
            result += "\n\n"
            total_cnt += len(items)

        return result, total_cnt

    async def stream_chat(
        self,
        messages: List[Dict[str, str]],
        db: Session
    ) -> AsyncGenerator[str, None]:
        """
        Stream chat responses

        Args:
            messages: List of chat messages with 'role' and 'content'
            db: Database session

        Yields:
            Streaming response chunks
        """
        try:
            # Get available ingredients
            ingredient_list, ingredient_count = self.get_available_ingredients(db)
            logger.info(f"Loaded {ingredient_count} ingredients for chat context")

            # Build system prompt
            system_prompt = get_development_system_prompt(
                ingredient_list, ingredient_count
            )

            # Build chat history
            chat_history = [{"role": "user", "parts": [{"text": system_prompt}]}]

            for msg in messages:
                chat_history.append({
                    "role": msg["role"],
                    "parts": [{"text": msg["content"]}]
                })

            logger.info(f"Chat history length: {len(chat_history)}")

            # Stream response
            response = self.client.models.generate_content_stream(
                model="gemini-2.0-flash",
                contents=chat_history
            )

            for chunk in response:
                if chunk.text:
                    yield f"data: {json.dumps({'content': chunk.text})}\n\n"

            yield "data: [DONE]\n\n"

        except Exception as e:
            logger.error(f"Stream chat error: {type(e).__name__}: {str(e)}", exc_info=True)
            yield f"data: {json.dumps({'error': str(e)})}\n\n"


# Singleton instance
chat_service = ChatService()
