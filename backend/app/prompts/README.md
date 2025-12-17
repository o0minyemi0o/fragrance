# Prompts - LLM 프롬프트 템플릿 관리

## 📋 역할
**AI 성능의 핵심**을 담당하는 LLM 프롬프트를 독립적으로 관리합니다. 프롬프트를 코드와 분리하여 **A/B 테스트**, **버전 관리**, **빠른 반복**이 가능합니다.

## 📁 파일 구조
```
prompts/
├── README.md
├── formulation_prompts.py    # 배합 생성 관련
├── research_prompts.py        # 시장 조사 관련
├── strategy_prompts.py        # 전략 수립 관련
└── validation_prompts.py      # 검증 관련
```

---

## 📄 각 파일의 역할

### formulation_prompts.py
**목적**: 향료 배합 생성을 위한 프롬프트

**주요 프롬프트**:

1. **`GENERATE_ACCORD_PROMPT`**  ###comment : 기존 함수를 참고하여 변형하시오.
   - **역할**: Accord(어코드) 조합 생성
   - **입력**: accord_type (e.g., "Fresh Floral"), available_ingredients
   - **출력**: 5-10개의 향료 조합, 각각 비율과 역할 포함
   - **예시**:
     ```
     당신은 전문 조향사입니다.
     요청: Fresh Floral 어코드
     사용 가능 원료: [Bergamot, Rose, Jasmine, ...]

     다음 형식으로 5개의 조합을 제안하세요:
     1. 조합명
     - Bergamot (30%): Top note, 상쾌함
     - Rose (50%): Heart note, 주향
     ...
     ```

2. **`GENERATE_FORMULA_PROMPT`**
   - **역할**: 완전한 Formula (향수 배합) 생성
   - **입력**: formula_type, target_audience, price_range
   - **출력**: Top/Middle/Base note가 균형잡힌 완제품 배합

3. **`IMPROVE_FORMULATION_PROMPT`**
   - **역할**: 기존 배합 개선
   - **입력**: 기존 배합, 개선 방향 (더 지속력, 더 저렴하게 등)
   - **출력**: 개선된 배합 + 변경 사유

4. **`REFERENCE_ANALYSIS_PROMPT`**
   - **역할**: 레퍼런스 향수 분석
   - **입력**: 향수 이름, 브랜드
   - **출력**: 예상 구성 노트, 비슷한 원료 추천

---

### research_prompts.py
**목적**: 시장 트렌드 및 소비자 인사이트 분석

**주요 프롬프트**:

1. **`MARKET_TREND_ANALYSIS_PROMPT`**
   - **역할**: 현재 향수 시장 트렌드 분석
   - **입력**: 타겟 시장 (한국, 글로벌 등), 연령대
   - **출력**: 인기 향 계열, 트렌드 키워드, 성장 카테고리

2. **`CONSUMER_INSIGHT_PROMPT`**
   - **역할**: 소비자 페르소나 분석
   - **입력**: 연령, 성별, 라이프스타일
   - **출력**: 선호 향, 구매 패턴, 민감 포인트

3. **`COMPETITOR_ANALYSIS_PROMPT`**
   - **역할**: 경쟁 제품 분석
   - **입력**: 경쟁사 향수 정보
   - **출력**: 차별화 포인트, 가격 전략, 포지셔닝

---

### strategy_prompts.py
**목적**: 제품 전략 및 포지셔닝 수립

**주요 프롬프트**:

1. **`POSITIONING_PROMPT`**
   - **역할**: 제품 포지셔닝 전략
   - **입력**: 배합 정보, 타겟 고객, 시장 트렌드
   - **출력**: 브랜드 메시지, 차별화 요소, 마케팅 앵글

2. **`PRICING_STRATEGY_PROMPT`**
   - **역할**: 가격 전략 수립
   - **입력**: 원가, 경쟁사 가격, 타겟 시장
   - **출력**: 권장 가격대, 마진 분석, 가격 정당화 근거

3. **`NAMING_SUGGESTION_PROMPT`**
   - **역할**: 제품명 제안
   - **입력**: 배합 특성, 타겟 고객, 브랜드 아이덴티티
   - **출력**: 10개의 네이밍 후보 + 설명

---

### validation_prompts.py
**목적**: 배합 검증 및 개선안 제시

**주요 프롬프트**:

1. **`IFRA_CHECK_PROMPT`**
   - **역할**: IFRA 규제 준수 여부 확인
   - **입력**: 배합 성분 및 비율
   - **출력**: 규제 위반 항목, 권장 수정 사항

2. **`BALANCE_CHECK_PROMPT`**
   - **역할**: Top/Middle/Base 노트 밸런스 체크
   - **입력**: 배합 구성
   - **출력**: 밸런스 점수, 조정 제안

3. **`ALTERNATIVE_SUGGESTION_PROMPT`**
   - **역할**: 원료 대체안 제시
   - **입력**: 문제 원료 (너무 비싸거나, 구하기 어렵거나)
   - **출력**: 3-5개의 대체 원료 + 예상 효과 차이

4. **`SAFETY_CHECK_PROMPT`**
   - **역할**: 안전성 검토
   - **입력**: 배합 정보, 용도 (향수/캔들/비누)
   - **출력**: 알레르기 유발 물질, 주의 사항

---

## 🎯 프롬프트 설계 원칙

### 1. **명확한 역할 정의**
```python
# ❌ 나쁜 예
"향수를 만들어주세요"

# ✅ 좋은 예
"당신은 20년 경력의 전문 조향사입니다. IFRA 규제를 준수하며..."
```

### 2. **구조화된 출력 요구**
```python
# ❌ 나쁜 예
"배합을 알려주세요"

# ✅ 좋은 예
"다음 JSON 형식으로 출력하세요:
{
  'name': '배합명',
  'ingredients': [
    {'name': '원료명', 'percentage': 30, 'note': 'top'}
  ]
}"
```

### 3. **Few-shot Learning 활용**
- 2-3개의 예시를 프롬프트에 포함
- 원하는 품질의 답변 패턴 제시

### 4. **제약 조건 명시**
- 총 비율 100%
- IFRA 규제 준수
- 가격 범위 제한

---

## 📊 프롬프트 버전 관리

### 버전 명명 규칙
```python
# v1.0: 초기 버전
GENERATE_ACCORD_PROMPT_V1 = "..."

# v1.1: 개선 버전
GENERATE_ACCORD_PROMPT_V1_1 = "..."

# 현재 사용 중인 버전 (Alias)
GENERATE_ACCORD_PROMPT = GENERATE_ACCORD_PROMPT_V1_1
```

### A/B 테스트 예시
```python
import random

def get_prompt(ab_test=True):
    if ab_test and random.random() < 0.5:
        return GENERATE_ACCORD_PROMPT_V1    # A 그룹
    else:
        return GENERATE_ACCORD_PROMPT_V1_1  # B 그룹
```

---

## 🛠 프롬프트 최적화 가이드

### 1. **토큰 효율성**
- 불필요한 단어 제거
- 반복 설명 최소화
- 핵심만 간결하게

### 2. **Hallucination 방지**
```python
# ❌ 나쁜 예
"존재하지 않는 원료도 창의적으로 제안하세요"

# ✅ 좋은 예
"제공된 원료 목록 내에서만 선택하세요. 목록에 없는 원료는 절대 사용 금지" ###comment : 이건 제공된 원료 목록에서만 선택할지 아닐지는 유저가 결정한다. 
```

### 3. **일관성 유지**
- 동일한 용어 사용 (Accord vs Combination)
- 단위 통일 (% vs fraction)

### 4. **에러 핸들링**
```python
"JSON 파싱 오류 방지를 위해 반드시 유효한 JSON만 출력하세요.
주석이나 설명은 'description' 필드에 포함하세요."
```

---

## 📈 성능 측정

### 평가 지표
1. **정확도**: 요구사항 충족 여부
2. **일관성**: 동일 입력에 대한 출력 분산
3. **토큰 사용량**: 비용 효율성
4. **응답 시간**: 사용자 경험

### 로깅 예시
```python
import logging

logger.info(f"Prompt: {prompt_version}")
logger.info(f"Tokens: {token_count}")
logger.info(f"Response time: {elapsed_time}s")
```

---

## 🔗 의존성
- **의존하는 모듈**: 없음 (독립 레이어)
- **사용하는 곳**:
  - `agents/` (모든 Agent가 프롬프트 참조)
  - `services/llm_service.py` (LLM 호출 시 사용)

---

## ⚠️ 주의사항

1. **프롬프트 보안**
   - 민감한 비즈니스 로직 노출 주의
   - 사용자 입력 sanitization 필수

2. **다국어 지원**
   - 한국어/영어 프롬프트 분리 관리
   - LLM 언어 성능 차이 고려

3. **모델별 최적화**
   - GPT-4, Claude, Gemini 별로 프롬프트 튜닝
   - 각 모델의 강점에 맞는 전략

---

## 📚 참고 자료
- [OpenAI Prompt Engineering Guide](https://platform.openai.com/docs/guides/prompt-engineering)
- [Anthropic Prompt Library](https://docs.anthropic.com/claude/prompt-library)
- [Google Gemini Best Practices](https://ai.google.dev/docs/prompt_best_practices)
