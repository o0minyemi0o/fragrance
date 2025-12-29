"""
google.generativeai SDK로 모델 테스트
"""
import sys
sys.path.insert(0, '/Users/minhye/myproject/fragrance/backend')

import google.generativeai as genai
from app.schema.config import settings

def test_models():
    print("=" * 80)
    print("🧪 Available Gemini Models Test (google.generativeai)")
    print("=" * 80)

    genai.configure(api_key=settings.GOOGLE_API_KEY)

    # 사용 가능한 모델 목록 가져오기
    print("\n📋 Listing all available models:\n")
    try:
        models = genai.list_models()
        for model in models:
            if 'generateContent' in model.supported_generation_methods:
                print(f"  - {model.name}")
    except Exception as e:
        print(f"❌ Error listing models: {e}")

    # 무료 티어 모델 테스트
    models_to_test = [
        "gemini-2.0-flash-exp",
        "gemini-1.5-flash",
        "gemini-1.5-flash-latest",
        "gemini-pro",
    ]

    print("\n🔍 Testing models with simple prompt:\n")

    for model_name in models_to_test:
        try:
            print(f"Testing {model_name}...", end=" ")
            model = genai.GenerativeModel(model_name)
            response = model.generate_content("Say hello in one word")
            print(f"✅ Success! Response: {response.text.strip()}")
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
