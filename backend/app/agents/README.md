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

### 1. 사용자 요청 흐름
```
                            [사용자 입력]
                   "30대 여성, 프레시 플로럴, 3만원대"
                                ↓
                           [Coordinator]
                           parse_request
                                ↓
      ┌──────────────────┬──────┴────────┬──────────────┐
      ↓                  ↓               ↓              ↓
  [Validation]  ⟷  [Formulation]  ⟷  [Research]  ⟷  [Strategy]  
      ↓                  ↓               ↓              ↓
      └──────────────────┴──────┬────────┴──────────────┘
                                ↓
                           [최종 결과]
                        추천 배합 + 전략 리포트
```

---

## 📄 coordinator.py - 총괄 오케스트레이터

### 역할
- 전체 워크플로우 제어
- 4개 Agent 그룹 조율
- 병렬 실행 관리
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

#### 2. `run_parallel_agents(state: CoordinatorState)` => comment : 불필요함. 필요시 순차적으로 실행하는 것으로. 
**역할**: Formulation + Research Agent 병렬 실행

```python
async def run_parallel_agents(state: CoordinatorState):
    """
    배합 생성과 시장 조사를 동시에 수행하여 시간 단축
    """
    tasks = [
        formulation_agent.run(state),
        research_agent.run(state)
    ]

    results = await asyncio.gather(*tasks)
    state['formulations'] = results[0]
    state['research_data'] = results[1]
    return state
```

---

#### 3. `validate_and_filter(state: CoordinatorState)` => comment : 어차피 하나만 생성할 것임. 
**역할**: 생성된 배합을 검증하고 통과한 것만 필터링

```python
def validate_and_filter(state: CoordinatorState):
    """
    IFRA 규제, 밸런스, 안전성 체크
    통과하지 못한 배합은 제외하거나 수정
    """
    validated = []
    for formulation in state['formulations']:
        result = validation_agent.check(formulation)
        if result['passed']:
            validated.append(formulation)
        elif result['alternatives']:
            # 대체안이 있으면 수정 후 재검증
            fixed = apply_alternatives(formulation, result['alternatives'])
            validated.append(fixed)

    state['validated_formulations'] = validated
    return state
```

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

### LangGraph 그래프 정의

```python
from langgraph.graph import StateGraph
from app.schema.states import CoordinatorState

def build_coordinator_graph():
    graph = StateGraph(CoordinatorState)

    # 노드 추가
    graph.add_node("parse", parse_request)
    graph.add_node("parallel", run_parallel_agents)
    graph.add_node("validate", validate_and_filter)
    graph.add_node("strategy", apply_strategy)

    # 엣지 연결 -> comment :   [Formulation] ⟷ [Validation] (이거는 부향률까지 고려했을 경우에 불러와야함, 옵셔널)  , [Formulation]  ⟷  [Research], [Formulation]  ⟷  [Strategy]  (옵셔널), 대화시 필요하다면 [Formulation]은 언제든지 계속 할 수 있음. 
    graph.set_entry_point("parse") 
    graph.add_edge("parse", "parallel")
    graph.add_edge("parallel", "validate")
    graph.add_edge("validate", "strategy")
    graph.set_finish_point("strategy")

    return graph.compile()
```

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

1. **비동기 처리**
   - 병렬 Agent는 `async/await` 사용
   - DB 세션은 스레드 안전하지 않으므로 주의

2. **상태 불변성**
   - State를 직접 수정하지 말고 새 객체 반환

3. **에러 격리**
   - 한 Agent의 실패가 전체를 중단시키지 않도록 try-except

4. **LLM 비용 관리**
   - 불필요한 LLM 호출 최소화
   - 캐싱 활용

---

## 📚 참고 자료
- [LangGraph Documentation](https://python.langchain.com/docs/langgraph)
- [Agent Design Patterns](https://www.anthropic.com/research/agent-design-patterns)
- [Tenacity Retry Library](https://tenacity.readthedocs.io/)
