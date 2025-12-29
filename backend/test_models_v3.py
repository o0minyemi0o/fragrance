"""
새로운 모델들 테스트
"""
import sys
sys.path.insert(0, '/Users/minhye/myproject/fragrance/backend')

import google.generativeai as genai
from app.schema.config import settings

def test_models():
    print("=" * 80)
    print("🧪 Testing New Gemini Models")
    print("=" * 80)

    genai.configure(api_key=settings.GOOGLE_API_KEY)

    # 사용 가능한 최신 모델들
    models_to_test = [
        "gemini-flash-latest",
        "gemini-pro-latest",
        "gemini-2.5-flash",
        "gemini-2.0-flash",
        "gemini-2.5-flash-lite",
    ]

    print("\n🔍 Testing models with simple prompt:\n")

    for model_name in models_to_test:
        try:
            print(f"Testing {model_name}...", end=" ")
            model = genai.GenerativeModel(model_name)
            response = model.generate_content("Say hello in one word")
            print(f"✅ Success! Response: {response.text.strip()}")
            break  # 성공하면 중단
        except Exception as e:
            error_msg = str(e)
            if "429" in error_msg or "quota" in error_msg.lower():
                print(f"❌ Quota exceeded")
            elif "404" in error_msg or "not found" in error_msg.lower():
                print(f"❌ Model not found")
            else:
                print(f"❌ Error: {error_msg[:100]}")

if __name__ == "__main__":
    test_models()
