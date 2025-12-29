"""
LangGraph 워크플로우 정의

Development Mode의 multi-agent workflow를 정의합니다.
Coordinator가 상태를 분석하여 다음 실행할 노드를 동적으로 결정하는 유연한 구조입니다.
"""

from typing import Literal
from langgraph.graph import StateGraph, END
from app.schema.states import DevelopmentState, CoordinatorState
from app.agents.development.development_agent import development_agent
import logging

logger = logging.getLogger(__name__)


# ============================================================================
# Coordinator Node - 모든 흐름을 제어
# ============================================================================

def coordinator_node(state: DevelopmentState) -> DevelopmentState:
    """
    Coordinator: 현재 상태를 분석하여 다음 실행할 노드를 결정

    판단 기준:
    1. 사용자 입력 분석 (새로운 요청인지, 수정 요청인지 등)
    2. 현재 대화 단계 확인
    3. 수집된 정보의 충분성 체크
    4. 배합 존재 여부 및 검증 필요성
    5. 무한 루프 방지 (iteration_count)

    반환: next_node 필드에 다음 노드 설정
    """
    return development_agent.coordinate(state)


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
# Routing Functions (Coordinator 기반 동적 라우팅)
# ============================================================================

def route_from_coordinator(state: DevelopmentState) -> str:
    """
    Coordinator가 결정한 다음 노드로 라우팅

    Coordinator 노드에서 설정한 'next_node' 필드를 읽어서 라우팅합니다.
    가능한 값: "parse", "gather", "search", "formulation", "validation", "generate_response", "END"
    """
    next_node = state.get("next_node", "END")

    logger.info(f"[Routing] Coordinator decision: {next_node}")
    logger.debug(f"[Routing] Reasoning: {state.get('coordinator_reasoning', 'N/A')}")

    return next_node


def route_back_to_coordinator(state: DevelopmentState) -> Literal["coordinator", "END"]:
    """
    각 노드 실행 후 Coordinator로 되돌아가기

    무한 루프 방지를 위해 iteration_count를 체크합니다.
    """
    iteration = state.get("iteration_count", 0)
    max_iterations = 30  # 최대 반복 횟수 (안전장치)

    if iteration >= max_iterations:
        logger.warning(f"[Routing] Max iterations ({max_iterations}) reached. Forcing END.")
        return "END"

    # 응답 노드 실행 후에는 종료
    if state.get("response"):
        logger.info(f"[Routing] Response generated. Ending workflow.")
        return "END"

    return "coordinator"


# ============================================================================
# Graph Builder
# ============================================================================

def build_development_graph() -> StateGraph:
    """
    Coordinator 기반 유연한 Development Mode 워크플로우

    워크플로우 구조:
        [START]
           ↓
      [parse_request] ← 초기 사용자 입력 파싱 (1회만)
           ↓
      [coordinator] ← 상태 분석 및 다음 노드 결정
           ↓
      [동적 라우팅] ← coordinator의 next_node 결정에 따라 분기
           ↓
      ┌────┴────┬──────────┬────────────┬──────────┬──────────┐
      ↓         ↓          ↓            ↓          ↓          ↓
    [gather] [search] [formulation] [validation] [response] [END]
      ↓         ↓          ↓            ↓          ↓
      └────┬────┴──────────┴────────────┴──────────┘
           ↓
      [coordinator] ← 다시 coordinator로 복귀 (순환)
           ↓
         (반복)

    특징:
    - Coordinator가 매번 상태를 체크하여 다음 노드 결정
    - 노드들은 언제든 자유롭게 호출 가능 (순서 제약 없음)
    - 대화 흐름이 유연하고 동적으로 변화
    - iteration_count로 무한 루프 방지
    """

    # StateGraph 생성
    workflow = StateGraph(DevelopmentState)

    # 노드 등록
    workflow.add_node("parse_request", parse_request_node)
    workflow.add_node("coordinator", coordinator_node)
    workflow.add_node("gather", gather_preferences_node)
    workflow.add_node("search", search_ingredients_node)
    workflow.add_node("formulation", create_formulation_node)
    workflow.add_node("validation", validate_formulation_node)
    workflow.add_node("generate_response", generate_response_node)

    # 시작점: parse_request (초기 입력 파싱)
    workflow.set_entry_point("parse_request")

    # parse_request → coordinator (초기 진입)
    workflow.add_edge("parse_request", "coordinator")

    # coordinator → 동적 라우팅 (next_node에 따라)
    workflow.add_conditional_edges(
        "coordinator",
        route_from_coordinator,
        {
            "parse": "parse_request",
            "gather": "gather",
            "search": "search",
            "formulation": "formulation",
            "validation": "validation",
            "generate_response": "generate_response",
            "END": END,
        }
    )

    # 각 노드 → coordinator로 복귀 (순환 구조)
    for node in ["gather", "search", "formulation", "validation"]:
        workflow.add_conditional_edges(
            node,
            route_back_to_coordinator,
            {
                "coordinator": "coordinator",
                "END": END,
            }
        )

    # generate_response 노드만 예외: 응답 생성 후 종료
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
