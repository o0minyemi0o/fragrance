"""
Ingredient-related LLM prompt templates
"""


def get_ingredient_autofill_prompt(ingredient_name: str) -> str:
    """
    Get ingredient auto-fill prompt

    Args:
        ingredient_name: Name of the ingredient to get information for

    Returns:
        LLM prompt string
    """
    return f"""You are a fragrance chemistry expert. Given an ingredient name, provide detailed information in JSON format.

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


__all__ = [
    "get_ingredient_autofill_prompt",
]
