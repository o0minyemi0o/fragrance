"""
사용 가능한 Gemini 모델 확인
"""
import sys
sys.path.insert(0, '/Users/minhye/myproject/fragrance/backend')

from google import genai
from app.schema.config import settings

def test_models():
    print("=" * 80)
    print("🧪 Available Gemini Models Test")
    print("=" * 80)

    client = genai.Client(api_key=settings.GOOGLE_API_KEY)

    # 무료 티어에서 주로 사용되는 모델들
    models_to_test = [
        "gemini-2.0-flash-exp",  # 실험 버전
        "gemini-1.5-flash",       # 안정 버전
        "gemini-1.5-flash-8b",    # 경량 버전
        "gemini-1.5-pro",         # Pro 버전
    ]

    print("\n🔍 Testing models with simple prompt...\n")

    for model_name in models_to_test:
        try:
            print(f"Testing {model_name}...", end=" ")
            response = client.models.generate_content(
                model=model_name,
                contents=[{
                    "role": "user",
                    "parts": [{"text": "Say 'hello' in one word."}]
                }]
            )
            print(f"✅ Success! Response: {response.text.strip()}")
        except Exception as e:
            error_msg = str(e)
            if "429" in error_msg:
                print(f"❌ Quota exceeded")
            elif "404" in error_msg or "not found" in error_msg.lower():
                print(f"❌ Model not found")
            else:
                print(f"❌ Error: {error_msg[:100]}")

if __name__ == "__main__":
    test_models()
