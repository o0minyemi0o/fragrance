"""
Formulation LLM prompt templates
"""

from typing import Optional, List


def get_accord_generation_prompt(accord_type: str, ingredient_names: Optional[List[str]] = None) -> str:
    """
    Get Accord generation prompt

    Args:
        accord_type: Type of accord to generate
        ingredient_names: Optional list of available ingredient names from database
    """
    ingredient_list = ""
    if ingredient_names:
        ingredient_list = f"""
Available ingredients in database:
{', '.join(ingredient_names)}

IMPORTANT: Prefer using ingredients from this list when possible.
"""

    return f"""You are a professional perfumer. Generate a simple and clear {accord_type} accord.
{ingredient_list}
Return JSON format:
{{
  "name": "{accord_type} Accord",
  "type": "{accord_type}",
  "description": "Clear description of this accord",
  "ingredients": [
    {{"name": "Ingredient", "percentage": 25, "note": "top", "role": "Top Impact", "cas_number": "", "supplier": ""}},
    {{"name": "Ingredient", "percentage": 50, "note": "middle", "role": "Supporting", "cas_number": "", "supplier": ""}},
    {{"name": "Ingredient", "percentage": 25, "note": "base", "role": "Masking", "cas_number": "", "supplier": ""}}
  ],
  "longevity": "6-8 hours",
  "sillage": "moderate",
  "recommendation": "Brief explanation of this accord composition"
}}"""


def get_formula_generation_prompt(formula_type: str, ingredient_names: Optional[List[str]] = None) -> str:
    """
    Get Formula generation prompt

    Args:
        formula_type: Type of formula to generate
        ingredient_names: Optional list of available ingredient names from database
    """
    ingredient_list = ""
    if ingredient_names:
        ingredient_list = f"""
Available ingredients in database:
{', '.join(ingredient_names)} 

IMPORTANT: Prefer using ingredients from this list when possible.
"""

    return f"""You are an expert fragrance formulator. Generate a high-quality, complete {formula_type} fragrance formula for mass production.
{ingredient_list}
Include proper percentages for:
- Top notes (5-15%)
- Middle notes (50-70%)
- Base notes (15-30%)

Your formula can include roles such as:
Fixative, Main Accord, Supporting, Top Impact, Bridge, Modifier, Booster, Character, Masking, Sweetener, Texture

Return JSON:
{{
  "name": "{formula_type} Formula",
  "type": "{formula_type}",
  "description": "Professional fragrance formula description",
  "ingredients": [
    {{"name": "Ingredient", "percentage": 25, "note": "top", "role": "Top Impact", "cas_number": "", "supplier": ""}},
    {{"name": "Ingredient", "percentage": 50, "note": "middle", "role": "Supporting", "cas_number": "", "supplier": ""}},
    {{"name": "Ingredient", "percentage": 25, "note": "base", "role": "Masking", "cas_number": "", "supplier": ""}}
  ],
  "total_percentage": 100.0,
  "longevity": "10+ hours",
  "sillage": "strong",
  "stability_notes": "Storage and stability information",
  "recommendation": "Complete fragrance development recommendation"
}}"""


__all__ = [
    "get_accord_generation_prompt",
    "get_formula_generation_prompt",
]
