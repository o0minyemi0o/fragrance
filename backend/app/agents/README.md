# Agents - AI 비즈니스 로직 레이어

## 📋 역할
향료 배합 생성의 **핵심 비즈니스 로직**을 담당하는 AI Agent들입니다. LangGraph 기반으로 구조화된 워크플로우를 통해 **배합 생성, 시장 분석, 전략 수립, 검증**을 자동화합니다.

## 📁 폴더 구조
```
agents/
├── README.md
├── coordinator.py              # 총괄 오케스트레이터
│
├── formulation/               # 배합 생성 Agent 그룹
│   ├── README.md
│   ├── formulation_agent.py   # 메인 배합 생성
│   ├── reference_agent.py     # 레퍼런스 분석
│   └── accord_generator.py    # 어코드 생성
│
├── research/                  # 시장 조사 Agent 그룹
│   ├── README.md
│   ├── market_research_agent.py     # 시장 트렌드
│   └── consumer_insight_agent.py    # 소비자 인사이트
│
├── strategy/                  # 전략 Agent 그룹
│   ├── README.md
│   ├── positioning_agent.py   # 포지셔닝
│   └── pricing_agent.py       # 가격 전략
│
└── validation/                # 검증 Agent 그룹
    ├── README.md
    ├── formulation_validator.py    # IFRA, 밸런스 체크
    ├── safety_validator.py         # 안전성 검증
    └── quality_validator.py        # 품질 검증
```

---

## 🎯 전체 워크플로우

### 1. 대화형 워크플로우
```
                            [사용자 입력]
                   "30대 여성, 프레시 플로럴, 3만원대"
                                ↓
                           [Coordinator]
                           parse_request
                                ↓
            ┌───────────────────┼───────────────────┐
            ↓                   ↓                   ↓
      [Formulation]        [Research]         [Strategy]
      ← 핵심 Agent          (필요시)            (옵셔널)
      (배합 생성)           - 시장 트렌드       - 포지셔닝
                           - 소비자 인사이트   - 가격 전략
            ↓                   ↓                   ↓
            └───────────────────┼───────────────────┘
                                ↓
                          [Validation]
                           (옵셔널)
                         - IFRA 체크
                         - 부향률 고려
                                ↓
                           [최종 결과]
                      단일 배합 + 전략 리포트

                     ※ 대화 중 Formulation은
                     언제든지 다시 호출 가능
```

**특징**:
- **Formulation 중심**: 배합 생성이 핵심, 다른 Agent는 보조 역할
- **옵셔널 Agent**: Validation, Strategy는 필요시에만 호출
- **순차 실행**: 병렬 처리 없이 필요한 순서대로 실행
- **대화형**: 사용자와 대화하며 필요한 Agent를 동적으로 호출

---

## 📄 coordinator.py - 총괄 오케스트레이터

### 역할
- 전체 워크플로우 제어
- 4개 Agent 그룹 조율
- 대화 흐름에 따른 동적 Agent 호출
- 에러 핸들링 및 재시도

### 주요 함수

#### 1. `parse_request(state: CoordinatorState)`
**역할**: 사용자 입력 파싱 및 구조화

```python
def parse_request(state: CoordinatorState) -> CoordinatorState:
    """
    사용자 입력을 구조화된 요청으로 변환

    입력 예시:
        "30대 여성, 프레시 플로럴, 3만원대"

    출력:
        {
            'target_audience': {'age': 30, 'gender': 'female'},
            'fragrance_type': 'Fresh Floral',
            'price_range': {'min': 25000, 'max': 35000},
            ...
        }
    """
```

**LLM 사용**: Gemini로 자연어 파싱
**프롬프트**: `prompts/formulation_prompts.py` - `PARSE_REQUEST_PROMPT`

---

#### 2. `call_agent_on_demand(agent_name: str, state: CoordinatorState)`
**역할**: 필요한 Agent를 순차적으로 호출

```python
def call_agent_on_demand(agent_name: str, state: CoordinatorState) -> CoordinatorState:
    """
    대화 흐름에 따라 필요한 Agent만 순차 실행

    Args:
        agent_name: 'formulation', 'research', 'validation', 'strategy' 중 하나
        state: 현재 상태

    Returns:
        업데이트된 상태
    """
    if agent_name == 'formulation':
        state = formulation_agent.run(state)
    elif agent_name == 'research':
        state = research_agent.run(state)
    elif agent_name == 'validation':
        state = validation_agent.run(state)
    elif agent_name == 'strategy':
        state = strategy_agent.run(state)

    return state
```

**특징**:
- 병렬 실행 없음 (비용 절감, 순차 제어)
- 필요한 Agent만 선택적으로 호출
- 대화형 워크플로우에 적합

---

#### 3. `validate_single_formulation(state: CoordinatorState)`
**역할**: 생성된 단일 배합을 검증 (옵셔널)

```python
def validate_single_formulation(state: CoordinatorState) -> CoordinatorState:
    """
    단일 배합의 IFRA 규제, 밸런스, 안전성 체크
    부향률을 고려한 검증이 필요할 때만 호출

    Args:
        state['formulation']: 검증할 단일 배합

    Returns:
        검증 결과 및 대체안 포함
    """
    formulation = state.get('formulation')
    if not formulation:
        return state

    result = validation_agent.check(formulation)

    if result['passed']:
        state['validation_status'] = 'passed'
    else:
        state['validation_status'] = 'failed'
        state['validation_issues'] = result['issues']

        # 대체안 제안
        if result['alternatives']:
            state['alternative_suggestions'] = result['alternatives']

    return state
```

**특징**:
- 다중 배합 필터링 제거 → 단일 배합 검증
- 부향률 고려 시에만 호출 (옵셔널)
- 실패 시 대체안 제안

---

#### 4. `apply_strategy(state: CoordinatorState)`
**역할**: 전략 Agent로 포지셔닝 및 가격 전략 수립

```python
def apply_strategy(state: CoordinatorState):
    """
    시장 조사 결과와 배합 정보를 바탕으로 전략 수립
    """
    strategy = strategy_agent.run(
        formulations=state['validated_formulations'],
        research=state['research_data'],
        target_audience=state['target_audience']
    )

    state['strategy'] = strategy
    return state
```

---

### LangGraph 그래프 정의 (대화형 구조)

```python
from langgraph.graph import StateGraph
from app.schema.states import CoordinatorState

def build_coordinator_graph():
    """
    대화형 워크플로우: Formulation 중심의 유연한 Agent 호출
    """
    graph = StateGraph(CoordinatorState)

    # 노드 추가
    graph.add_node("parse", parse_request)
    graph.add_node("formulation", formulation_agent.run)
    graph.add_node("research", research_agent.run)
    graph.add_node("validation", validation_agent.run)  # 옵셔널
    graph.add_node("strategy", strategy_agent.run)      # 옵셔널

    # 기본 진입점
    graph.set_entry_point("parse")

    # Formulation 중심의 유연한 연결
    # parse → formulation (필수)
    graph.add_edge("parse", "formulation")

    # Formulation ⟷ Research (양방향, 필요시)
    graph.add_conditional_edges(
        "formulation",
        lambda state: "research" if state.get("need_research") else "end",
        {
            "research": "research",
            "end": END
        }
    )
    graph.add_edge("research", "formulation")  # Research 후 다시 Formulation

    # Formulation ⟷ Validation (양방향, 부향률 고려 시 옵셔널)
    graph.add_conditional_edges(
        "formulation",
        lambda state: "validation" if state.get("need_validation") else "end",
        {
            "validation": "validation",
            "end": END
        }
    )
    graph.add_edge("validation", "formulation")  # Validation 후 다시 Formulation

    # Formulation ⟷ Strategy (양방향, 옵셔널)
    graph.add_conditional_edges(
        "formulation",
        lambda state: "strategy" if state.get("need_strategy") else "end",
        {
            "strategy": "strategy",
            "end": END
        }
    )
    graph.add_edge("strategy", "formulation")  # Strategy 후 다시 Formulation

    return graph.compile()
```

**특징**:
- **Formulation 중심**: 모든 Agent가 Formulation과 양방향 연결
- **조건부 실행**: 필요 여부에 따라 동적으로 Agent 호출
- **반복 가능**: 대화 중 Formulation을 계속 호출 가능
- **옵셔널 Agent**: Validation, Strategy는 상황에 따라 선택적 호출

**Agent 호출 조건**:
- `need_research`: 시장 조사가 필요한 경우 (트렌드, 경쟁 분석)
- `need_validation`: 부향률 고려, IFRA 체크가 필요한 경우
- `need_strategy`: 포지셔닝, 가격 전략이 필요한 경우

---

### 재시도 로직

```python
from tenacity import retry, stop_after_attempt, wait_exponential

@retry(
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=2, max=10)
)
def call_llm_with_retry(prompt: str):
    """
    LLM 호출 실패 시 최대 3회 재시도
    대기 시간: 2초 → 4초 → 8초
    """
    return llm_service.generate(prompt)
```

---

## 🔗 Agent 그룹 설명

### 1. Formulation (배합 생성)
**위치**: `agents/formulation/`

- **formulation_agent.py**: 메인 배합 생성 로직
- **reference_agent.py**: 레퍼런스 향수 분석
- **accord_generator.py**: 어코드 조합 생성

**상세 설명**: [formulation/README.md](./formulation/README.md)

---

### 2. Research (시장 조사)
**위치**: `agents/research/`

- **market_research_agent.py**: 시장 트렌드 분석
- **consumer_insight_agent.py**: 소비자 페르소나 분석

**상세 설명**: [research/README.md](./research/README.md)

---

### 3. Strategy (전략 수립)
**위치**: `agents/strategy/`

- **positioning_agent.py**: 제품 포지셔닝
- **pricing_agent.py**: 가격 전략

**상세 설명**: [strategy/README.md](./strategy/README.md)

---

### 4. Validation (검증)
**위치**: `agents/validation/`

- **formulation_validator.py**: IFRA 규제, 노트 밸런스 체크
- **safety_validator.py**: 알레르기, 안전성 검증
- **quality_validator.py**: 품질 기준 체크

**상세 설명**: [validation/README.md](./validation/README.md)

---

## 🛠 Agent 개발 가이드

### Agent 기본 구조

```python
from app.schema.states import CoordinatorState
from app.db.queries import ingredient_queries
from app.prompts import formulation_prompts
import logging

logger = logging.getLogger(__name__)

class MyAgent:
    def __init__(self, llm_service, db_session):
        self.llm = llm_service
        self.db = db_session

    def run(self, state: CoordinatorState) -> CoordinatorState:
        """
        Agent 실행 메인 함수

        Args:
            state: 현재 워크플로우 상태

        Returns:
            업데이트된 상태
        """
        try:
            # 1. DB에서 데이터 조회
            data = self._fetch_data(state)

            # 2. LLM 호출
            result = self._call_llm(data)

            # 3. 결과 검증
            validated = self._validate_result(result)

            # 4. 상태 업데이트
            state['my_agent_result'] = validated
            return state

        except Exception as e:
            logger.error(f"Agent failed: {e}")
            state['errors'].append(str(e))
            return state

    def _fetch_data(self, state):
        """DB 조회"""
        pass

    def _call_llm(self, data):
        """LLM 호출"""
        pass

    def _validate_result(self, result):
        """결과 검증"""
        pass
```

---

### Agent 테스트

```python
import pytest
from app.agents.my_agent import MyAgent

def test_my_agent():
    # Mock 상태
    state = {
        'user_input': 'test input',
        'target_audience': {'age': 30}
    }

    agent = MyAgent(llm_service, db_session)
    result = agent.run(state)

    assert 'my_agent_result' in result
    assert result['my_agent_result'] is not None
```

---

## 📊 성능 모니터링

### 로깅 예시

```python
import time

def run(self, state):
    start = time.time()
    logger.info(f"Agent started: {self.__class__.__name__}")

    result = self._process(state)

    elapsed = time.time() - start
    logger.info(f"Agent finished in {elapsed:.2f}s")

    return result
```

### 메트릭 수집

- **실행 시간**: 각 Agent별 처리 시간
- **LLM 토큰 사용량**: 비용 추적
- **성공률**: 검증 통과율
- **재시도 횟수**: 안정성 지표

---

## 🔗 의존성

**의존하는 모듈**:
- `app.schema.states` (State 타입)
- `app.prompts.` (프롬프트 템플릿)
- `app.db.queries.` (데이터 조회)
- `app.services.llm_service` (LLM 호출)

**사용하는 곳**:
- `app.routes.` (API 엔드포인트에서 Coordinator 호출)

---

## ⚠️ 주의사항

1. **순차 실행**
   - 모든 Agent는 순차적으로 실행 (병렬 처리 없음)
   - 비동기가 필요하면 개별 Agent 내부에서만 사용
   - DB 세션은 스레드 안전하지 않으므로 주의

2. **상태 불변성**
   - State를 직접 수정하지 말고 새 객체 반환
   - Formulation이 반복 호출되어도 이전 상태 유지

3. **에러 격리**
   - 한 Agent의 실패가 전체를 중단시키지 않도록 try-except
   - 옵셔널 Agent는 실패해도 Formulation 계속 가능

4. **LLM 비용 관리**
   - 불필요한 LLM 호출 최소화 (순차 실행으로 비용 절감)
   - 캐싱 활용
   - 대화 중 같은 요청은 재사용

5. **대화 흐름 제어**
   - `need_research`, `need_validation`, `need_strategy` 플래그로 Agent 호출 제어
   - 사용자 요청에 따라 동적으로 플래그 설정

---

## 📚 참고 자료
- [LangGraph Documentation](https://python.langchain.com/docs/langgraph)
- [Agent Design Patterns](https://www.anthropic.com/research/agent-design-patterns)
- [Tenacity Retry Library](https://tenacity.readthedocs.io/)
