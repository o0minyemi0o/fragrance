from google import genai

# 환경변수에 API 키가 설정되어 있다면 명시적 인자 생략 가능
client = genai.Client(api_key="AIzaSyBxfasGObbhCMm5QZzw_bc3oeX0S7Ti6Xw")

response = client.models.generate_content(
    model="gemini-2.0-flash",
    contents="테스트 메세지"
)

print(response.text)