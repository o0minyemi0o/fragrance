from sqlalchemy import create_engine
from app.schema.config import settings

engine = create_engine(
    settings.DATABASE_URL,
    echo=(settings.ENV == "development")
)
