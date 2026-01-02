"""
Development Service - 간단한 대화형 향수 개발 서비스

복잡한 Agent 구조 없이 스트리밍 대화만 제공합니다.
나중에 필요시 Tool 추가 가능 (레퍼런스 분석, validation 등)
"""

from anthropic import Anthropic
from app.schema.config import settings
from app.prompts.development_prompts import get_development_system_prompt
from app.db.queries import get_ingredient_names
from sqlalchemy.orm import Session
import logging

logger = logging.getLogger(__name__)


class DevelopmentService:
    """Development Mode 대화 서비스"""

    def __init__(self):
        try:
            logger.info("🔧 Anthropic Client 초기화 중 (Development Service)...")
            self.client = Anthropic(api_key=settings.ANTHROPIC_API_KEY)
            self.model = "claude-sonnet-4-5-20250929"
            logger.info("✓ Anthropic Client 초기화 완료")
        except Exception as e:
            logger.error(f"Anthropic Client 초기화 실패: {e}")
            raise

    async def stream_chat(self, messages: list, db: Session):
        """
        대화 스트리밍 생성

        Args:
            messages: 대화 히스토리 [{"role": "user", "content": "..."}, ...]
            db: Database session

        Yields:
            스트리밍 텍스트 청크
        """
        # DB에서 향료 리스트 가져오기
        try:
            ingredient_names = get_ingredient_names(db)
            ingredient_list = ", ".join(ingredient_names)
            ingredient_count = len(ingredient_names)
            logger.info(f"Loaded {ingredient_count} ingredients from DB")
        except Exception as e:
            logger.error(f"Failed to load ingredients: {e}")
            ingredient_list = ""
            ingredient_count = 0

        # System prompt 생성
        system_prompt = get_development_system_prompt(
            ingredient_list=ingredient_list,
            ingredient_count=ingredient_count
        )

        logger.info(f"🚀 Development chat 시작 (메시지 수: {len(messages)})")

        try:
            # Anthropic streaming API
            with self.client.messages.stream(
                model=self.model,
                max_tokens=4096,
                system=system_prompt,
                messages=messages,
                temperature=0.7
            ) as stream:
                for text in stream.text_stream:
                    yield text

            logger.info("✓ Development chat 완료")

        except Exception as e:
            logger.error(f"Development chat 에러: {e}", exc_info=True)

            # 에러 메시지 스트리밍
            error_message = f"""
죄송합니다. 응답 생성 중 오류가 발생했습니다.

**오류:** {str(e)}

잠시 후 다시 시도해 주세요.
"""
            yield error_message


# Singleton instance
development_service = DevelopmentService()
