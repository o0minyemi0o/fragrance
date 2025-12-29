"""
Development Agent - Development Mode의 대화형 배합 생성

사용자와의 대화를 통해 향수 배합을 개발하는 Agent입니다.
LangGraph 노드 함수들을 제공합니다.
"""

from typing import Dict, List, Tuple
from sqlalchemy.orm import Session
import json
from groq import Groq

from app.schema.config import settings
from app.schema.states import DevelopmentState
from app.db.schema import Ingredient
from app.prompts.development_prompts import get_development_system_prompt


class DevelopmentAgent:
    """Development Mode Agent"""

    def __init__(self):
        self.client = Groq(api_key=settings.GROQ_API_KEY)

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

    def coordinate(self, state: DevelopmentState) -> DevelopmentState:
        """
        Coordinator: 현재 상태를 분석하여 다음 실행할 노드 결정

        판단 로직:
        1. iteration_count 증가 및 체크
        2. 현재 대화 단계 및 수집된 정보 분석
        3. 다음 실행할 노드 결정 (gather/search/formulation/validation/response)
        4. coordinator_reasoning 작성 (디버깅용)
        """
        # iteration_count 증가
        current_iteration = state.get("iteration_count", 0)
        state["iteration_count"] = current_iteration + 1

        print(f"\n{'='*60}")
        print(f"[COORDINATOR] Iteration {state['iteration_count']}")
        print(f"{'='*60}")

        # 현재 상태 분석
        conversation_stage = state.get("conversation_stage", "initial")
        user_preferences = state.get("user_preferences", {})
        suggested_ingredients = state.get("suggested_ingredients", [])
        current_formulation = state.get("current_formulation")
        messages = state.get("messages", [])

        print(f"[COORDINATOR] Stage: {conversation_stage}")
        print(f"[COORDINATOR] Preferences collected: {len(user_preferences) if user_preferences else 0} items")
        print(f"[COORDINATOR] Suggested ingredients: {len(suggested_ingredients)}")
        print(f"[COORDINATOR] Formulation exists: {current_formulation is not None}")

        # API 에러 체크 - 에러가 발생했다면 즉시 응답 생성으로
        if state.get("api_error"):
            next_node = "generate_response"
            reasoning = f"API error occurred: {state.get('api_error')} - generating error response"
            state["next_node"] = next_node
            state["coordinator_reasoning"] = reasoning
            print(f"[COORDINATOR] Decision: {next_node}")
            print(f"[COORDINATOR] Reasoning: {reasoning}")
            print(f"{'='*60}\n")
            return state

        # 결정 로직
        next_node = "END"
        reasoning = ""

        # 1. 초기 단계 → 선호도 수집
        if conversation_stage == "initial":
            # 이미 preferences가 있으면 gather를 스킵하고 search로
            print(f"[COORDINATOR] user_preferences type: {type(user_preferences)}, value: {user_preferences}")
            print(f"[COORDINATOR] user_preferences bool check: {bool(user_preferences)}")
            print(f"[COORDINATOR] user_preferences len check: {len(user_preferences) if user_preferences else 0}")

            if user_preferences and len(user_preferences) >= 2:
                next_node = "search"
                reasoning = "Preferences already collected (fallback) - searching for ingredients"
                print(f"[COORDINATOR] Condition matched! Going to search")
            else:
                next_node = "gather"
                reasoning = "Initial conversation - need to gather user preferences"
                print(f"[COORDINATOR] Condition NOT matched. Going to gather")

        # 2. 선호도 수집 단계
        elif conversation_stage == "preference_gathering":
            # 충분한 선호도가 수집되었는지 확인
            if user_preferences and len(user_preferences) >= 2:
                next_node = "search"
                reasoning = "Sufficient preferences collected - searching for ingredients"
            else:
                # 선호도가 부족하면 대화형 응답으로 더 물어보기 (재시도 없이)
                next_node = "generate_response"
                reasoning = "Need to ask user for more details through conversational response"

        # 3. 원료 제안 단계
        elif conversation_stage == "ingredient_suggestion":
            # 원료가 검색되었다면 배합 생성
            if suggested_ingredients or state.get("available_ingredients"):
                next_node = "formulation"
                reasoning = "Ingredients available - creating formulation"
            else:
                next_node = "search"
                reasoning = "Need to search for suitable ingredients"

        # 4. 배합 생성 단계
        elif conversation_stage == "formulation":
            # 배합이 생성되었는지 확인
            if current_formulation:
                # 검증이 필요한지 확인
                if not current_formulation.get("validation_status"):
                    next_node = "validation"
                    reasoning = "Formulation created - needs validation"
                else:
                    next_node = "generate_response"
                    reasoning = "Formulation validated - generating final response"
            else:
                next_node = "formulation"
                reasoning = "Need to create formulation"

        # 5. 정제 단계 (사용자가 수정 요청)
        elif conversation_stage == "refinement":
            # 사용자의 피드백을 반영한 재생성
            next_node = "formulation"
            reasoning = "User requested refinement - recreating formulation"

        # 6. 기본값: 응답 생성
        else:
            next_node = "generate_response"
            reasoning = "Default action - generating response"

        # 상태 업데이트
        state["next_node"] = next_node
        state["coordinator_reasoning"] = reasoning

        print(f"[COORDINATOR] Decision: {next_node}")
        print(f"[COORDINATOR] Reasoning: {reasoning}")
        print(f"{'='*60}\n")

        return state

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

        LLM을 사용하여 대화에서 사용자 선호도 추출
        """
        print("[gather_preferences] Extracting user preferences...")

        current_input = state.get("current_user_input", "")
        messages = state.get("messages", [])

        # 대화 히스토리 구성
        conversation_text = ""
        for msg in messages:
            role = "User" if msg["role"] == "user" else "Assistant"
            conversation_text += f"{role}: {msg['content']}\n"

        if current_input:
            conversation_text += f"User: {current_input}\n"

        # LLM으로 선호도 추출
        extraction_prompt = f"""Analyze the following conversation and extract user preferences for perfume formulation.

Conversation:
{conversation_text}

Extract the following information (return "not specified" if not mentioned):
- target_audience: Age, gender, lifestyle
- fragrance_type: EDT, EDP, Perfume, etc.
- scent_preference: Fresh, Floral, Woody, Oriental, etc.
- mood: Bright, Elegant, Sensual, etc.
- price_range: Budget range if mentioned
- special_requirements: Any specific requests

Return in JSON format:
{{
    "target_audience": "...",
    "fragrance_type": "...",
    "scent_preference": "...",
    "mood": "...",
    "price_range": "...",
    "special_requirements": "..."
}}
"""

        try:
            response = self.client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[{"role": "user", "content": extraction_prompt}],
                temperature=0.7
            )

            # JSON 파싱
            import re
            response_text = response.choices[0].message.content.strip()

            # JSON 부분만 추출 (```json ... ``` 제거)
            json_match = re.search(r'```json\s*(.*?)\s*```', response_text, re.DOTALL)
            if json_match:
                json_str = json_match.group(1)
            else:
                json_str = response_text

            preferences = json.loads(json_str)

            # "not specified" 제거
            preferences = {k: v for k, v in preferences.items() if v and v.lower() != "not specified"}

            state["user_preferences"] = preferences
            print(f"[gather_preferences] Extracted: {preferences}")

            # 대화 단계 업데이트
            if len(preferences) >= 2:
                state["conversation_stage"] = "ingredient_suggestion"
            else:
                state["conversation_stage"] = "preference_gathering"

        except Exception as e:
            print(f"[gather_preferences] Error: {e}")
            error_msg = str(e)

            # API 할당량 에러 확인
            if "RESOURCE_EXHAUSTED" in error_msg or "quota" in error_msg.lower():
                state["api_error"] = "quota_exceeded"
                state["error_message"] = "API quota exceeded. Please try again later or upgrade your plan."
                print(f"[gather_preferences] API quota exceeded")
            else:
                state["api_error"] = "general_error"
                state["error_message"] = f"Error extracting preferences: {error_msg}"
                print(f"[gather_preferences] General API error: {error_msg}")

        return state

    def search_ingredients(self, state: DevelopmentState) -> DevelopmentState:
        """
        원료 검색 노드

        사용자 선호도에 맞는 원료를 DB/ChromaDB에서 검색
        """
        print("[search_ingredients] Searching for suitable ingredients...")

        # DB session 생성
        from app.db.initialization.session import get_db
        db = next(get_db())

        try:
            # DB에서 모든 원료 가져오기 (필터링은 LLM이 처리)
            ingredients = db.query(Ingredient).all()
            state["available_ingredients"] = [
                {
                    "ingredient_id": ing.id,
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

        사용자 선호도와 사용 가능한 원료를 기반으로 실제 배합 생성
        """
        print("[create_formulation] Creating formulation...")

        user_preferences = state.get("user_preferences", {})
        available_ingredients = state.get("available_ingredients", [])

        # 선호도 기반 타입 결정
        fragrance_type = user_preferences.get("fragrance_type", "Eau de Parfum")
        scent_preference = user_preferences.get("scent_preference", "General")
        target_audience = user_preferences.get("target_audience", "General")

        # 사용 가능한 원료명 리스트
        ingredient_names = [ing["ingredient_name"] for ing in available_ingredients] if available_ingredients else None

        # 프롬프트 생성
        from app.prompts.formulation_prompts import get_formula_generation_prompt

        base_prompt = get_formula_generation_prompt(fragrance_type, ingredient_names)

        # 추가 요구사항 반영
        additional_requirements = f"""
Additional Requirements based on user preferences:
- Target Audience: {target_audience}
- Scent Preference: {scent_preference}
- Mood: {user_preferences.get('mood', 'Not specified')}
- Price Range: {user_preferences.get('price_range', 'Not specified')}
- Special Requirements: {user_preferences.get('special_requirements', 'None')}

Please create a formulation that matches these preferences.
"""

        full_prompt = base_prompt + "\n" + additional_requirements

        try:
            response = self.client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[{"role": "user", "content": full_prompt}],
                temperature=0.7
            )

            # JSON 파싱
            import re
            response_text = response.choices[0].message.content.strip()

            # JSON 부분만 추출
            json_match = re.search(r'```json\s*(.*?)\s*```', response_text, re.DOTALL)
            if json_match:
                json_str = json_match.group(1)
            else:
                # JSON 블록이 없으면 전체를 시도
                json_str = response_text

            formulation = json.loads(json_str)

            # 배합 저장
            state["current_formulation"] = formulation
            print(f"[create_formulation] Created: {formulation.get('name', 'Unknown')}")
            print(f"[create_formulation] Ingredients count: {len(formulation.get('ingredients', []))}")

            # 대화 단계 업데이트
            state["conversation_stage"] = "formulation"

        except Exception as e:
            print(f"[create_formulation] Error: {e}")
            error_msg = str(e)

            # API 할당량 에러 확인
            if "RESOURCE_EXHAUSTED" in error_msg or "quota" in error_msg.lower():
                state["api_error"] = "quota_exceeded"
                state["error_message"] = "API quota exceeded. Please try again later or upgrade your plan."
                print(f"[create_formulation] API quota exceeded")
            else:
                state["api_error"] = "general_error"
                state["error_message"] = f"Error creating formulation: {error_msg}"
                print(f"[create_formulation] General API error: {error_msg}")

        return state

    def validate_formulation(self, state: DevelopmentState) -> DevelopmentState:
        """
        배합 검증 노드

        총 비율, Note 밸런스, 원료 개수 등 검증
        """
        print("[validate_formulation] Validating formulation...")

        formulation = state.get("current_formulation")
        if not formulation:
            print("[validate_formulation] No formulation to validate")
            return state

        validation_errors = []
        validation_warnings = []

        ingredients = formulation.get("ingredients", [])

        # 1. 총 비율 체크
        total_percentage = sum(ing.get("percentage", 0) for ing in ingredients)
        if abs(total_percentage - 100.0) > 0.1:  # 0.1% 허용 오차
            validation_errors.append(f"Total percentage is {total_percentage}%, must be 100%")

        # 2. 원료 개수 체크 (최소 5개 권장)
        if len(ingredients) < 5:
            validation_warnings.append(f"Only {len(ingredients)} ingredients. Recommended: at least 5-8 ingredients")

        # 3. Note 밸런스 체크
        note_distribution = {"top": 0, "middle": 0, "base": 0}
        for ing in ingredients:
            note = ing.get("note", "").lower()
            if note in note_distribution:
                note_distribution[note] += ing.get("percentage", 0)

        # Top notes: 5-15%, Middle: 50-70%, Base: 15-30%
        if note_distribution["top"] < 5 or note_distribution["top"] > 15:
            validation_warnings.append(f"Top notes: {note_distribution['top']:.1f}% (recommended: 5-15%)")

        if note_distribution["middle"] < 50 or note_distribution["middle"] > 70:
            validation_warnings.append(f"Middle notes: {note_distribution['middle']:.1f}% (recommended: 50-70%)")

        if note_distribution["base"] < 15 or note_distribution["base"] > 30:
            validation_warnings.append(f"Base notes: {note_distribution['base']:.1f}% (recommended: 15-30%)")
        # 검증 결과 저장
        if validation_errors:
            formulation["validation_status"] = "invalid"
            print(f"[validate_formulation] INVALID - {len(validation_errors)} errors")
        elif validation_warnings:
            formulation["validation_status"] = "warning"
            print(f"[validate_formulation] WARNING - {len(validation_warnings)} warnings")
        else:
            formulation["validation_status"] = "valid"
            print("[validate_formulation] VALID - All checks passed")

        formulation["validation_errors"] = validation_errors
        formulation["validation_warnings"] = validation_warnings

        # 로그 출력
        for error in validation_errors:
            print(f"  ✘ ERROR: {error}")
        for warning in validation_warnings:
            print(f"  ⚠ WARNING: {warning}")

        return state

    def generate_response(self, state: DevelopmentState) -> DevelopmentState:
        """
        응답 생성 노드

        현재 state를 기반으로 사용자에게 보여줄 응답 생성
        """
        print("[generate_response] Generating AI response...")

        # DB session 생성
        from app.db.initialization.session import get_db
        db = next(get_db())

        try:
            # 원료 개수만 가져오기 (토큰 제한을 위해 전체 리스트는 생략)
            ingredients = db.query(Ingredient).all()
            ingredient_count = len(ingredients)

            # System prompt 생성 (ingredient 리스트 없이)
            system_prompt = get_development_system_prompt(ingredient_count=ingredient_count)

            # 대화 히스토리 구성 (Groq API 형식)
            chat_history = [{"role": "system", "content": system_prompt}]

            messages = state.get("messages", [])
            current_input = state.get("current_user_input", "")

            # 최근 10개 메시지만 사용 (토큰 제한 방지)
            recent_messages = messages[-10:] if len(messages) > 10 else messages

            # 기존 메시지 추가
            for msg in recent_messages:
                chat_history.append({
                    "role": msg["role"],
                    "content": msg["content"]
                })

            # 현재 사용자 입력 추가
            if current_input:
                chat_history.append({
                    "role": "user",
                    "content": current_input
                })

            # LLM 호출 (Groq API)
            response = self.client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=chat_history,
                temperature=0.7
            )

            state["response"] = response.choices[0].message.content

        except Exception as e:
            print(f"[generate_response] Error: {e}")
            error_msg = str(e)

            # API 할당량 에러 확인
            if "RESOURCE_EXHAUSTED" in error_msg or "quota" in error_msg.lower():
                state["response"] = "⚠️ API quota exceeded.\n\nWe've reached the daily limit for our AI service. Please try again later or contact support to upgrade your plan.\n\nThank you for your understanding!"
                state["api_error"] = "quota_exceeded"
                print(f"[generate_response] API quota exceeded")
            else:
                state["response"] = f"Sorry, an error occurred while generating response:\n\n{error_msg}\n\nPlease try again or contact support if the issue persists."
                state["api_error"] = "general_error"
                print(f"[generate_response] General API error: {error_msg}")
        finally:
            db.close()

        return state


# Singleton instance
development_agent = DevelopmentAgent()
