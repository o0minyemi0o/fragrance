from sqlalchemy.orm import sessionmaker, Session
from app.db.initialization.engine import engine

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

def get_db() -> Session:
    """FastAPI 의존성 주입용 DB 세션"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
