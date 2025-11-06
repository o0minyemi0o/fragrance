from sqlalchemy.orm import declarative_base

Base = declarative_base()

# 각 모델 임포트
from .ingredient import Ingredient
from .accord import Accord
from .formula import Formula
from .recommendation import Recommendation

__all__ = ["Base", "Ingredient", "Accord", "Formula", "Recommendation"]
