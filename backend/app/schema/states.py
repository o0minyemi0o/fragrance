"""
LangGraph State 정의

이 파일은 LangGraph 워크플로우에서 사용되는 모든 State 타입을 정의합니다.
각 Agent는 이 State를 기반으로 입력을 받고 출력을 반환합니다.
"""

from typing import List, Dict, Optional, TypedDict, Annotated
from pydantic import BaseModel, Field
from operator import add


# ============================================================================
# Message Types
# ============================================================================

class Message(BaseModel):
    """대화 메시지"""
    role: str  # "user" or "assistant"
    content: str


class Ingredient(BaseModel):
    """원료 정보"""
    ingredient_id: Optional[int] = None
    ingredient_name: str
    inci_name: Optional[str] = None
    cas_number: Optional[str] = None
    odor_description: Optional[str] = None
    note_family: Optional[str] = None
    usage_percentage: Optional[float] = None


class FormulationItem(BaseModel):
    """배합 항목"""
    ingredient: Ingredient
    percentage: float
    note: Optional[str] = None  # Top/Middle/Base note


class Formulation(BaseModel):
    """완성된 배합"""
    name: str
    description: Optional[str] = None
    items: List[FormulationItem]
    total_percentage: float = 100.0
    validation_status: Optional[str] = None  # "valid", "invalid", "warning"
    validation_messages: List[str] = Field(default_factory=list)


# ============================================================================
# LangGraph States
# ============================================================================

class DevelopmentState(TypedDict, total=False):
    """
    Development Mode의 메인 상태

    사용자와의 대화를 통해 향수 배합을 개발하는 과정의 전체 상태를 관리합니다.
    Coordinator가 이 상태를 기반으로 다음 노드를 동적으로 결정합니다.
    """
    # 대화 관련
    messages: Annotated[List[Dict[str, str]], add]  # 대화 히스토리 (누적)
    current_user_input: str  # 현재 사용자 입력

    # 원료 관련
    available_ingredients: List[Dict[str, any]]  # DB에서 가져온 사용 가능 원료
    ingredient_count: int  # 사용 가능한 원료 개수

    # 배합 관련
    user_preferences: Dict[str, any]  # 사용자 선호도 (추출된 정보)
    suggested_ingredients: List[str]  # 제안된 원료 리스트
    formulations: List[Dict[str, any]]  # 생성된 배합안들
    current_formulation: Optional[Dict[str, any]]  # 현재 작업 중인 배합

    # Coordinator 제어
    conversation_stage: str  # "initial", "preference_gathering", "ingredient_suggestion", "formulation", "refinement"
    next_node: Optional[str]  # Coordinator가 결정한 다음 실행할 노드 ("gather", "search", "formulation", "validation", "response", "END")
    coordinator_reasoning: Optional[str]  # Coordinator의 판단 근거 (디버깅용)
    iteration_count: int  # 순환 방지를 위한 반복 횟수

    # 응답
    response: str  # AI의 최종 응답


class IngredientSearchState(TypedDict, total=False):
    """
    원료 검색 Agent의 상태

    사용자 요청을 기반으로 적합한 원료를 검색합니다.
    """
    # 입력
    query: str  # 검색 쿼리 (예: "fresh citrus notes")
    note_family: Optional[str]  # 필터링할 note family
    search_type: str  # "name", "semantic", "hybrid"

    # 출력
    search_results: List[Dict[str, any]]  # 검색 결과
    selected_ingredients: List[Dict[str, any]]  # 선택된 원료


class FormulationState(TypedDict, total=False):
    """
    배합 생성 Agent의 상태

    선택된 원료를 바탕으로 실제 배합을 생성합니다.
    """
    # 입력
    user_requirements: str  # 사용자 요구사항
    available_ingredients: List[Dict[str, any]]  # 사용 가능한 원료

    # 중간 결과
    selected_ingredients: List[str]  # 선택된 원료명
    note_structure: Dict[str, List[str]]  # Top/Middle/Base note 구조

    # 출력
    formulation: Optional[Dict[str, any]]  # 생성된 배합
    reasoning: str  # 배합 생성 이유


class ValidationState(TypedDict, total=False):
    """
    배합 검증 Agent의 상태

    생성된 배합이 규제 및 안전 기준을 만족하는지 검증합니다.
    """
    # 입력
    formulation: Dict[str, any]  # 검증할 배합

    # 검증 결과
    is_valid: bool  # 전체 검증 통과 여부
    total_percentage_valid: bool  # 총 비율이 100%인지
    usage_level_valid: bool  # 각 원료의 사용량이 적정 범위인지
    ifra_compliant: bool  # IFRA 규제 준수 여부

    # 문제점 및 제안
    validation_errors: List[str]  # 오류 메시지
    validation_warnings: List[str]  # 경고 메시지
    suggestions: List[str]  # 개선 제안
    alternative_formulation: Optional[Dict[str, any]]  # 대체 배합안


class CoordinatorState(TypedDict, total=False):
    """
    전체 워크플로우를 조정하는 최상위 상태

    여러 Agent의 결과를 통합하고 다음 단계를 결정합니다.
    """
    # 전역 입력
    session_id: str  # 세션 ID
    user_input: str  # 원본 사용자 입력
    conversation_history: List[Dict[str, str]]  # 전체 대화 히스토리

    # 각 Agent 결과
    development_result: Optional[DevelopmentState]
    search_result: Optional[IngredientSearchState]
    formulation_result: Optional[FormulationState]
    validation_result: Optional[ValidationState]

    # 라우팅 및 제어
    current_agent: str  # 현재 실행 중인 Agent
    next_agent: Optional[str]  # 다음 실행할 Agent
    workflow_complete: bool  # 워크플로우 완료 여부

    # 최종 출력
    final_response: str  # 사용자에게 반환할 최종 응답
    error: Optional[str]  # 오류 메시지
