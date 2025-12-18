"""
Ingredient vector operations using ChromaDB
"""

from typing import List, Dict, Any
from sqlalchemy.orm import Session
from app.db.schema import Ingredient
from app.db.queries import get_all_ingredients
from .chroma_client import chroma_client
import logging

logger = logging.getLogger(__name__)

COLLECTION_NAME = "ingredients"


def get_or_create_collection():
    """Get or create ChromaDB collection for ingredients"""
    try:
        return chroma_client.client.get_or_create_collection(
            name=COLLECTION_NAME,
            metadata={"description": "Fragrance ingredients with semantic search"}
        )
    except Exception as e:
        logger.error(f"Failed to get/create collection: {e}")
        raise


def index_ingredient(ingredient: Ingredient) -> None:
    """Index a single ingredient into ChromaDB"""
    try:
        collection = get_or_create_collection()

        # Create searchable document from ingredient properties
        document = f"""
        Name: {ingredient.ingredient_name}
        INCI: {ingredient.inci_name or 'N/A'}
        Odor: {ingredient.odor_description or 'N/A'}
        Note Family: {ingredient.note_family or 'N/A'}
        """.strip()

        metadata = {
            "id": ingredient.id,
            "name": ingredient.ingredient_name,
            "note_family": ingredient.note_family or "",
            "cas_number": ingredient.cas_number or "",
        }

        collection.add(
            ids=[f"ingredient_{ingredient.id}"],
            documents=[document],
            metadatas=[metadata]
        )
        logger.info(f"Indexed ingredient: {ingredient.ingredient_name}")
    except Exception as e:
        logger.error(f"Failed to index ingredient {ingredient.ingredient_name}: {e}")
        raise


def index_all_ingredients(db: Session) -> int:
    """Index all ingredients from database into ChromaDB"""
    try:
        ingredients = get_all_ingredients(db)
        collection = get_or_create_collection()

        # Clear existing collection
        try:
            chroma_client.client.delete_collection(name=COLLECTION_NAME)
            collection = get_or_create_collection()
        except Exception:
            pass

        documents = []
        ids = []
        metadatas = []

        for ing in ingredients:
            document = f"""
            Name: {ing.ingredient_name}
            INCI: {ing.inci_name or 'N/A'}
            Odor: {ing.odor_description or 'N/A'}
            Note Family: {ing.note_family or 'N/A'}
            """.strip()

            documents.append(document)
            ids.append(f"ingredient_{ing.id}")
            metadatas.append({
                "id": ing.id,
                "name": ing.ingredient_name,
                "note_family": ing.note_family or "",
                "cas_number": ing.cas_number or "",
            })

        if documents:
            collection.add(
                ids=ids,
                documents=documents,
                metadatas=metadatas
            )

        logger.info(f"Indexed {len(documents)} ingredients")
        return len(documents)
    except Exception as e:
        logger.error(f"Failed to index all ingredients: {e}")
        raise


def search_ingredients_semantic(query: str, n_results: int = 10) -> List[Dict[str, Any]]:
    """
    Search ingredients using semantic similarity

    Args:
        query: Natural language query (e.g., "sweet floral ingredients")
        n_results: Number of results to return

    Returns:
        List of matching ingredients with metadata
    """
    try:
        collection = get_or_create_collection()

        results = collection.query(
            query_texts=[query],
            n_results=n_results
        )

        # Format results
        matches = []
        if results['metadatas'] and results['metadatas'][0]:
            for i, metadata in enumerate(results['metadatas'][0]):
                matches.append({
                    "id": metadata.get("id"),
                    "name": metadata.get("name"),
                    "note_family": metadata.get("note_family"),
                    "cas_number": metadata.get("cas_number"),
                    "distance": results['distances'][0][i] if results['distances'] else None
                })

        logger.info(f"Semantic search for '{query}': found {len(matches)} results")
        return matches
    except Exception as e:
        logger.error(f"Semantic search failed for '{query}': {e}")
        raise
