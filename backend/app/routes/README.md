# Routes - API 엔드포인트

## 📋 역할
외부 클라이언트(프론트엔드)와의 **HTTP 통신 창구**입니다. HTTP 요청/응답을 처리하고, Services 또는 LangGraph workflow를 호출합니다.

## 📁 파일 구조
```
routes/
├── README.md
├── ingredients.py     # 원료 CRUD 및 검색
├── formulations.py    # Accord/Formula 생성 및 관리
└── development.py     # Development Mode (LangGraph workflow)
```

## 🎯 아키텍처 패턴

### Routes의 역할 (HTTP Layer)
1. HTTP 요청 수신 및 검증 (Pydantic)
2. Services 또는 LangGraph 호출
3. HTTP 응답 생성
4. 에러 핸들링 (HTTPException)

### 호출 흐름
```
Client → Routes → Services/LangGraph → DB/LLM → Routes → Client
```

**Routes는 비즈니스 로직을 포함하지 않음** - Services/Agents가 담당

## 📄 주요 엔드포인트

### formulations.py
**역할**: 배합 생성 및 관리

#### POST `/api/formulations/accord/generate`
**요청**:
```json
{
  "accord_type": "Fresh Floral"
}
```

**응답**:
```json
{
  "status": "success",
  "mode": "accord",
  "data": {
    "name": "Fresh Floral Accord #1",
    "ingredients": [
      {"name": "Bergamot", "percentage": 30, "note": "top"},
      {"name": "Rose", "percentage": 50, "note": "middle"}
    ],
    "longevity": "6-8 hours",
    "sillage": "moderate"
  }
}
```

---

#### POST `/api/formulations/accord/save`
**역할**: 생성된 Accord 저장

**요청**:
```json
{
  "name": "My Accord",
  "accord_type": "Floral",
  "ingredients": [...],
  "longevity": "6-8 hours",
  "sillage": "moderate",
  "recommendation": "..."
}
```

---

#### POST `/api/formulations/formula/generate`
**역할**: Formula (완제품 배합) 생성

**요청**:
```json
{
  "formula_type": "Eau de Parfum",
  "target_audience": "30대 여성",
  "price_range": "30000"
}
```

**응답**:
- 10개의 배합 리스트
- 각 배합: 원가, 지속력, 전략 리포트 포함

---

#### GET `/api/formulations/accords`
**역할**: 저장된 Accord 목록 조회

**응답**:
```json
{
  "count": 15,
  "accords": [
    {
      "id": 1,
      "name": "Fresh Floral #1",
      "type": "Floral",
      "ingredients_count": 5,
      "created_at": "2024-01-15T10:30:00"
    }
  ]
}
```

---

#### PUT `/api/formulations/accords/{id}`
**역할**: Accord 수정

**요청**:
```json
{
  "name": "Updated Name",
  "ingredients_composition": [...]
}
```

---

#### DELETE `/api/formulations/accords/{id}`
**역할**: Accord 삭제

---

### ingredients.py
**역할**: 원료 CRUD 및 검색

**의존성**: `services/ingredient_service.py`

#### GET `/api/ingredients`
**역할**: 모든 원료 조회

**Query Parameters**:
- `note_family`: Top/Middle/Base 필터

---

#### POST `/api/ingredients`
**역할**: 새 원료 추가 (Vector Store에도 자동 추가)

---

#### PUT `/api/ingredients/{id}`
**역할**: 원료 정보 수정 (Vector Store도 자동 업데이트)

---

#### DELETE `/api/ingredients/{id}`
**역할**: 원료 삭제 (Vector Store에서도 자동 삭제)

---

#### POST `/api/ingredients/auto-fill`
**역할**: LLM을 사용한 원료 정보 자동 채우기

**요청**:
```json
{
  "name": "Bergamot Oil"
}
```

**응답**:
```json
{
  "success": true,
  "source": "llm",
  "data": {
    "inci_name": "Citrus Bergamia Oil",
    "cas_number": "8007-75-8",
    "odor_description": "Fresh, citrusy...",
    "note_family": "Citrus",
    ...
  }
}
```

**사용 서비스**: `ingredient_service.auto_fill()`

---

#### POST `/api/ingredients/search/name`
**역할**: 이름 기반 원료 검색 (SQL LIKE)

---

#### POST `/api/ingredients/search/semantic`
**역할**: 의미 기반 원료 검색 (ChromaDB Vector Search)

**요청**:
```json
{
  "query": "fresh citrus scent",
  "top_k": 5
}
```

**응답**: 유사도 순으로 정렬된 원료 리스트

---

### development.py
**역할**: Development Mode - 대화형 향수 배합 개발

**의존성**: `schema/graph.py` (LangGraph workflow)

#### POST `/api/development/chat`
**역할**: LangGraph 기반 대화형 배합 개발

**요청**:
```json
{
  "messages": [
    {"role": "user", "content": "30대 여성을 위한 프레시 플로럴 향수를 만들고 싶어요"},
    {"role": "assistant", "content": "..."},
    {"role": "user", "content": "더 밝고 경쾌한 느낌으로 해주세요"}
  ]
}
```

**응답**: Server-Sent Events (SSE) 스트리밍

**워크플로우**:
1. `parse_request`: 사용자 입력 파싱
2. `route_by_stage`: 대화 단계 판단
3. `gather_preferences / search_ingredients / create_formulation`: 단계별 처리
4. `validate_formulation`: 배합 검증 (조건부)
5. `generate_response`: AI 응답 생성

**사용 Agent**: `agents/development_agent.py`

---

## 🛠 개발 가이드

### 새 엔드포인트 추가

```python
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.initialization.session import get_db
from app.services.my_service import my_service  # Service 사용

router = APIRouter(prefix="/api/my_feature", tags=["my_feature"])

@router.post("/generate")
async def generate_something(
    request: dict,
    db: Session = Depends(get_db)
):
    """
    새로운 기능 엔드포인트
    """
    try:
        # 입력 검증
        if not request.get("required_field"):
            raise HTTPException(status_code=400, detail="Missing field")

        # Service 호출 (비즈니스 로직은 여기 없음)
        result = my_service.process(request, db)

        return {
            "status": "success",
            "data": result
        }

    except ValueError as e:
        # 비즈니스 로직 에러
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        # 시스템 에러
        logger.error(f"Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
```

**중요**: Routes는 HTTP 처리만, 비즈니스 로직은 Services/Agents에

---

### 입력 검증 (Pydantic)

```python
from pydantic import BaseModel, Field

class GenerateRequest(BaseModel):
    accord_type: str = Field(..., min_length=1, max_length=100)
    target_audience: Optional[str] = None

@router.post("/generate")
async def generate(request: GenerateRequest, db: Session = Depends(get_db)):
    # 자동 검증 완료
    pass
```

---

## 🔗 의존성

**의존하는 모듈**:
- `services/`: 비즈니스 로직 (ingredient_service, llm_service)
- `schema/graph.py`: LangGraph workflow (development mode)
- `db/initialization/session.py`: DB 세션 (Dependency Injection)

**사용하는 곳**:
- `main.py`에서 router 등록

---

## ⚠️ 주의사항

1. **에러 처리**
   - 모든 엔드포인트에 try-except
   - 사용자 친화적 에러 메시지

2. **인증/인가**
   - 향후 OAuth2 추가 예정
   - 현재는 public API

3. **CORS**
   - 프론트엔드 URL을 CORS allowed origins에 추가

---

## 📚 참고
- FastAPI 공식 문서: https://fastapi.tiangolo.com/
