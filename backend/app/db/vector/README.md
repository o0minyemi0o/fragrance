# DB Vector - Vector Store (ChromaDB)

## 📋 역할
**Semantic Search**를 위한 벡터 스토어 관리를 담당합니다. ChromaDB를 사용하여 원료(Ingredient)의 의미적 유사도 검색을 제공합니다.

## 📁 파일 구조
```
vector/
├── README.md
├── chroma_client.py        # ChromaDB 클라이언트 초기화
└── ingredient_vector.py    # 원료 벡터 스토어 관리
```

## 📄 파일 설명

### chroma_client.py
**역할**: ChromaDB 클라이언트 초기화 및 싱글톤 제공

**주요 내용**:
```python
import chromadb
from app.schema.config import settings

chroma_client = chromadb.PersistentClient(
    path=settings.CHROMADB_PATH
)
```

**설정**:
- `CHROMADB_PATH`: 벡터 DB 저장 경로 (기본: `./data/chromadb`)
- PersistentClient: 로컬 파일 시스템에 영구 저장

**사용 위치**: `ingredient_vector.py`

---

### ingredient_vector.py
**역할**: 원료 벡터 스토어 CRUD 및 검색

**주요 함수**:

#### 1. `add_ingredient_to_vector_store(ingredient_id, ingredient_name, inci_name, odor_description)`
원료를 벡터 스토어에 추가

**사용 예시**:
```python
add_ingredient_to_vector_store(
    ingredient_id=1,
    ingredient_name="Bergamot Oil",
    inci_name="Citrus Bergamia Oil",
    odor_description="Fresh, citrusy, slightly floral"
)
```

**저장 내용**:
- Document: `{name} ({inci_name}): {odor_description}`
- Metadata: `{"ingredient_id": ..., "ingredient_name": ..., "inci_name": ...}`
- ID: `ingredient_{id}`

---

#### 2. `delete_ingredient_from_vector_store(ingredient_id)`
원료를 벡터 스토어에서 삭제

**사용 예시**:
```python
delete_ingredient_from_vector_store(ingredient_id=1)
```

---

#### 3. `update_ingredient_in_vector_store(ingredient_id, ingredient_name, inci_name, odor_description)`
원료 정보를 벡터 스토어에서 업데이트

**내부 동작**:
1. 기존 데이터 삭제
2. 새 데이터 추가

---

#### 4. `search_ingredients_semantic(query, top_k=5)`
의미적 유사도 기반 원료 검색

**사용 예시**:
```python
results = search_ingredients_semantic("fresh citrus scent", top_k=5)
# Returns:
# [
#   {
#     "ingredient_id": 1,
#     "ingredient_name": "Bergamot Oil",
#     "inci_name": "Citrus Bergamia Oil",
#     "distance": 0.15
#   },
#   ...
# ]
```

**반환 값**:
- `ingredient_id`: 원료 ID
- `ingredient_name`: 원료명
- `inci_name`: INCI 명
- `distance`: 거리 (낮을수록 유사)

---

#### 5. `sync_ingredients_to_vector_store(db)`
PostgreSQL DB의 모든 원료를 ChromaDB에 동기화

**사용 시나리오**:
- 초기 설정
- DB 마이그레이션 후
- 대량 업데이트 후

**사용 예시**:
```python
from app.db.initialization.session import get_db

db = next(get_db())
sync_ingredients_to_vector_store(db)
```

---

## 🎯 Semantic Search vs Name Search

| 검색 방식 | 장점 | 단점 | 사용 사례 |
|---------|------|------|----------|
| **Name Search** (SQL `LIKE`) | 빠름, 정확한 이름 매칭 | 동의어/유사어 검색 불가 | "Bergamot" 검색 |
| **Semantic Search** (Vector) | 의미적 유사도, 자연어 쿼리 | 느림, 임베딩 필요 | "fresh citrus note" 검색 |

**Hybrid Search 권장**:
1. Name Search로 정확한 매칭 시도
2. 결과가 부족하면 Semantic Search 추가

---

## 🔗 의존성

**의존하는 것**:
- `chromadb`: Vector database
- `schema/config.py`: ChromaDB 설정 (경로, collection 이름)
- `db/queries/ingredient_queries.py`: DB 동기화 시

**사용하는 곳**:
- `routes/ingredients.py`: Semantic search endpoint
- `agents/development_agent.py`: 원료 검색 시 (향후)

---

## ⚠️ 주의사항

1. **동기화**
   - DB에 원료 추가/수정/삭제 시 Vector Store도 업데이트 필요
   - 자동 동기화는 아직 미구현 (TODO)

2. **Embedding Model**
   - ChromaDB 기본 임베딩 사용 중
   - 향후 커스텀 모델로 교체 가능 (향수 도메인 특화)

3. **성능**
   - 대량 검색 시 캐싱 고려
   - top_k를 적절히 조절 (기본 5개)

4. **초기 설정**
   - 처음 사용 시 `sync_ingredients_to_vector_store()` 반드시 실행
   - Collection이 없으면 자동 생성됨

---

## 🚀 초기 설정 가이드

### 1. ChromaDB 경로 설정
```env
# .env
CHROMADB_PATH=./data/chromadb
CHROMADB_COLLECTION_NAME=fragrance_ingredients
```

### 2. 초기 동기화
```python
# scripts/sync_vector_db.py
from app.db.initialization.session import get_db
from app.db.vector.ingredient_vector import sync_ingredients_to_vector_store

db = next(get_db())
sync_ingredients_to_vector_store(db)
print("✓ Vector DB 동기화 완료")
```

```bash
python scripts/sync_vector_db.py
```

### 3. 검색 테스트
```python
from app.db.vector.ingredient_vector import search_ingredients_semantic

results = search_ingredients_semantic("woody earthy scent", top_k=3)
for r in results:
    print(f"{r['ingredient_name']}: {r['distance']}")
```

---

## 📚 참고 자료
- [ChromaDB 공식 문서](https://docs.trychroma.com/)
- [Semantic Search 개념](https://www.pinecone.io/learn/what-is-semantic-search/)
