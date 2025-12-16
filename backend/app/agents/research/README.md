# Research Agents - 시장 조사

## 📋 역할
시장 트렌드 및 소비자 인사이트를 분석하여 배합 생성에 필요한 데이터를 제공합니다.

## 📁 파일 구조
- **market_research_agent.py**: 시장 트렌드 분석
- **consumer_insight_agent.py**: 소비자 페르소나 분석

## 🎯 주요 기능

### market_research_agent.py
**역할**: 현재 향수 시장 트렌드 분석

**프로세스**:
1. Vector Store에서 트렌드 문서 검색
2. DB에서 경쟁 향수 데이터 조회
3. LLM으로 트렌드 요약

**출력**:
- 인기 향 계열 (Floral, Woody, Oriental 등)
- 성장 카테고리
- 트렌드 키워드 (예: "Clean Beauty", "Genderless")

---

### consumer_insight_agent.py
**역할**: 타겟 고객 페르소나 분석

**입력 예시**:
- 30대 여성, 직장인, 활동적인 라이프스타일

**출력**:
- 선호하는 향 타입
- 구매 결정 요인 (가격, 브랜드, 지속력)
- 회피하는 향 (너무 무거운 향, 너무 단 향)

---

## 📚 참고
- 프롬프트: `prompts/research_prompts.py`
- DB 쿼리: `db/queries/perfume_queries.py`
