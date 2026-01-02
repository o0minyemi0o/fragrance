"""
Ingredient DB query functions
"""

from sqlalchemy.orm import Session
from app.db.schema import Ingredient
from typing import List, Optional


def get_all_ingredients(db: Session) -> List[Ingredient]:
    """Get all Ingredients"""
    return db.query(Ingredient).all()


def get_ingredient_by_id(db: Session, ingredient_id: int) -> Optional[Ingredient]:
    """Get Ingredient by ID"""
    return db.query(Ingredient).filter(Ingredient.id == ingredient_id).first()


def create_ingredient(db: Session, ingredient_data: dict) -> Ingredient:
    """Create new Ingredient"""
    new_ingredient = Ingredient(**ingredient_data)
    db.add(new_ingredient)
    db.commit()
    db.refresh(new_ingredient)
    return new_ingredient


def update_ingredient(db: Session, ingredient_id: int, update_data: dict) -> Optional[Ingredient]:
    """Update Ingredient"""
    ingredient = get_ingredient_by_id(db, ingredient_id)
    if not ingredient:
        return None

    for key, value in update_data.items():
        setattr(ingredient, key, value)

    db.commit()
    db.refresh(ingredient)
    return ingredient


def delete_ingredient(db: Session, ingredient_id: int) -> bool:
    """Delete Ingredient"""
    ingredient = get_ingredient_by_id(db, ingredient_id)
    if not ingredient:
        return False

    db.delete(ingredient)
    db.commit()
    return True


def search_ingredients_by_name(db: Session, query: str) -> List[Ingredient]:
    """Search ingredients by name (partial match, case-insensitive)"""
    search_pattern = f"%{query}%"
    return db.query(Ingredient).filter(
        Ingredient.ingredient_name.ilike(search_pattern)
    ).all()


def get_ingredient_names(db: Session) -> List[str]:
    """Get all ingredient names for LLM context"""
    ingredients = db.query(Ingredient.ingredient_name).all()
    return [ing[0] for ing in ingredients]
