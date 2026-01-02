# Validation Agents - 검증

## 📋 역할
생성된 배합의 **규제 준수**, **안전성**, **품질**을 자동으로 검증합니다.

## 📁 파일 구조
- **formulation_validator.py**: IFRA 규제, 노트 밸런스
- **safety_validator.py**: 안전성 검증
- **quality_validator.py**: 품질 기준 체크

## 🎯 주요 기능

### formulation_validator.py
**역할**: IFRA 규제 및 노트 밸런스 체크

**IFRA 규제 체크**:
- 각 원료의 최대 사용 가능 비율 확인
- 위반 시 자동으로 비율 조정 또는 대체 원료 제안

**노트 밸런스 체크**:
- Top: 20-30%
- Middle: 40-50%
- Base: 20-30%
- 편차가 크면 경고

---

### safety_validator.py
**역할**: 알레르기 유발 물질 확인

**체크 항목**:
- 알레르기 유발 가능 원료 (예: Oakmoss, Linalool)
- 민감성 피부용 제품에는 경고 표시

---

### quality_validator.py
**역할**: 품질 기준 체크

**체크 항목**:
- 지속력 예측 (Top note 비율 기반)
- 발향력 예측 (향 강도)
- 안정성 (화학적 반응 가능성)

---

## 📚 참고
- 프롬프트: `prompts/validation_prompts.py`
- DB 쿼리: `db/queries/ingredient_queries.py`
