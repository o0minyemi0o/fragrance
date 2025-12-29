from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    # Database
    DATABASE_URL: str

    # Google Gemini
    GOOGLE_API_KEY: str

    # Groq
    GROQ_API_KEY: str

    # Environment
    ENV: str = "development"

    # ChromaDB
    CHROMADB_PATH: str = "./data/chromadb"
    CHROMADB_COLLECTION_NAME: str = "fragrance_ingredients"

    # LangGraph
    LANGGRAPH_TIMEOUT: int = 300  # 5분
    LANGGRAPH_MAX_RETRIES: int = 3
    LANGGRAPH_RECURSION_LIMIT: int = 25

    # Logging
    LOG_LEVEL: str = "INFO"

    class Config:
        env_file = ".env"

@lru_cache()
def get_settings() -> Settings:
    return Settings()

settings = get_settings()

