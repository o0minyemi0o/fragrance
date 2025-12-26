# Schema - 시스템 설정 및 타입 정의

## 📋 역할
시스템 전체에서 사용되는 **설정**, **상태 타입**, **워크플로우 구조**를 정의하는 최하위 레이어입니다.

## 📁 파일 구조
```
schema/
├── README.md
├── config.py           # 환경 변수 및 설정 관리
├── states.py          # LangGraph State 타입 정의
└── graph.py           # LangGraph 워크플로우 구조
```

## 📄 각 파일의 역할

### config.py
**목적**: 환경 변수와 앱 설정을 중앙 집중 관리

**주요 내용**:
- 데이터베이스 URL
- LLM API 키 (Google Gemini, OpenAI 등)
- 환경 설정 (development/production)
- ChromaDB 경로
- 로깅 레벨

**기술 스택**:
- `pydantic-settings`: 환경 변수 자동 로드 및 검증
- `.env` 파일 연동

**사용 예시**:
```python
from app.schema.config import settings

# 어디서든 안전하게 설정 접근
db_url = settings.DATABASE_URL
api_key = settings.GOOGLE_API_KEY
```

---

### states.py
**목적**: LangGraph에서 사용할 State 클래스 정의

**주요 State 타입**:
1. **DevelopmentState**
   - Development Mode의 메인 상태
   - 대화 히스토리, 사용자 선호도, 배합안, 진행 단계 관리
   - **Coordinator 제어 필드**:
     - `next_node`: Coordinator가 결정한 다음 실행 노드
     - `coordinator_reasoning`: 판단 근거 (디버깅용)
     - `iteration_count`: 순환 방지를 위한 반복 횟수

2. **IngredientSearchState**
   - 원료 검색 Agent의 상태
   - 검색 쿼리, 검색 결과, 선택된 원료

3. **FormulationState**
   - 배합 생성 Agent의 상태
   - 사용자 요구사항, 선택된 원료, 생성된 배합

4. **ValidationState**
   - 검증 Agent의 상태
   - IFRA 규제 체크 결과, 검증 오류/경고, 대체안

5. **CoordinatorState**
   - 전체 워크플로우의 최상위 상태 (향후 확장용)
   - 여러 Agent 결과 통합 및 라우팅 제어

**TypedDict vs Pydantic**:
- LangGraph는 TypedDict 또는 Pydantic BaseModel 지원
- 복잡한 검증이 필요하면 Pydantic 권장

**사용 예시**:
```python
from app.schema.states import DevelopmentState

def my_agent_node(state: DevelopmentState) -> DevelopmentState:
    # State 기반 처리
    user_input = state["current_user_input"]
    messages = state["messages"]

    # 처리 로직...
    state["response"] = "Generated response"

    return state
```

---

### graph.py
**목적**: Coordinator 기반 유연한 LangGraph 워크플로우 정의

**워크플로우 구조** (Coordinator Pattern):
```
          [START]
             ↓
      [parse_request]  ← 초기 사용자 입력 파싱 (1회만)
             ↓
      [coordinator]    ← 상태 분석 및 다음 노드 결정
             ↓
      [동적 라우팅]    ← coordinator의 next_node 결정에 따라 분기
             ↓
      ┌────┴────┬──────────┬────────────┬──────────┬──────────┐
      ↓         ↓          ↓            ↓          ↓          ↓
    [gather] [search] [formulation] [validation] [response] [END]
 (선호도 수집)(원료 검색) (배합 생성)    (검증)    (응답 생성)
      ↓         ↓          ↓            ↓          ↓
      └────┬────┴──────────┴────────────┴──────────┘
           ↓
      [coordinator]    ← 다시 coordinator로 복귀 (순환)
           ↓
         (반복)
```

**주요 특징**:
- **Coordinator 중심 제어**: 매 단계마다 coordinator가 상태를 분석하여 다음 노드 결정
- **유연한 순서**: gather, search, formulation, validation, response 노드가 언제든 자유롭게 호출 가능
- **순환 구조**: 각 노드 실행 후 coordinator로 복귀하여 다음 액션 결정
- **무한 루프 방지**: iteration_count로 최대 반복 횟수 제한 (30회)
- **동적 대화 흐름**: 사용자 요청과 상태에 따라 대화 흐름이 유연하게 변화

**Coordinator 동작 방식**:
1. `parse_request`: 사용자 입력을 파싱하여 의도 파악
2. `coordinator`: 현재 상태 분석 → `next_node` 결정
   - 충분한 선호도 정보 있는가? → `gather` 또는 `search`
   - 원료 선택 완료? → `formulation`
   - 배합 생성됨? → `validation` 또는 `response`
3. 결정된 노드 실행 → coordinator로 복귀 → 반복

**사용 예시**:
```python
from app.schema.graph import get_development_workflow

# 컴파일된 워크플로우 가져오기
workflow = get_development_workflow()

# 실행
result = workflow.invoke({
    "current_user_input": "30대 여성을 위한 프레시 플로럴 향수를 만들고 싶어요",
    "messages": [],
    "available_ingredients": [...],
    "ingredient_count": 150,
    "iteration_count": 0  # 순환 카운터 초기화
})

print(result["response"])
print(f"Total iterations: {result['iteration_count']}")
```

---

## 🔗 의존성
- **의존하는 패키지**: 없음 (최하위 레이어)
- **사용하는 곳**:
  - `agents/` (모든 Agent가 State 참조)
  - `routes/` (설정 참조)
  - `db/` (DB URL 참조)

---

## 🚀 초기 설정 필요 사항

### 1. .env 파일 준비
```env
# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/fragrance

# Google Gemini
GOOGLE_API_KEY=your_api_key_here

# Environment
ENV=development

# ChromaDB
CHROMADB_PATH=./data/chromadb
CHROMADB_COLLECTION_NAME=fragrance_ingredients

# LangGraph
LANGGRAPH_TIMEOUT=300
LANGGRAPH_MAX_RETRIES=3
LANGGRAPH_RECURSION_LIMIT=25

# Logging
LOG_LEVEL=INFO
```

### 2. States 설계 가이드
- 각 Agent가 필요로 하는 필드를 명확히 정의
- 불필요한 필드는 Optional로 설정
- 타입 힌트 필수 (mypy 호환)

### 3. Graph 설계 원칙 (Coordinator Pattern)
- **Coordinator 중심**: 모든 흐름 결정은 coordinator가 담당
- **순환 허용**: 노드 → coordinator → 노드 반복 가능 (iteration_count로 제어)
- **유연한 분기**: 상태에 따라 동적으로 다음 노드 선택
- **안전장치**: 최대 반복 횟수(30회)로 무한 루프 방지
- **명확한 종료**: response 노드 실행 후 또는 max iteration 도달 시 종료

---

## ⚠️ 주의사항

1. **순환 import 방지**
   - schema는 최하위이므로 다른 모듈을 import하면 안 됨

2. **민감 정보 보호**
   - config.py에 하드코딩 금지
   - 반드시 .env 사용

3. **State 불변성**
   - State는 읽기 전용처럼 다루기
   - 새 State 객체를 반환하도록 설계

---

## 📚 참고 자료
- [LangGraph 공식 문서](https://python.langchain.com/docs/langgraph)
- [Pydantic Settings](https://docs.pydantic.dev/latest/concepts/pydantic_settings/)
- [TypedDict vs Pydantic](https://pydantic-docs.helpmanual.io/usage/types/#typeddict)
