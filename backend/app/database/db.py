from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.config import settings

DATABASE_URL = settings.DATABASE_URL

engine = create_engine(
    DATABASE_URL,
    echo=True,
    pool_size=2,
    max_overflow=3
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

