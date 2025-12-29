"""
ChromaDB client for vector search
"""

import chromadb
import logging
import os

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

                # 최신 ChromaDB 설정 방식 (v0.4.0+)
                # PersistentClient 사용 (persist_directory 지정)
                persist_dir = os.getenv("CHROMADB_PATH", "./chroma_db")

                self._client = chromadb.PersistentClient(
                    path=persist_dir
                )

                logger.info(f"ChromaDB client initialized successfully at {persist_dir}")
            except Exception as e:
                logger.error(f"Failed to initialize ChromaDB: {e}")
                raise

    @property
    def client(self):
        """Get ChromaDB client instance"""
        return self._client


# Singleton instance
chroma_client = ChromaClient()
