# 이동 불가 파일 및 권장사항

## 📋 이동이 어려운 파일들

### 1. **routes/*.py** - 부분 수정 필요 ✅
**위치**: `routes/`
**상태**: 그대로 유지, 내부 로직만 수정

**이유**:
- FastAPI의 라우팅 구조상 routes 폴더는 유지하는 것이 표준
- 새로운 agents 구조로 옮기는 것보다, routes에서 Coordinator를 호출하는 방식이 더 명확

**작업 필요**:
- `formulations.py`: LLM 직접 호출 → Coordinator 호출로 변경
- `ingredients.py`: DB 쿼리 직접 → `db/queries/` 함수 사용으로 변경

**예시**:
```python
# 기존
@router.post("/accord/generate")
def generate_accord(request: dict, db: Session = Depends(get_db)):
    result = llm_service.generate_accord(request["accord_type"])
    return result

# 변경 후
@router.post("/accord/generate")
def generate_accord(request: dict, db: Session = Depends(get_db)):
    result = coordinator.run({
        "mode": "accord",
        "user_input": request
    })
    return result
```

---

### 2. **services/llm_service.py** - 재구성 필요 ⚠️
**위치**: `services/`
**상태**: 유지하되, 역할 축소

**이유**:
- 현재는 프롬프트 + LLM 호출이 모두 포함되어 있음
- 새 구조에서는:
  - **프롬프트** → `prompts/`로 이동
  - **비즈니스 로직** → `agents/`로 이동
  - **LLM 호출만** `services/llm_service.py`에 남김

**작업 필요**:
```python
# services/llm_service.py는 단순 LLM Wrapper로 축소
class LLMService:
    def generate(self, prompt: str, model: str = "gemini-1.5-flash") -> str:
        """프롬프트를 받아 LLM 호출만 수행"""
        response = self.gemini.generate(prompt)
        return response

# 프롬프트는 prompts/*.py로
# 비즈니스 로직은 agents/*.py로
```

---

### 3. **schemas/*.py (Pydantic 모델)** - 혼동 주의 ⚠️
**위치**: `schemas/`
**상태**: **그대로 유지** (삭제 X)

**이유**:
- `schemas/` 폴더에는 두 가지 종류의 스키마가 있음:
  1. **SQLAlchemy ORM 모델** (Ingredient, Accord, Formula)
  2. **Pydantic Request/Response 모델** (현재 코드에는 명시적으로 없지만 향후 추가 예정)

**작업 필요**:
- **SQLAlchemy 모델 (Ingredient, Accord, Formula)**:
  - `schemas/*.py` → `db/schema.py`로 통합
- **Pydantic 모델** (만약 있다면):
  - `schemas/` 폴더에 그대로 유지
  - routes에서 request/response 검증용으로 사용

**최종 구조**:
```
schemas/                    # Pydantic Request/Response 모델만 (API 검증용)
├── requests.py            # 요청 모델
└── responses.py           # 응답 모델

db/
└── schema.py              # SQLAlchemy ORM 모델 (DB 테이블)
```

---

### 4. **main.py** - 최소 수정 ✅
**위치**: `main.py`
**상태**: 그대로 유지, router import 경로만 확인

**작업 필요**:
```python
# 기존
from app.routes import formulations, ingredients, development

# 변경 필요 없음 (routes 폴더 유지)
app.include_router(formulations.router)
app.include_router(ingredients.router)
app.include_router(development.router)
```

---

### 5. **config.py** - 이미 없음 ⚠️
**위치**: 기존 `config.py`는 이미 존재하지 않음
**상태**: `schema/config.py`로 새로 작성 필요

**작업 필요**:
- 기존 `.env` 파일 확인
- `schema/config.py` 새로 작성:
```python
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str
    GOOGLE_API_KEY: str
    ENV: str = "development"
    CHROMA_DB_PATH: str = "./chroma_db"  # 추가

    class Config:
        env_file = ".env"

settings = Settings()
```

---

## 📊 파일 이동 매핑표

| 기존 위치 | 새 위치 | 작업 | 상태 |
|----------|---------|-----|------|
| `config.py` | `schema/config.py` | 새로 작성 | ⚠️ 필수 |
| `database/db.py` | `db/initialization/engine.py` | 이동 + 경로 수정 | ✅ 가능 |
| `database/database.py` | `db/initialization/session.py` | 이동 + 경로 수정 | ✅ 가능 |
| `database/create_table.py` | `db/initialization/create_tables.py` | 이동 + 경로 수정 | ✅ 가능 |
| `schemas/ingredient.py` | `db/schema.py` | 통합 | ✅ 가능 |
| `schemas/accord.py` | `db/schema.py` | 통합 | ✅ 가능 |
| `schemas/formula.py` | `db/schema.py` | 통합 | ✅ 가능 |
| `services/llm_service.py` | `services/llm_service.py` | 축소 (프롬프트 제거) | ⚠️ 수정 필요 |
| `routes/*.py` | `routes/*.py` | 유지 (내부 로직만 수정) | ⚠️ 수정 필요 |
| `main.py` | `main.py` | 유지 | ✅ 변경 없음 |

---

## ⚠️ 주의사항 요약

### 1. schemas 폴더 혼동
- **SQLAlchemy ORM 모델** → `db/schema.py`
- **Pydantic 모델** (API 검증) → `schemas/` 유지

### 2. services/llm_service.py 역할 변경
- **변경 전**: 프롬프트 + 비즈니스 로직 + LLM 호출
- **변경 후**: 순수 LLM Wrapper만

### 3. Import 경로 일괄 변경 필요
- `from app.config import` → `from app.schema.config import`
- `from app.schemas.accord import` → `from app.db.schema import`
- `from app.database.database import` → `from app.db.initialization.session import`

### 4. 기존 기능 유지하면서 단계적 진행
- Phase 1-3: 구조 재구성 (기능 변경 없음)
- Phase 4-5: 새 Agent 기능 추가
- Phase 6: 통합 테스트

---

## 🚀 즉시 작업 가능한 항목

1. **database 폴더 파일 이동**
   ```bash
   mv app/database/db.py app/db/initialization/engine.py
   mv app/database/database.py app/db/initialization/session.py
   mv app/database/create_table.py app/db/initialization/create_tables.py
   ```

2. **SQLAlchemy 모델 통합**
   - `schemas/*.py` → `db/schema.py`로 수동 병합
   - `schemas/__init__.py`의 Base도 함께 이동

3. **schema/config.py 작성**
   - 기존 설정 항목 확인 후 새로 작성

---

## 📋 작업 후 확인 사항

### 체크리스트
- [ ] 모든 import 경로 변경 완료
- [ ] 기존 테스트 케이스 통과
- [ ] API 엔드포인트 정상 작동 확인
- [ ] DB 연결 및 CRUD 정상 작동
- [ ] 새로운 폴더 구조에 맞게 .gitignore 업데이트
- [ ] README 파일들 최신 상태 유지

---

## 💡 추가 권장사항

### 1. 마이그레이션 브랜치 생성
```bash
git checkout -b feature/architecture-migration
```

### 2. 단계별 커밋
```bash
git commit -m "Phase 1: DB 레이어 재구성"
git commit -m "Phase 2: Prompts 분리"
# ...
```

### 3. 롤백 계획
- 각 Phase마다 태그 생성
- 문제 발생 시 이전 Phase로 롤백 가능

### 4. 문서화
- 각 폴더의 README.md 업데이트
- CHANGELOG.md에 변경 사항 기록

---

## 📞 도움이 필요한 경우

마이그레이션 중 문제가 발생하면:
1. MIGRATION_PLAN.md 참조
2. 각 폴더의 README.md 참조
3. 기존 코드 백업 확인
4. 단계별로 진행 (한 번에 모두 변경 X)
