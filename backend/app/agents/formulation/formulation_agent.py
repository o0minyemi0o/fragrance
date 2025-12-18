"""
Formulation Agent - 배합 생성

RAG + LLM을 활용하여 향료 배합을 생성합니다.
"""

from typing import List, Dict
from sqlalchemy.orm import Session

# TODO: Implement RAG search, LLM generation, cost calculation


def generate_formulation(user_request: str, db: Session) -> List[Dict]:
    """
    배합 생성 (Placeholder)

    Args:
        user_request: 사용자 요청사항
        db: DB session

    Returns:
        생성된 배합 리스트
    """
    print(f"[formulation_agent] Generating formulation for: {user_request}")

    # TODO: 실제 구현
    # 1. Vector Store에서 유사 배합 검색 (RAG)
    # 2. DB에서 원료 필터링
    # 3. LLM으로 배합 생성
    # 4. 원가 계산

    return []
