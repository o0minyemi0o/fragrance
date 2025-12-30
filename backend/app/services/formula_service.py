"""
Formula Service - 완제품 향수 배합 생성 전문 서비스

Formula는 완성된 향수 배합을 의미합니다.
Accord보다 더 복잡하고 완성도 높은 배합입니다.
"""

from anthropic import Anthropic
from app.schema.config import settings
from app.prompts import get_formula_generation_prompt
from app.db.queries import get_ingredient_names
from sqlalchemy.orm import Session
import logging
import json

logger = logging.getLogger(__name__)


class FormulaService:
    """완제품 향수 배합 생성 서비스"""

    def __init__(self):
        try:
            logger.info("🔧 Anthropic Client 초기화 중 (Formula Service)...")
            self.client = Anthropic(api_key=settings.ANTHROPIC_API_KEY)
            self.model = "claude-sonnet-4-5-20250929"
            logger.info("✓ Anthropic Client 초기화 완료")
        except Exception as e:
            logger.error(f"Anthropic Client 초기화 실패: {e}")
            raise

    def generate_formula(self, formula_type: str, db: Session) -> dict:
        """
        완제품 향수 배합 생성 (고완성도)

        Args:
            formula_type: Formula 타입 (예: "Fresh Floral", "Woody Oriental")
            db: Database session

        Returns:
            Formula 정보
            {
                "name": "Spring Garden EDP",
                "description": "...",
                "ingredients": [...],
                "notes": {
                    "top": [...],
                    "middle": [...],
                    "base": [...]
                },
                ...
            }
        """
        # DB에서 사용 가능한 원료 리스트 가져오기
        try:
            ingredient_names = get_ingredient_names(db)
            logger.info(f"Loaded {len(ingredient_names)} ingredients from DB")
        except Exception as e:
            logger.error(f"Failed to load ingredients: {e}")
            raise

        prompt = get_formula_generation_prompt(formula_type, ingredient_names)

        try:
            logger.info(f"🚀 Formula 생성 시작: {formula_type}")
            response = self.client.messages.create(
                model=self.model,
                max_tokens=4096,
                messages=[{"role": "user", "content": prompt}],
                temperature=0.7
            )
            result_text = response.content[0].text
            logger.info(f"✓ Formula 응답 완료")

            # JSON 파싱
            try:
                result = json.loads(result_text)
            except json.JSONDecodeError:
                # JSON 추출 시도
                start = result_text.find('{')
                end = result_text.rfind('}') + 1
                result = json.loads(result_text[start:end])

            return result
        except Exception as e:
            logger.error(f"Formula 생성 실패: {e}", exc_info=True)
            raise


# Singleton instance
formula_service = FormulaService()
