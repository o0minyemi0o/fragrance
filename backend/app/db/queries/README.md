# DB Queries - 데이터베이스 쿼리 함수

## 📋 역할
데이터베이스 CRUD 작업을 수행하는 **재사용 가능한 쿼리 함수**를 제공합니다.

## 📁 파일 구조
```
queries/
├── README.md
├── ingredient_queries.py    # 원료 테이블 쿼리
├── accord_queries.py        # 어코드 테이블 쿼리
└── formula_queries.py       # 포뮬러 테이블 쿼리
```

## 📄 파일 설명

### ingredient_queries.py
**역할**: Ingredient 테이블 CRUD

**주요 함수**:
- `get_all_ingredients(db)`: 모든 원료 조회
- `get_ingredient_by_id(db, ingredient_id)`: ID로 원료 조회
- `get_ingredient_by_name(db, name)`: 이름으로 원료 조회
- `create_ingredient(db, ingredient_data)`: 원료 생성
- `update_ingredient(db, ingredient_id, updates)`: 원료 업데이트
- `delete_ingredient(db, ingredient_id)`: 원료 삭제
- `search_ingredients_by_name(db, query)`: 이름 검색
- `get_ingredients_by_note_family(db, note_family)`: Note family별 조회

**사용 예시**:
```python
from app.db.queries.ingredient_queries import get_all_ingredients

def my_route(db: Session = Depends(get_db)):
    ingredients = get_all_ingredients(db)
    return ingredients
```

---

### accord_queries.py
**역할**: Accord 테이블 CRUD

**주요 함수**:
- `get_all_accords(db)`: 모든 어코드 조회
- `get_accord_by_id(db, accord_id)`: ID로 어코드 조회
- `create_accord(db, accord_data)`: 어코드 생성
- `delete_accord(db, accord_id)`: 어코드 삭제

**사용 예시**:
```python
from app.db.queries.accord_queries import create_accord

accord_data = {"name": "Fresh Citrus", "description": "..."}
new_accord = create_accord(db, accord_data)
```

---

### formula_queries.py
**역할**: Formula 테이블 CRUD

**주요 함수**:
- `get_all_formulas(db)`: 모든 포뮬러 조회
- `get_formula_by_id(db, formula_id)`: ID로 포뮬러 조회
- `create_formula(db, formula_data)`: 포뮬러 생성
- `delete_formula(db, formula_id)`: 포뮬러 삭제

**사용 예시**:
```python
from app.db.queries.formula_queries import get_all_formulas

formulas = get_all_formulas(db)
```

---

## 🎯 설계 원칙

### 1. 함수 기반 쿼리
- Repository 패턴 대신 간단한 함수 사용
- 각 테이블마다 별도 파일

### 2. Session 주입
- 모든 쿼리 함수는 `db: Session`을 첫 번째 인자로 받음
- 호출자가 세션을 관리

### 3. 명확한 네이밍
- `get_*`: 조회
- `create_*`: 생성
- `update_*`: 업데이트
- `delete_*`: 삭제
- `search_*`: 검색

### 4. 에러 처리
- 쿼리 실패 시 적절한 예외 발생
- 호출자(routes/services)가 에러 처리

---

## 🔗 의존성

**의존하는 것**:
- `db/schema.py`: SQLAlchemy 모델
- `sqlalchemy.orm.Session`: DB 세션

**사용하는 곳**:
- `routes/`: API endpoints
- `services/`: 비즈니스 로직
- `agents/`: LangGraph agent nodes

---

## ⚠️ 주의사항

1. **세션 커밋**
   - 읽기 쿼리: 커밋 불필요
   - 쓰기 쿼리: 함수 내에서 `db.commit()` 호출
   - 롤백: 에러 발생 시 자동 롤백 (get_db()가 처리)

2. **N+1 문제**
   - 관계된 데이터 조회 시 `joinedload()` 사용
   - 예: `options(joinedload(Formula.ingredients))`

3. **대량 데이터**
   - 페이지네이션 고려
   - `limit()`, `offset()` 사용

---

## 🚀 새 쿼리 추가 가이드

### 1. 파일 선택
- 해당 테이블의 `*_queries.py` 파일에 추가

### 2. 함수 작성
```python
def get_ingredients_by_price_range(db: Session, min_price: float, max_price: float):
    """가격 범위로 원료 검색"""
    return db.query(Ingredient).filter(
        Ingredient.price >= min_price,
        Ingredient.price <= max_price
    ).all()
```

### 3. Export
```python
# __init__.py에 추가
from .ingredient_queries import get_ingredients_by_price_range

__all__ = [
    ...,
    "get_ingredients_by_price_range"
]
```

### 4. 사용
```python
from app.db.queries import get_ingredients_by_price_range

ingredients = get_ingredients_by_price_range(db, 10.0, 50.0)
```
