from groq import Groq
from app.schema.config import settings
from app.prompts import get_accord_generation_prompt, get_formula_generation_prompt
from app.db.queries import get_ingredient_names
from sqlalchemy.orm import Session
from typing import Optional
import logging
import json

logger = logging.getLogger(__name__)

class LLMService:
    def __init__(self):
        try:
            logger.info("🔧 Groq Client 초기화 중...")
            self.client = Groq(api_key=settings.GROQ_API_KEY)
            logger.info("✓ Groq Client 초기화 완료")
        except Exception as e:
            logger.error(f"Groq Client 초기화 실패: {e}")
            raise
    
    def generate_accord(self, accord_type: str, db: Optional[Session] = None, use_available_ingredients: bool = False) -> dict:
        """Accord 조합 생성"""
        # Get ingredient names from DB only if explicitly requested
        ingredient_names = None
        if use_available_ingredients and db:
            try:
                ingredient_names = get_ingredient_names(db)
                logger.info(f"Loaded {len(ingredient_names)} ingredients from DB for context")
            except Exception as e:
                logger.warning(f"Failed to load ingredients: {e}")

        prompt = get_accord_generation_prompt(accord_type, ingredient_names)

        try:
            logger.info(f"🚀 Accord 생성 시작: {accord_type}")
            response = self.client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.7
            )
            result_text = response.choices[0].message.content
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

    def generate_formula(self, formula_type: str, db: Optional[Session] = None, use_available_ingredients: bool = False) -> dict:
        """Formula 조합 생성 (완제품용, 고완성도)"""
        # Get ingredient names from DB only if explicitly requested
        ingredient_names = None
        if use_available_ingredients and db:
            try:
                ingredient_names = get_ingredient_names(db)
                logger.info(f"Loaded {len(ingredient_names)} ingredients from DB for context")
            except Exception as e:
                logger.warning(f"Failed to load ingredients: {e}")

        prompt = get_formula_generation_prompt(formula_type, ingredient_names)

        try:
            logger.info(f"🚀 Formula 생성 시작: {formula_type}")
            response = self.client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.7
            )
            result_text = response.choices[0].message.content
            logger.info(f"✓ Formula 응답 완료")
            
            try:
                result = json.loads(result_text)
            except json.JSONDecodeError:
                start = result_text.find('{')
                end = result_text.rfind('}') + 1
                result = json.loads(result_text[start:end])
            
            return result
        except Exception as e:
            logger.error(f"Formula 생성 실패: {e}", exc_info=True)
            raise

    async def stream_chat(self, messages: list, system_prompt: str):
        """채팅 스트리밍 생성"""
        # 시스템 프롬프트를 첫 메시지로 추가
        chat_history = [{"role": "system", "content": system_prompt}]

        # 기존 메시지 추가
        for msg in messages:
            chat_history.append({
                "role": msg['role'],
                "content": msg['content']
            })

        # Groq streaming API
        stream = self.client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=chat_history,
            temperature=0.7,
            stream=True
        )

        for chunk in stream:
            if chunk.choices[0].delta.content:
                yield chunk.choices[0].delta.content

llm_service = LLMService()