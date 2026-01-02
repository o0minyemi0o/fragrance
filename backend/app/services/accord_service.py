"""
Accord Service - Accord 조합 생성 전문 서비스

Accord는 향수의 특정 향 조합을 의미합니다.
예: Floral Accord, Woody Accord, Citrus Accord 등
"""

from anthropic import Anthropic
from app.schema.config import settings
from app.prompts import get_accord_generation_prompt
from app.db.queries import get_ingredient_names
from sqlalchemy.orm import Session
import logging
import json

logger = logging.getLogger(__name__)


class AccordService:
    """Accord 조합 생성 서비스"""

    def __init__(self):
        try:
            logger.info("🔧 Anthropic Client 초기화 중 (Accord Service)...")
            self.client = Anthropic(api_key=settings.ANTHROPIC_API_KEY)
            self.model = "claude-sonnet-4-5-20250929"
            logger.info("✓ Anthropic Client 초기화 완료")
        except Exception as e:
            logger.error(f"Anthropic Client 초기화 실패: {e}")
            raise

    def generate_accord(self, accord_type: str, db: Session) -> dict:
        """
        Accord 조합 생성

        Args:
            accord_type: Accord 타입 (예: "Floral", "Woody", "Citrus")
            db: Database session

        Returns:
            Accord 조합 정보
            {
                "name": "Fresh Floral Accord",
                "description": "...",
                "ingredients": [...],
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

        prompt = get_accord_generation_prompt(accord_type, ingredient_names)

        try:
            logger.info(f"🚀 Accord 생성 시작: {accord_type}")
            response = self.client.messages.create(
                model=self.model,
                max_tokens=4096,
                messages=[{"role": "user", "content": prompt}],
                temperature=0.7
            )
            result_text = response.content[0].text
            logger.info(f"✓ Accord 응답 완료")

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
            logger.error(f"Accord 생성 실패: {e}", exc_info=True)
            raise


# Singleton instance
accord_service = AccordService()
