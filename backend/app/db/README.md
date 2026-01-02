# DB - 데이터 저장 및 검색 레이어

## 📋 역할
**데이터의 영속성과 검색**을 담당하는 레이어입니다. PostgreSQL (구조화 데이터)과 ChromaDB (벡터 검색)를 통합 관리합니다.

## 📁 폴더 구조
```
db/
├── README.md
├── schema.py                      # SQLAlchemy ORM 모델
├── vector_store.py                # ChromaDB (RAG) 관리
│
├── initialization/                # DB 초기화
│   ├── __init__.py
│   ├── engine.py                  # SQLAlchemy 엔진 생성
│   ├── session.py                 # 세션 관리 (get_db)
│   └── create_tables.py           # 테이블 생성 스크립트
│
└── queries/                       # CRUD 쿼리 모음
    ├── __init__.py
    ├── ingredient_queries.py      # 원료 CRUD
    ├── formulation_queries.py     # 배합 CRUD (Accord/Formula)
    └── perfume_queries.py         # 향수 제품 CRUD
```

---

## 📄 주요 파일 설명

### schema.py
**목적**: SQLAlchemy ORM 모델 정의

**주요 테이블**:

1. **Ingredient (원료)**
   ```python
   class Ingredient(Base):
       __tablename__ = "ingredients"

       id: int                          # PK
       ingredient_name: str             # 원료명
       inci_name: str                   # INCI 표준명
       cas_number: str                  # CAS 번호
       odor_description: str            # 향 설명
       odor_threshold: float            # 감지 임계값
       note_family: str                 # Top/Middle/Base
       max_usage_percentage: float      # 최대 사용 가능 %
       price_per_gram: float            # g당 가격
       supplier: str                    # 공급업체
       synonyms: List[str]              # JSON 배열
       perfume_applications: List[str]  # JSON 배열
       stability: str
       tenacity: str
       volatility: str
       created_at: datetime
   ```

2. **Accord (어코드 조합)**
   ```python
   class Accord(Base):
       __tablename__ = "accords"

       id: int
       name: str                        # 어코드명
       accord_type: str                 # 타입 (Floral, Fresh, ...)
       description: str
       ingredients_composition: List    # JSON: [{'name': 'Rose', 'percentage': 40, 'note': 'middle'}]
       total_percentage: float          # 합계 (보통 100)
       longevity: str                   # 지속력
       sillage: str                     # 발향력
       llm_recommendation: str          # AI 추천 설명
       created_at: datetime
   ```

3. **Formula (완제품 배합)**
   ```python
   class Formula(Base):
       __tablename__ = "formulas"

       id: int
       name: str
       formula_type: str                # Eau de Parfum, Eau de Toilette
       description: str
       ingredients_composition: List    # Accord와 동일 구조
       total_percentage: float
       longevity: str
       sillage: str
       stability_notes: str             # 안정성 메모
       estimated_cost: float            # 예상 원가
       llm_recommendation: str
       created_at: datetime
   ```

4. **Perfume (출시 향수 정보)** - 선택사항
   ```python
   class Perfume(Base):
       __tablename__ = "perfumes"

       id: int
       name: str
       brand: str
       launch_year: int
       target_gender: str               # Male/Female/Unisex
       fragrance_family: str            # Floral, Oriental, Woody, ...
       notes_top: List[str]             # JSON
       notes_middle: List[str]
       notes_base: List[str]
       price_range: str                 # Low/Mid/High
       market_position: str
       created_at: datetime
   ```

**JSON 필드 처리**:
- PostgreSQL의 `JSONB` 타입 사용
- SQLAlchemy: `Column(JSONB)`
- 인덱싱 가능, 빠른 검색

---

### initialization/

#### engine.py
**목적**: SQLAlchemy 엔진 생성

```python
from sqlalchemy import create_engine
from app.schema.config import settings

engine = create_engine(
    settings.DATABASE_URL,
    echo=(settings.ENV == "development"),
    pool_size=2,                      # 커넥션 풀
    max_overflow=3
)
```

**주요 설정**:
- `echo=True`: 개발 환경에서 SQL 로그 출력
- `pool_size`: 기본 커넥션 수
- `max_overflow`: 추가 커넥션 허용 수

---

#### session.py
**목적**: 세션 관리 및 의존성 주입

```python
from sqlalchemy.orm import sessionmaker, Session

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

def get_db() -> Session:
    """FastAPI 의존성 주입용"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

**사용 예시** (routes에서):
```python
from app.db.initialization.session import get_db

@router.get("/ingredients")
def list_ingredients(db: Session = Depends(get_db)):
    ingredients = db.query(Ingredient).all()
    return ingredients
```

---

#### create_tables.py
**목적**: 테이블 생성 스크립트

```python
from app.db.schema import Base
from app.db.initialization.engine import engine

def create_all_tables():
    """모든 테이블 생성"""
    Base.metadata.create_all(bind=engine)
    print("✅ Tables created successfully!")

if __name__ == "__main__":
    create_all_tables()
```

**실행 방법**:
```bash
python -m app.db.initialization.create_tables
```

---

### queries/

#### ingredient_queries.py
**목적**: 원료 CRUD 쿼리

**주요 함수**:

1. **`get_all_ingredients(db)`**
   - 모든 원료 조회
   - 필터링: 노트 패밀리, 가격대

2. **`get_ingredient_by_name(db, name)`**
   - 이름으로 원료 검색
   - 대소문자 무시, 부분 일치

3. **`search_ingredients_by_odor(db, odor_keywords)`**
   - 향 설명 기반 검색
   - Full-text search (PostgreSQL tsquery)

4. **`get_ingredients_in_price_range(db, min_price, max_price)`**
   - 가격대별 원료 조회

5. **`create_ingredient(db, data)`**
   - 새 원료 추가

6. **`update_ingredient(db, id, data)`**
   - 원료 정보 수정

7. **`delete_ingredient(db, id)`**
   - 원료 삭제

**예시**:
```python
from app.db.queries.ingredient_queries import get_all_ingredients

def my_agent_logic(db: Session):
    ingredients = get_all_ingredients(db, note_family="Top")
    # 원료 리스트 활용
```

---

#### formulation_queries.py
**목적**: Accord/Formula CRUD

**주요 함수**:

1. **Accord 관련**
   - `get_all_accords(db)`
   - `get_accord_by_id(db, id)`
   - `get_accords_by_type(db, accord_type)`
   - `create_accord(db, data)`
   - `update_accord(db, id, data)`
   - `delete_accord(db, id)`

2. **Formula 관련**
   - `get_all_formulas(db)`
   - `get_formula_by_id(db, id)`
   - `get_formulas_by_type(db, formula_type)`
   - `calculate_formula_cost(db, formula_id)` ← 원가 계산
   - `create_formula(db, data)`
   - `update_formula(db, id, data)`
   - `delete_formula(db, id)`

**원가 계산 로직**:
```python
def calculate_formula_cost(db: Session, formula_id: int) -> float:
    formula = db.query(Formula).filter(Formula.id == formula_id).first()
    total_cost = 0.0

    for ing in formula.ingredients_composition:
        ingredient = db.query(Ingredient).filter(
            Ingredient.ingredient_name == ing['name']
        ).first()

        if ingredient:
            total_cost += (ing['percentage'] / 100) * ingredient.price_per_gram

    return total_cost
```

---

#### perfume_queries.py
**목적**: 출시 향수 정보 관리 (선택사항)

**주요 함수**:
- `get_perfumes_by_brand(db, brand)`
- `search_perfumes_by_notes(db, notes)`
- `get_perfumes_by_price_range(db, range)`

**활용 사례**:
- 경쟁 제품 분석
- 레퍼런스 향수 참조

---

### vector_store.py
**목적**: ChromaDB를 사용한 벡터 검색 (RAG)

**주요 기능**:

1. **과거 배합 임베딩**
   - 모든 Accord/Formula를 벡터화
   - 설명문 + 원료 리스트를 임베딩

2. **유사 배합 검색**
   ```python
   def search_similar_formulations(query: str, top_k: int = 5):
       """
       사용자 요청과 유사한 과거 배합 검색

       Args:
           query: "30대 여성, 프레시 플로럴"
           top_k: 상위 몇 개 반환

       Returns:
           List[Dict]: 유사 배합 리스트
       """
       results = chroma_client.query(
           collection_name="formulations",
           query_texts=[query],
           n_results=top_k
       )
       return results
   ```

3. **트렌드 문서 검색**
   - 시장 조사 보고서 임베딩
   - 키워드 기반 트렌드 검색

**기술 스택**:
- **ChromaDB**: 로컬에서 실행 가능, 무료
- **임베딩 모델**: OpenAI `text-embedding-3-small` (저렴, 빠름)
- **거리 메트릭**: Cosine Similarity

**초기화 예시**:
```python
import chromadb

client = chromadb.PersistentClient(path="./chroma_db")

collection = client.get_or_create_collection(
    name="formulations",
    metadata={"hnsw:space": "cosine"}
)
```

**임베딩 추가**:
```python
def add_formulation_to_vector_store(formulation: Accord):
    # 텍스트 구성
    text = f"{formulation.name} {formulation.description}"
    text += " Ingredients: " + ", ".join([
        ing['name'] for ing in formulation.ingredients_composition
    ])

    # 임베딩 생성
    embedding = openai.Embedding.create(
        input=text,
        model="text-embedding-3-small"
    )

    # ChromaDB에 추가
    collection.add(
        ids=[str(formulation.id)],
        embeddings=[embedding['data'][0]['embedding']],
        documents=[text],
        metadatas=[{"type": "accord", "id": formulation.id}]
    )
```

---

## 🔗 의존성

**의존하는 모듈**:
- `app.schema.config` (DB URL)

**사용하는 곳**:
- `app.agents.` (모든 Agent가 DB 조회)
- `app.routes.` (FastAPI 엔드포인트)

---

## 🚀 초기 설정

### 1. PostgreSQL 설치 및 데이터베이스 생성
```bash
# PostgreSQL 설치 (Ubuntu/EC2)
sudo apt install postgresql postgresql-contrib

# DB 생성
sudo -u postgres psql
CREATE DATABASE fragrance;
CREATE USER fragrance_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE fragrance TO fragrance_user;
```

### 2. .env 설정
```env
DATABASE_URL=postgresql://fragrance_user:your_password@localhost:5432/fragrance
```

### 3. 테이블 생성
```bash
python -m app.db.initialization.create_tables
```

### 4. ChromaDB 디렉토리 생성
```bash
mkdir -p ./chroma_db
```

---

## 📊 데이터베이스 마이그레이션

### Alembic 사용 (권장)
```bash
# 설치
pip install alembic

# 초기화
alembic init migrations

# 마이그레이션 생성
alembic revision --autogenerate -m "Add new column"

# 적용
alembic upgrade head
```

---

## ⚠️ 주의사항

1. **트랜잭션 관리**
   - 여러 테이블 수정 시 트랜잭션 사용
   - 실패 시 롤백 필수

2. **N+1 쿼리 방지**
   - `joinedload()` 사용
   - 배치 쿼리 활용

3. **인덱스 최적화**
   - 자주 검색하는 컬럼에 인덱스 추가
   - JSONB 필드에 GIN 인덱스

4. **벡터 스토어 동기화**
   - DB에 새 배합 추가 시 ChromaDB에도 반영
   - 배치 처리로 주기적 동기화

---

## 📚 참고 자료
- [SQLAlchemy ORM](https://docs.sqlalchemy.org/en/20/orm/)
- [ChromaDB Documentation](https://docs.trychroma.com/)
- [PostgreSQL JSONB](https://www.postgresql.org/docs/current/datatype-json.html)
- [Alembic Migrations](https://alembic.sqlalchemy.org/)
