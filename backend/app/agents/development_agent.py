"""
Development Agent - Development Mode의 대화형 배합 생성

사용자와의 대화를 통해 향수 배합을 개발하는 Agent입니다.
LangGraph 노드 함수들을 제공합니다.
"""

from typing import Dict, List, Tuple
from sqlalchemy.orm import Session
import json
import google.generativeai as genai

from app.schema.config import settings
from app.schema.states import DevelopmentState
from app.db.schema import Ingredient
from app.prompts.development_prompts import get_development_system_prompt


class DevelopmentAgent:
    """Development Mode Agent"""

    def __init__(self):
        self.client = genai.Client(api_key=settings.GOOGLE_API_KEY)

    def get_available_ingredients(self, db: Session) -> Tuple[str, int]:
        """
        DB에서 사용 가능한 원료 목록 가져오기

        Returns:
            (ingredient_list_string, count)
        """
        ingredients = db.query(Ingredient).all()

        # Note family별로 그룹화
        by_note_family = {}
        for ing in ingredients:
            note_family = ing.note_family or "Other"
            if note_family not in by_note_family:
                by_note_family[note_family] = []
            by_note_family[note_family].append(
                f"{ing.ingredient_name} ({ing.inci_name or 'N/A'})"
            )

        # 문자열로 포맷팅
        result = "**Registered perfume ingredients in the database:**\n\n"
        total_cnt = 0
        for note_family, items in by_note_family.items():
            result += f"**{note_family}:**\n"
            result += ", ".join(items)
            result += "\n\n"
            total_cnt += len(items)

        return result, total_cnt

    def parse_request(self, state: DevelopmentState) -> DevelopmentState:
        """
        사용자 입력 파싱 노드

        현재는 간단하게 대화 stage 설정만 수행
        """
        print(f"[parse_request] User input: {state.get('current_user_input', 'N/A')[:50]}...")

        # 대화 히스토리가 없으면 initial stage
        if not state.get("messages") or len(state["messages"]) == 0:
            state["conversation_stage"] = "initial"
        else:
            # 메시지 개수에 따라 단계 추론 (간단한 로직)
            msg_count = len(state["messages"])
            if msg_count <= 2:
                state["conversation_stage"] = "preference_gathering"
            elif msg_count <= 6:
                state["conversation_stage"] = "ingredient_suggestion"
            else:
                state["conversation_stage"] = "formulation"

        return state

    def gather_preferences(self, state: DevelopmentState) -> DevelopmentState:
        """
        사용자 선호도 수집 노드

        LLM을 사용하여 사용자 선호도 추출
        """
        print("[gather_preferences] Extracting user preferences...")

        # 대화 히스토리에서 선호도 추출 (간단 구현)
        messages = state.get("messages", [])
        if len(messages) > 0:
            # TODO: LLM으로 선호도 추출
            # 현재는 placeholder
            state["user_preferences"] = {
                "extracted": True,
                "message_count": len(messages)
            }

        return state

    def search_ingredients(self, state: DevelopmentState) -> DevelopmentState:
        """
        원료 검색 노드

        사용자 선호도에 맞는 원료를 DB/ChromaDB에서 검색
        """
        print("[search_ingredients] Searching for suitable ingredients...")

        # DB session 생성
        from app.db.database import get_db
        db = next(get_db())

        try:
            # DB에서 모든 원료 가져오기 (필터링은 LLM이 처리)
            ingredients = db.query(Ingredient).all()
            state["available_ingredients"] = [
                {
                    "ingredient_id": ing.ingredient_id,
                    "ingredient_name": ing.ingredient_name,
                    "inci_name": ing.inci_name,
                    "note_family": ing.note_family,
                    "odor_description": ing.odor_description
                }
                for ing in ingredients
            ]
            state["ingredient_count"] = len(ingredients)
        finally:
            db.close()

        return state

    def create_formulation(self, state: DevelopmentState) -> DevelopmentState:
        """
        배합 생성 노드

        LLM을 사용하여 실제 배합 생성 (아직 구현 안 함, placeholder)
        """
        print("[create_formulation] Creating formulation...")

        # TODO: 실제 배합 생성 로직
        # 현재는 placeholder
        state["current_formulation"] = {
            "name": "Placeholder Formula",
            "items": [],
            "status": "created"
        }

        return state

    def validate_formulation(self, state: DevelopmentState) -> DevelopmentState:
        """
        배합 검증 노드

        IFRA 규제, 비율 체크 등
        """
        print("[validate_formulation] Validating formulation...")

        formulation = state.get("current_formulation")
        if formulation:
            # 간단한 검증 (실제로는 더 복잡)
            formulation["validation_status"] = "valid"
            formulation["validation_messages"] = ["Basic validation passed"]

        return state

    def generate_response(self, state: DevelopmentState) -> DevelopmentState:
        """
        응답 생성 노드

        현재 state를 기반으로 사용자에게 보여줄 응답 생성
        """
        print("[generate_response] Generating AI response...")

        # DB session 생성
        from app.db.database import get_db
        db = next(get_db())

        try:
            # 원료 정보 가져오기
            ingredient_list, ingredient_count = self.get_available_ingredients(db)

        # System prompt 생성
        system_prompt = get_development_system_prompt(ingredient_list, ingredient_count)

        # 대화 히스토리 구성
        chat_history = [{"role": "user", "parts": [{"text": system_prompt}]}]

        messages = state.get("messages", [])
        for msg in messages:
            chat_history.append({
                "role": msg["role"],
                "parts": [{"text": msg["content"]}]
            })

        # 현재 사용자 입력 추가
        current_input = state.get("current_user_input", "")
        if current_input:
            chat_history.append({
                "role": "user",
                "parts": [{"text": current_input}]
            })

        # LLM 호출
        try:
            response = self.client.models.generate_content(
                model="gemini-2.0-flash",
                contents=chat_history
            )

            state["response"] = response.text

        except Exception as e:
            print(f"[generate_response] Error: {e}")
            state["response"] = f"Sorry, an error occurred: {str(e)}"
        finally:
            db.close()

        return state


# Singleton instance
development_agent = DevelopmentAgent()
