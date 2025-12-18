"""
LangGraph 워크플로우 정의

Development Mode의 multi-agent workflow를 정의합니다.
각 노드는 특정 역할을 가진 Agent를 나타내며, 엣지는 데이터 흐름을 나타냅니다.
"""

from typing import Literal
from langgraph.graph import StateGraph, END
from app.schema.states import DevelopmentState, CoordinatorState
from app.agents.development_agent import development_agent


# ============================================================================
# Node Functions (Development Agent 사용)
# ============================================================================

def parse_request_node(state: DevelopmentState) -> DevelopmentState:
    """사용자 입력 파싱 노드"""
    return development_agent.parse_request(state)


def gather_preferences_node(state: DevelopmentState) -> DevelopmentState:
    """사용자 선호도 수집 노드"""
    return development_agent.gather_preferences(state)


def search_ingredients_node(state: DevelopmentState) -> DevelopmentState:
    """원료 검색 노드"""
    return development_agent.search_ingredients(state)


def create_formulation_node(state: DevelopmentState) -> DevelopmentState:
    """배합 생성 노드"""
    return development_agent.create_formulation(state)


def validate_formulation_node(state: DevelopmentState) -> DevelopmentState:
    """배합 검증 노드"""
    return development_agent.validate_formulation(state)


def generate_response_node(state: DevelopmentState) -> DevelopmentState:
    """응답 생성 노드"""
    return development_agent.generate_response(state)


# ============================================================================
# Routing Functions (조건부 엣지)
# ============================================================================

def route_by_stage(state: DevelopmentState) -> Literal["gather_preferences", "search_ingredients", "create_formulation", "generate_response"]:
    """
    대화 단계에 따른 라우팅

    - initial: gather_preferences
    - preference_gathering: search_ingredients (충분한 정보가 모였다면)
    - ingredient_suggestion: create_formulation (사용자가 원료를 선택했다면)
    - formulation: generate_response (배합이 완성되었다면)
    """
    stage = state.get("conversation_stage", "initial")

    if stage == "initial":
        return "gather_preferences"
    elif stage == "preference_gathering":
        # 충분한 선호도 정보가 있는지 체크
        preferences = state.get("user_preferences", {})
        if len(preferences) >= 2:  # 최소 2개 이상의 선호도
            return "search_ingredients"
        else:
            return "gather_preferences"
    elif stage == "ingredient_suggestion":
        return "create_formulation"
    elif stage == "formulation":
        return "generate_response"
    else:
        return "generate_response"


def should_validate(state: DevelopmentState) -> Literal["validate", "skip"]:
    """
    배합 검증 필요 여부 판단

    배합이 생성되었고, 아직 검증되지 않았다면 검증 수행
    """
    formulation = state.get("current_formulation")

    if formulation and not formulation.get("validation_status"):
        return "validate"
    else:
        return "skip"


# ============================================================================
# Graph Builder
# ============================================================================

def build_development_graph() -> StateGraph:
    """
    Development Mode 워크플로우 그래프 빌드

    워크플로우:
        [START]
           ↓
      [parse_request] ← 사용자 입력 파싱
           ↓
      [route_by_stage] ← 조건부 라우팅
           ↓
      ┌────┴────┬──────────────┬────────────┐
      ↓         ↓              ↓            ↓
    [gather]  [search]  [formulation]  [response]
      ↓         ↓              ↓            ↓
      └────┬────┴──────────────┴────────────┘
           ↓
     [should_validate?]
           ↓
      [validate] (조건부)
           ↓
     [generate_response]
           ↓
         [END]
    """

    # StateGraph 생성
    workflow = StateGraph(DevelopmentState)

    # 노드 등록
    workflow.add_node("parse_request", parse_request_node)
    workflow.add_node("gather_preferences", gather_preferences_node)
    workflow.add_node("search_ingredients", search_ingredients_node)
    workflow.add_node("create_formulation", create_formulation_node)
    workflow.add_node("validate_formulation", validate_formulation_node)
    workflow.add_node("generate_response", generate_response_node)

    # 시작점 설정
    workflow.set_entry_point("parse_request")

    # 엣지 연결
    # 1. parse_request → 조건부 라우팅
    workflow.add_conditional_edges(
        "parse_request",
        route_by_stage,
        {
            "gather_preferences": "gather_preferences",
            "search_ingredients": "search_ingredients",
            "create_formulation": "create_formulation",
            "generate_response": "generate_response",
        }
    )

    # 2. gather_preferences → search_ingredients
    workflow.add_edge("gather_preferences", "search_ingredients")

    # 3. search_ingredients → create_formulation
    workflow.add_edge("search_ingredients", "create_formulation")

    # 4. create_formulation → 조건부 검증
    workflow.add_conditional_edges(
        "create_formulation",
        should_validate,
        {
            "validate": "validate_formulation",
            "skip": "generate_response",
        }
    )

    # 5. validate_formulation → generate_response
    workflow.add_edge("validate_formulation", "generate_response")

    # 6. generate_response → END
    workflow.add_edge("generate_response", END)

    return workflow


def build_coordinator_graph() -> StateGraph:
    """
    Coordinator 워크플로우 (향후 확장용)

    여러 Agent를 조율하는 상위 레벨 그래프
    현재는 Development Agent만 있지만, 향후 추가될 수 있음:
    - Market Research Agent
    - Trend Analysis Agent
    - Regulatory Compliance Agent
    """

    workflow = StateGraph(CoordinatorState)

    # TODO: 향후 구현
    # workflow.add_node("route_to_agent", route_to_agent_node)
    # workflow.add_node("development_agent", development_workflow)
    # workflow.add_node("research_agent", research_workflow)

    return workflow


# ============================================================================
# Compiled Graphs (바로 사용 가능한 인스턴스)
# ============================================================================

def get_development_workflow():
    """
    컴파일된 Development 워크플로우 반환

    사용 예시:
    ```python
    workflow = get_development_workflow()
    result = workflow.invoke({
        "current_user_input": "30대 여성을 위한 프레시 플로럴 향수를 만들고 싶어요",
        "messages": [],
        "available_ingredients": [...],
        "ingredient_count": 150
    })
    print(result["response"])
    ```
    """
    graph = build_development_graph()
    return graph.compile()


# 모듈 로드 시 자동으로 워크플로우 컴파일 (선택사항)
# development_workflow_app = get_development_workflow()
