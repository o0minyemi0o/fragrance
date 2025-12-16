# Routes - API 엔드포인트

## 📋 역할
외부 클라이언트(프론트엔드)와의 **HTTP 통신 창구**입니다. 요청을 검증하고 Coordinator를 호출한 후 응답을 반환합니다.

## 📁 파일 구조 (기존)
```
routes/
├── README.md
├── formulations.py    # Accord/Formula 생성 및 관리
├── ingredients.py     # 원료 CRUD
└── development.py     # 개발/테스트용 엔드포인트
```

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
**역할**: 원료 CRUD

#### GET `/api/ingredients`
**역할**: 모든 원료 조회

**Query Parameters**:
- `note_family`: Top/Middle/Base 필터
- `min_price`, `max_price`: 가격대 필터

---

#### POST `/api/ingredients`
**역할**: 새 원료 추가

**요청**:
```json
{
  "ingredient_name": "Bergamot",
  "inci_name": "Citrus Bergamia",
  "note_family": "Top",
  "odor_description": "Fresh, citrusy, slightly bitter",
  "max_usage_percentage": 10.0
}
```

---

#### PUT `/api/ingredients/{id}`
**역할**: 원료 정보 수정

---

#### DELETE `/api/ingredients/{id}`
**역할**: 원료 삭제

---

## 🛠 개발 가이드

### 새 엔드포인트 추가

```python
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.initialization.session import get_db
from app.agents.coordinator import coordinator

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

        # Coordinator 호출
        result = coordinator.run({
            "user_input": request,
            "db": db
        })

        return {
            "status": "success",
            "data": result
        }

    except Exception as e:
        logger.error(f"Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
```

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
- `app.agents.coordinator` (워크플로우 실행)
- `app.db.initialization.session` (DB 세션)
- `app.schemas.` (Pydantic 모델 - 기존 구조 유지)

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
