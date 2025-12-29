# Development Mode API 테스트 가이드

## 1️⃣ 서버 실행

```bash
cd /Users/minhye/myproject/fragrance/backend
uvicorn app.main:app --reload
```

서버가 실행되면: `http://localhost:8000`

---

## 2️⃣ API 문서 확인

브라우저에서 열기:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

---

## 3️⃣ curl로 테스트

### 간단한 테스트:

```bash
curl -X POST "http://localhost:8000/api/development/chat" \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {
        "role": "user",
        "content": "30대 여성을 위한 프레시 플로럴 향수를 만들고 싶어요"
      }
    ]
  }'
```

---

## 4️⃣ 예상 동작 순서

서버 로그에서 다음과 같은 순서로 출력이 보여야 합니다:

```
[parse_request] User input: 30대 여성을 위한 프레시 플로럴 향수를 만들고 싶어요...

============================================================
[COORDINATOR] Iteration 1
============================================================
[COORDINATOR] Stage: initial
[COORDINATOR] Preferences collected: 0 items
[COORDINATOR] Suggested ingredients: 0
[COORDINATOR] Formulation exists: False
[COORDINATOR] Decision: gather
[COORDINATOR] Reasoning: Initial conversation - need to gather user preferences
============================================================

[gather_preferences] Extracting user preferences...
[gather_preferences] Extracted: {'target_audience': '30대 여성', 'scent_preference': 'Fresh Floral', ...}

============================================================
[COORDINATOR] Iteration 2
============================================================
[COORDINATOR] Stage: ingredient_suggestion
[COORDINATOR] Decision: search
...

[search_ingredients] Searching for suitable ingredients...

[COORDINATOR] Decision: formulation
...

[create_formulation] Creating formulation...
[create_formulation] Created: Fresh Floral Eau de Parfum
[create_formulation] Ingredients count: 8

[COORDINATOR] Decision: validation
...

[validate_formulation] Validating formulation...
[validate_formulation] VALID - All checks passed

[COORDINATOR] Decision: response
...

[generate_response] Generating AI response...
```

---

## 5️⃣ Postman으로 테스트 (선택)

### Request 설정:
- Method: `POST`
- URL: `http://localhost:8000/api/development/chat`
- Headers:
  - `Content-Type: application/json`
- Body (raw JSON):
```json
{
  "messages": [
    {
      "role": "user",
      "content": "30대 여성을 위한 프레시 플로럴 향수를 만들고 싶어요"
    }
  ]
}
```

---

## 6️⃣ 확인 포인트

✅ **성공 시 확인할 것**:
1. Coordinator가 여러 번 실행됨 (iteration_count 증가)
2. gather → search → formulation → validation → response 순서로 진행
3. 최종적으로 AI 응답 반환
4. 에러 없이 완료

❌ **실패 시 확인할 것**:
1. 데이터베이스 연결 확인
2. GOOGLE_API_KEY 환경 변수 설정 확인
3. 로그에서 에러 메시지 확인
