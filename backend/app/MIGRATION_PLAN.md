# 프로젝트 구조 마이그레이션 계획

## 📋 개요
기존 코드를 새로운 아키텍처로 재구성하는 단계별 마이그레이션 계획입니다.

## 🎯 목표
- **현재 구조**: 단순한 API 서버 (routes + services)
- **목표 구조**: LangGraph 기반 Multi-Agent 시스템

## 📁 현재 구조 vs 목표 구조

### 현재 (As-Is)
```
app/
├── config.py                    # 설정
├── main.py
├── database/
│   ├── database.py             # DB 연결
│   ├── db.py                   # 중복
│   └── create_table.py
├── schemas/                     # SQLAlchemy ORM 모델
│   ├── ingredient.py
│   ├── accord.py
│   └── formula.py
├── routes/                      # API 엔드포인트
│   ├── formulations.py
│   ├── ingredients.py
│   └── development.py
└── services/
    └── llm_service.py          # LLM 호출
```

### 목표 (To-Be)
```
app/
├── main.py
├── schema/                     # 시스템 설정
│   ├── config.py              # ← config.py 이동
│   ├── states.py              # 새로 작성
│   └── graph.py               # 새로 작성
│
├── prompts/                    # 프롬프트 분리
│   ├── formulation_prompts.py # 새로 작성
│   ├── research_prompts.py
│   ├── strategy_prompts.py
│   └── validation_prompts.py
│
├── db/
│   ├── schema.py              # ← schemas/*.py 통합
│   ├── vector_store.py        # 새로 작성
│   ├── initialization/
│   │   ├── engine.py          # ← database/db.py 분리
│   │   ├── session.py         # ← database/database.py 분리
│   │   └── create_tables.py   # ← database/create_table.py 이동
│   └── queries/
│       ├── ingredient_queries.py  # 새로 작성
│       ├── formulation_queries.py
│       └── perfume_queries.py
│
├── agents/
│   ├── coordinator.py         # 새로 작성
│   ├── formulation/
│   ├── research/
│   ├── strategy/
│   └── validation/
│
└── routes/                     # 기존 유지 (수정 필요)
    ├── formulations.py        # Coordinator 호출로 변경
    ├── ingredients.py         # queries 사용으로 변경
    └── development.py
```

---

## 🚀 마이그레이션 단계

### Phase 1: 설정 및 DB 레이어 재구성 (1일)

#### 1.1 config.py 이동
```bash
# config.py가 이미 없음. schema/config.py 새로 작성 필요
```

**작업**:
- `schema/config.py` 작성
  - DATABASE_URL
  - GOOGLE_API_KEY
  - ENV
  - CHROMA_DB_PATH (추가)

**변경 영향**:
- 모든 파일에서 `from app.config import settings`
  → `from app.schema.config import settings`로 변경

---

#### 1.2 database 폴더 재구성

**database/db.py → db/initialization/engine.py**:
```python
# 기존 코드 이동
from sqlalchemy import create_engine
from app.schema.config import settings

engine = create_engine(settings.DATABASE_URL, echo=True)
```

**database/database.py → db/initialization/session.py**:
```python
# 기존 코드 이동
from sqlalchemy.orm import sessionmaker, Session

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db() -> Session:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

**database/create_table.py → db/initialization/create_tables.py**:
```python
# 경로만 수정
from app.db.schema import Base
from app.db.initialization.engine import engine

Base.metadata.create_all(bind=engine)
```

---

#### 1.3 schemas 폴더 통합

**schemas/*.py → db/schema.py**:
```python
# 모든 ORM 모델을 하나의 파일로 통합
from sqlalchemy.orm import declarative_base
from sqlalchemy import Column, Integer, String, JSONB, DateTime, Float

Base = declarative_base()

class Ingredient(Base):
    __tablename__ = "ingredients"
    # schemas/ingredient.py 내용 복사

class Accord(Base):
    __tablename__ = "accords"
    # schemas/accord.py 내용 복사

class Formula(Base):
    __tablename__ = "formulas"
    # schemas/formula.py 내용 복사
```

**변경 영향**:
- routes에서 `from app.schemas.accord import Accord`
  → `from app.db.schema import Accord`

---

### Phase 2: Prompts 분리 (0.5일)

#### 2.1 LLM Service에서 프롬프트 추출

**기존 (services/llm_service.py)**:
```python
def generate_accord(self, accord_type: str):
    prompt = f"""당신은 전문 조향사입니다.
    {accord_type} 어코드를 생성하세요..."""

    return self.gemini.generate(prompt)
```

**목표 (prompts/formulation_prompts.py)**:
```python
GENERATE_ACCORD_PROMPT = """
당신은 전문 조향사입니다.
요청: {accord_type}

다음 형식으로 5개의 조합을 제안하세요:
...
"""
```

**변경 후 (services/llm_service.py)**:
```python
from app.prompts.formulation_prompts import GENERATE_ACCORD_PROMPT

def generate_accord(self, accord_type: str):
    prompt = GENERATE_ACCORD_PROMPT.format(accord_type=accord_type)
    return self.gemini.generate(prompt)
```

---

### Phase 3: DB Queries 추출 (1일)

#### 3.1 routes에서 쿼리 로직 분리

**기존 (routes/formulations.py)**:
```python
@router.get("/accords")
def list_accords(db: Session = Depends(get_db)):
    accords = db.query(Accord).all()  # ← 이 로직을 queries로 이동
    return {"count": len(accords), "accords": accords}
```

**목표 (db/queries/formulation_queries.py)**:
```python
def get_all_accords(db: Session) -> List[Accord]:
    """모든 Accord 조회"""
    return db.query(Accord).all()

def get_accord_by_id(db: Session, accord_id: int) -> Optional[Accord]:
    """ID로 Accord 조회"""
    return db.query(Accord).filter(Accord.id == accord_id).first()
```

**변경 후 (routes/formulations.py)**:
```python
from app.db.queries.formulation_queries import get_all_accords

@router.get("/accords")
def list_accords(db: Session = Depends(get_db)):
    accords = get_all_accords(db)  # ← queries 함수 사용
    return {"count": len(accords), "accords": accords}
```

---

### Phase 4: Agent 구조 구축 (2-3일)

#### 4.1 states.py 작성
```python
from typing import TypedDict, List, Dict, Optional

class CoordinatorState(TypedDict):
    user_input: str
    target_audience: Optional[Dict]
    formulations: List[Dict]
    research_data: Optional[Dict]
    validated_formulations: List[Dict]
    strategy: Optional[Dict]
    errors: List[str]
```

---

#### 4.2 Formulation Agent 작성

**services/llm_service.py의 로직 → agents/formulation/formulation_agent.py**:
```python
from app.schema.states import CoordinatorState
from app.db.queries.ingredient_queries import get_all_ingredients
from app.prompts.formulation_prompts import GENERATE_FORMULA_PROMPT

class FormulationAgent:
    def __init__(self, llm_service, db):
        self.llm = llm_service
        self.db = db

    def run(self, state: CoordinatorState) -> CoordinatorState:
        # 기존 generate_formula 로직을 여기로 이동
        ingredients = get_all_ingredients(self.db)
        prompt = GENERATE_FORMULA_PROMPT.format(...)
        result = self.llm.generate(prompt)

        state['formulations'] = result
        return state
```

---

#### 4.3 Coordinator 작성

**agents/coordinator.py**:
```python
from langgraph.graph import StateGraph
from app.schema.states import CoordinatorState
from app.agents.formulation.formulation_agent import FormulationAgent

def build_workflow():
    graph = StateGraph(CoordinatorState)

    # Formulation Agent 등록
    formulation_agent = FormulationAgent(llm_service, db)
    graph.add_node("formulation", formulation_agent.run)

    # 추후 다른 Agent 추가

    graph.set_entry_point("formulation")
    graph.set_finish_point("formulation")

    return graph.compile()
```

---

#### 4.4 Routes에서 Coordinator 호출

**routes/formulations.py**:
```python
from app.agents.coordinator import build_workflow

coordinator = build_workflow()

@router.post("/formula/generate")
async def generate_formula(request: dict, db: Session = Depends(get_db)):
    # Coordinator 실행
    result = coordinator.invoke({
        "user_input": request.get("formula_type"),
        "target_audience": request.get("target_audience")
    })

    return {
        "status": "success",
        "data": result['formulations']
    }
```

---

### Phase 5: 추가 Agent 구축 (3-4일)

#### 5.1 Vector Store 구축
- ChromaDB 설정
- 기존 Accord/Formula 임베딩
- `db/vector_store.py` 작성

#### 5.2 Research Agent 작성
- Market Research Agent
- Consumer Insight Agent

#### 5.3 Validation Agent 작성
- IFRA 체크 로직
- 노트 밸런스 검증

#### 5.4 Strategy Agent 작성
- Positioning Agent
- Pricing Agent

---

### Phase 6: 통합 및 테스트 (2일)

#### 6.1 전체 워크플로우 연결
- Coordinator에 모든 Agent 등록
- 병렬 실행 설정 (formulation + research)

#### 6.2 테스트
- Unit Test (각 Agent별)
- Integration Test (전체 워크플로우)
- E2E Test (API → Coordinator → DB)

---

## ⚠️ 마이그레이션 시 주의사항

### 1. Import 경로 변경
모든 파일에서 import 경로가 변경됩니다. 체계적으로 진행해야 합니다.

**일괄 변경 예시**:
```bash
# config.py import 변경
find . -name "*.py" -exec sed -i 's/from app.config import/from app.schema.config import/g' {} +

# schema import 변경
find . -name "*.py" -exec sed -i 's/from app.schemas.accord import/from app.db.schema import/g' {} +
```

---

### 2. 중복 코드 제거
- `database/database.py`와 `database/db.py`는 중복
- 하나를 선택하여 사용 (database.py 권장)

---

### 3. 기존 데이터 보존
- DB 테이블 구조는 변경 없음
- 마이그레이션 후에도 기존 데이터 그대로 사용 가능

---

### 4. 단계적 배포
- Phase 1-3까지는 기존 기능 유지하면서 구조만 변경
- Phase 4부터 새 Agent 기능 추가
- 롤백 계획 필수

---

## 📊 예상 일정

| Phase | 작업 내용 | 예상 소요 시간 |
|-------|----------|------------|
| Phase 1 | DB 레이어 재구성 | 1일 |
| Phase 2 | Prompts 분리 | 0.5일 |
| Phase 3 | Queries 추출 | 1일 |
| Phase 4 | Agent 구조 구축 | 2-3일 |
| Phase 5 | 추가 Agent 구축 | 3-4일 |
| Phase 6 | 통합 및 테스트 | 2일 |
| **총계** | | **9.5 - 11.5일** |

---

## 🔧 마이그레이션 스크립트 (예시)

### migrate_step1_db.sh
```bash
#!/bin/bash
# Phase 1: DB 레이어 재구성

# 1. config.py가 없으므로 schema/config.py 작성 필요 (수동)

# 2. database 폴더 파일 이동
mv app/database/db.py app/db/initialization/engine.py
mv app/database/database.py app/db/initialization/session.py
mv app/database/create_table.py app/db/initialization/create_tables.py

# 3. schemas 폴더 통합 (수동으로 db/schema.py에 통합 필요)
# cat app/schemas/*.py > app/db/schema.py (단순 복사는 불가, 수동 병합 필요)

# 4. Import 경로 변경
find app/routes -name "*.py" -exec sed -i 's/from app.database.database import/from app.db.initialization.session import/g' {} +
find app/routes -name "*.py" -exec sed -i 's/from app.schemas.accord import/from app.db.schema import/g' {} +
find app/routes -name "*.py" -exec sed -i 's/from app.schemas.formula import/from app.db.schema import/g' {} +

echo "✅ Phase 1 완료: DB 레이어 재구성"
```

---

## 📚 참고 자료
- LangGraph: https://python.langchain.com/docs/langgraph
- SQLAlchemy: https://docs.sqlalchemy.org/
- FastAPI: https://fastapi.tiangolo.com/
