"""
간단한 LLM 호출 테스트
"""
import sys
sys.path.insert(0, '/Users/minhye/myproject/fragrance/backend')

from google import genai
from app.schema.config import settings

def test_llm():
    print("=" * 80)
    print("🧪 LLM Direct Call Test")
    print("=" * 80)

    # API 키 확인
    api_key = settings.GOOGLE_API_KEY
    print(f"\n📌 API Key exists: {bool(api_key)}")
    if api_key:
        print(f"📌 API Key (first 10 chars): {api_key[:10]}...")
    else:
        print("❌ No API key found!")
        return

    # Client 초기화
    try:
        client = genai.Client(api_key=api_key)
        print("✅ Client initialized successfully")
    except Exception as e:
        print(f"❌ Failed to initialize client: {e}")
        return

    # 간단한 LLM 호출
    print("\n🚀 Calling LLM with simple prompt...")

    try:
        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=[{
                "role": "user",
                "parts": [{"text": "Say hello in one sentence."}]
            }]
        )

        print("✅ LLM call successful!")
        print(f"\n💬 Response: {response.text}")

    except Exception as e:
        print(f"❌ LLM call failed: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_llm()
