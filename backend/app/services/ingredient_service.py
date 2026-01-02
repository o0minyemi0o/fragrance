"""
Ingredient business logic service
"""

from anthropic import Anthropic
from app.schema.config import settings
from app.prompts.ingredient_prompts import get_ingredient_autofill_prompt
import logging
import json

logger = logging.getLogger(__name__)


class IngredientService:
    """Service for ingredient-related operations"""

    def __init__(self):
        """Initialize Anthropic client"""
        try:
            logger.info("Initializing Anthropic Client for IngredientService...")
            self.client = Anthropic(api_key=settings.ANTHROPIC_API_KEY)
            self.model = "claude-sonnet-4-5-20250929"
            logger.info("Anthropic Client initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize Anthropic Client: {e}")
            raise

    def auto_fill(self, ingredient_name: str) -> dict:
        """
        Auto-fill ingredient information using LLM

        Args:
            ingredient_name: Name of the ingredient

        Returns:
            dict with ingredient information

        Raises:
            ValueError: If ingredient name is empty
            Exception: If LLM call fails
        """
        if not ingredient_name or not ingredient_name.strip():
            raise ValueError("Ingredient name is required")

        ingredient_name = ingredient_name.strip()
        logger.info(f"Auto-fill request for: '{ingredient_name}'")

        try:
            prompt = get_ingredient_autofill_prompt(ingredient_name)

            logger.info("Calling Anthropic API...")
            response = self.client.messages.create(
                model=self.model,
                max_tokens=4096,
                messages=[{"role": "user", "content": prompt}],
                temperature=0.7
            )

            response_text = response.content[0].text.strip()
            logger.info(f"Anthropic response received: {response_text[:100]}...")

            # Clean markdown formatting
            if response_text.startswith('```json'):
                response_text = response_text[7:]
            elif response_text.startswith('```'):
                response_text = response_text[3:]

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
            raise Exception(f"Failed to parse LLM response: {str(e)}")
        except Exception as e:
            logger.error(f"Auto-fill error: {type(e).__name__}: {str(e)}", exc_info=True)
            raise


# Singleton instance
ingredient_service = IngredientService()
