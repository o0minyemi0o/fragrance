"""
ChromaDB client for vector search
"""

import chromadb
from chromadb.config import Settings
import logging

logger = logging.getLogger(__name__)


class ChromaClient:
    """Singleton ChromaDB client"""
    _instance = None
    _client = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(ChromaClient, cls).__new__(cls)
        return cls._instance

    def __init__(self):
        if self._client is None:
            try:
                logger.info("Initializing ChromaDB client...")
                self._client = chromadb.Client(Settings(
                    chroma_db_impl="duckdb+parquet",
                    persist_directory="./chroma_db"
                ))
                logger.info("ChromaDB client initialized successfully")
            except Exception as e:
                logger.error(f"Failed to initialize ChromaDB: {e}")
                raise

    @property
    def client(self):
        """Get ChromaDB client instance"""
        return self._client


# Singleton instance
chroma_client = ChromaClient()
