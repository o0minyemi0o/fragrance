# Services - 비즈니스 로직 레이어

## 📋 역할
Routes에서 분리된 **비즈니스 로직**을 담당합니다. HTTP 요청/응답과 독립적으로 재사용 가능한 서비스 함수들을 제공합니다.

## 📁 파일 구조
```
services/
├── README.md
├── ingredient_service.py    # 원료 관련 비즈니스 로직
└── llm_service.py           # LLM 호출 관련 로직
```

## 📄 파일 설명

### ingredient_service.py
**역할**: 원료 자동 채우기 (Auto-fill) 비즈니스 로직

**주요 클래스**: `IngredientService`

**기능**:
- `auto_fill(ingredient_name: str)`: 원료명으로 정보 자동 채우기
  - LLM(Gemini)을 사용하여 원료 정보 생성
  - INCI name, CAS number, 향 설명, note family 등
  - JSON 파싱 및 에러 핸들링

**사용 예시**:
```python
from app.services.ingredient_service import ingredient_service

result = ingredient_service.auto_fill("Bergamot Oil")
# Returns: {"success": True, "source": "llm", "data": {...}}
```

**호출 위치**: `routes/ingredients.py`의 `/auto-fill` endpoint

---

### llm_service.py
**역할**: LLM 관련 비즈니스 로직 (Accord/Formula 생성)

**주요 클래스**: `LLMService`

**기능**:
- `generate_accord(accord_type: str, db, use_available_ingredients)`: 어코드 생성
  - 단순한 향 조합 생성
  - DB의 원료 목록을 컨텍스트로 사용 가능

- `generate_formula(formula_type: str, db, use_available_ingredients)`: 포뮬러 생성
  - 완제품 향수 배합 생성
  - Top/Middle/Base note 구조

- `stream_chat(messages, system_prompt)`: 채팅 스트리밍 (deprecated)
  - **주의**: 이제 LangGraph로 대체됨, 사용 안 함

**사용 예시**:
```python
from app.services.llm_service import llm_service

accord = llm_service.generate_accord("Fresh Citrus", db, use_available_ingredients=True)
formula = llm_service.generate_formula("Floral", db, use_available_ingredients=False)
```

**호출 위치**: `routes/formulations.py`의 `/accord`, `/formula` endpoints

---

## 🔗 의존성

**Services가 의존하는 것**:
- `schema/config.py`: 설정 (API 키)
- `prompts/`: LLM 프롬프트
- `db/`: 데이터베이스 쿼리 (옵션)

**Services를 사용하는 것**:
- `routes/ingredients.py`: ingredient_service
- `routes/formulations.py`: llm_service

---

## 📝 설계 원칙

### 1. 단일 책임
- 각 서비스는 명확한 하나의 도메인 담당
- ingredient_service: 원료 관련
- llm_service: LLM 호출 관련

### 2. HTTP 독립성
- HTTP 요청/응답 처리는 routes에서
- Services는 순수 비즈니스 로직만

### 3. Singleton 패턴
- 서비스 인스턴스는 모듈 레벨에서 1개만 생성
- `ingredient_service = IngredientService()`
- `llm_service = LLMService()`

### 4. 에러 핸들링
- Services는 적절한 에러를 raise
- Routes에서 HTTPException으로 변환

---

## ⚠️ 주의사항

1. **DB 세션 관리**
   - Services가 DB를 사용할 경우, 세션은 routes에서 주입
   - Services 내부에서 세션 생성 금지 (테스트 어려움)

2. **LLM 비용**
   - 불필요한 LLM 호출 최소화
   - 캐싱 고려

3. **LangGraph vs Services**
   - Development Mode: LangGraph workflow 사용
   - 단순 기능 (auto-fill, accord/formula): Services 사용

---

## 🚀 개발 가이드

### 새 서비스 추가 시

1. **파일 생성**: `services/new_service.py`
2. **클래스 정의**: `class NewService`
3. **Singleton 생성**: `new_service = NewService()`
4. **routes에서 import**: `from app.services.new_service import new_service`

### 예시
```python
# services/pricing_service.py
class PricingService:
    def calculate_price(self, cost: float, margin: float) -> float:
        return cost * (1 + margin)

pricing_service = PricingService()
```

```python
# routes/products.py
from app.services.pricing_service import pricing_service

@router.post("/calculate-price")
def calculate_price(cost: float, margin: float):
    return {"price": pricing_service.calculate_price(cost, margin)}
```
