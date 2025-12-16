# Formulation Agents - 배합 생성

## 📋 역할
RAG + LLM을 활용하여 향료 배합을 생성하는 Agent 그룹입니다.

## 📁 파일 구조
- **formulation_agent.py**: 메인 배합 생성 (Accord/Formula)
- **reference_agent.py**: 레퍼런스 향수 분석
- **accord_generator.py**: 어코드 조합 생성

## 🎯 주요 기능

### formulation_agent.py
**역할**: 완전한 배합 생성

**프로세스**:
1. 기존 배합 레퍼런스 요청시, Vector Store에서 유사 과거 배합 검색 (RAG)
2. DB에서 적합한 원료 필터링 (노트 패밀리, 가격대)
3. LLM으로 배합 생성
4. 배합의 원가 계산

**주요 함수**:
```python
def generate_formulation(user_request: str, db: Session) -> List[Dict]:
    # 1. RAG 검색
    similar = vector_store.search_similar_formulations(user_request, top_k=5)

    # 2. 원료 조회
    ingredients = ingredient_queries.get_all_ingredients(db)

    # 3. LLM 생성
    prompt = formulation_prompts.GENERATE_FORMULA_PROMPT.format(
        request=user_request,
        references=similar,
        ingredients=ingredients
    )
    result = llm_service.generate(prompt)

    # 4. 원가 계산
    for formulation in result:
        formulation['cost'] = calculate_cost(formulation, db)

    return result
```

---

### reference_agent.py
**역할**: 레퍼런스 향수 분석 및 유사 배합 제안

**사용 케이스**:
- "샤넬 No.5 같은 향수 만들고 싶어요"
- DB에서 Perfume 테이블 조회 → 노트 분석 → 유사 배합 생성

---

### accord_generator.py
**역할**: 어코드(포뮬러보다 간단하고 단일 특성에 가까운 조합) 생성

**특징**:
- Formula보다 단순 (Top/Middle/Base 구분 없음)
- 빠른 생성

---

## 📚 참고
- 프롬프트: `prompts/formulation_prompts.py`
- DB 쿼리: `db/queries/ingredient_queries.py`, `formulation_queries.py`
