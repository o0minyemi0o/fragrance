from google import genai
from app.config import settings
from app.prompts import get_accord_generation_prompt, get_formula_generation_prompt
import logging
import json

logger = logging.getLogger(__name__)

class LLMService:
    def __init__(self):
        try:
            logger.info("🔧 Gemini Client 초기화 중...")
            self.client = genai.Client(api_key=settings.GOOGLE_API_KEY)
            logger.info("✓ Gemini Client 초기화 완료")
        except Exception as e:
            logger.error(f"Gemini Client 초기화 실패: {e}")
            raise
    
    def generate_accord(self, accord_type: str) -> dict:
        """Accord 조합 생성"""
        prompt = get_accord_generation_prompt(accord_type)

        try:
            logger.info(f"🚀 Accord 생성 시작: {accord_type}")
            response = self.client.models.generate_content(
                model="gemini-2.0-flash",
                contents=prompt
            )
            result_text = response.text
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

    def generate_formula(self, formula_type: str) -> dict:
        """Formula 조합 생성 (완제품용, 고완성도)"""
        prompt = get_formula_generation_prompt(formula_type)

        try:
            logger.info(f"🚀 Formula 생성 시작: {formula_type}")
            response = self.client.models.generate_content(
                model="gemini-2.0-flash",
                contents=prompt
            )
            result_text = response.text
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
        # 시스템 프롬프트를 첫 메시지에 포함
        chat_history = []
        
        if messages:
            first_message = f"{system_prompt}\n\n사용자 요청: {messages[0]['content']}"
            chat_history.append({
                "role": "user",
                "parts": [{"text": first_message}]
            })
            
            for msg in messages[1:]:
                role = "model" if msg['role'] == "assistant" else "user"
                chat_history.append({
                    "role": role,
                    "parts": [{"text": msg['content']}]
                })
        
        response = self.client.models.generate_content_stream(
            model="gemini-2.0-flash-exp",
            contents=chat_history
        )
        
        for chunk in response:
            if chunk.text:
                yield chunk.text

llm_service = LLMService()