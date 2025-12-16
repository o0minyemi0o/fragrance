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
1. **CoordinatorState**
   - 전체 워크플로우의 최상위 상태
   - 사용자 입력, 각 Agent 결과를 저장

2. **FormulationState**
   - 배합 생성 Agent의 상태
   - 검색된 원료, 생성된 배합 리스트

3. **ResearchState**
   - 시장 조사 Agent의 상태
   - 트렌드 데이터, 경쟁 향수 정보

4. **ValidationState**
   - 검증 Agent의 상태
   - IFRA 규제 체크 결과, 대체안

**TypedDict vs Pydantic**:
- LangGraph는 TypedDict 또는 Pydantic BaseModel 지원
- 복잡한 검증이 필요하면 Pydantic 권장

**사용 예시**:
```python
from app.schema.states import CoordinatorState

class MyAgent:
    def __call__(self, state: CoordinatorState) -> CoordinatorState:
        # State 기반 처리
        user_input = state["user_input"]
        ...
        return state
```

---

### graph.py
**목적**: LangGraph 워크플로우의 노드 및 엣지 정의

**워크플로우 구조**:
```
          [START]
             ↓
      [parse_request]  ← 사용자 입력 파싱
             ↓
        ┌────┴────┐
        ↓         ↓
  [formulation] [research]  ← 병렬 실행
        ↓         ↓
        └────┬────┘
             ↓
       [validation]  ← 배합 검증
             ↓
        [strategy]   ← 전략 수립
             ↓
          [END]
```

**주요 기능**:
- 노드(Node) 등록: 각 Agent를 그래프 노드로 등록
- 조건부 엣지(Conditional Edge): 동적 라우팅
- 병렬 실행(Parallel): formulation + research 동시 처리
- 재시도 로직(Retry): LLM 호출 실패 시 자동 재시도

**사용 예시**:
```python
from langgraph.graph import StateGraph
from app.schema.states import CoordinatorState
from app.schema.graph import build_workflow_graph

# 그래프 빌드
graph = build_workflow_graph()
app = graph.compile()

# 실행
result = app.invoke({"user_input": "30대 여성, 프레시 플로럴"})
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

# OpenAI (선택사항)
OPENAI_API_KEY=your_openai_key

# Environment
ENV=development
```

### 2. States 설계 가이드
- 각 Agent가 필요로 하는 필드를 명확히 정의
- 불필요한 필드는 Optional로 설정
- 타입 힌트 필수 (mypy 호환)

### 3. Graph 설계 원칙
- **단방향 흐름**: 순환 참조 금지
- **조건부 분기**: 실패 시 대체 경로 제공
- **타임아웃 설정**: 무한 대기 방지

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
