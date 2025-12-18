# DB Initialization - 데이터베이스 초기화

## 📋 역할
데이터베이스 연결 및 세션 관리를 담당합니다.

## 📁 파일 구조
```
initialization/
├── README.md
├── engine.py          # SQLAlchemy Engine 생성
├── session.py         # DB Session 관리 및 Dependency Injection
└── create_tables.py   # 테이블 생성 스크립트
```

## 📄 파일 설명

### engine.py
**역할**: SQLAlchemy Engine 생성

**내용**:
```python
from sqlalchemy import create_engine
from app.schema.config import settings

engine = create_engine(settings.DATABASE_URL)
```

**사용 위치**: `session.py`, `create_tables.py`

---

### session.py
**역할**: DB 세션 관리 및 FastAPI Dependency Injection

**주요 함수**:
- `SessionLocal`: SQLAlchemy SessionLocal factory
- `get_db()`: FastAPI dependency로 사용되는 세션 제공 함수

**사용 예시**:
```python
from app.db.initialization.session import get_db

@router.post("/items")
def create_item(db: Session = Depends(get_db)):
    # db 세션 사용
    pass
```

**자동 관리**:
- 세션 자동 열기
- 트랜잭션 커밋
- 예외 발생 시 롤백
- 세션 자동 닫기 (finally)

---

### create_tables.py
**역할**: 데이터베이스 테이블 생성 스크립트

**내용**:
- `Base.metadata.create_all(engine)` 실행
- 모든 SQLAlchemy 모델을 기반으로 테이블 생성

**실행 방법**:
```bash
python -m app.db.initialization.create_tables
```

**주의**: 프로덕션에서는 Alembic 마이그레이션 사용 권장

---

## 🔗 의존성

**의존하는 것**:
- `schema/config.py`: DATABASE_URL 설정
- `db/schema.py`: SQLAlchemy 모델 정의

**사용하는 곳**:
- `routes/`: 모든 route에서 `get_db()` 사용
- `agents/`: Agent에서 DB 접근 시

---

## ⚠️ 주의사항

1. **세션 관리**
   - `get_db()`는 FastAPI Depends()로만 사용
   - 직접 세션을 생성하지 말 것

2. **테이블 생성**
   - 개발 환경: `create_tables.py` 사용 가능
   - 프로덕션: Alembic 마이그레이션 필수

3. **연결 풀**
   - Engine은 자동으로 연결 풀 관리
   - 세션은 요청마다 생성/종료
