"""
google.genai SDK로 gemini-flash-latest 테스트
"""
import sys
sys.path.insert(0, '/Users/minhye/myproject/fragrance/backend')

from google import genai
from app.schema.config import settings

def test_genai_sdk():
    print("=" * 80)
    print("🧪 Testing google.genai SDK with gemini-flash-latest")
    print("=" * 80)

    client = genai.Client(api_key=settings.GOOGLE_API_KEY)

    print("\n🔍 Testing gemini-flash-latest...\n")

    try:
        response = client.models.generate_content(
            model="gemini-flash-latest",
            contents=[{
                "role": "user",
                "parts": [{"text": "Say hello in one word"}]
            }]
        )
        print(f"✅ Success! Response: {response.text.strip()}")
        return True
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

if __name__ == "__main__":
    test_genai_sdk()
