from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import recommendations, regulations
from app.routes import database_test
from app.config import settings

app = FastAPI(
    title="Fragrance Formulation API",
    description="AI-powered fragrance formulation recommendation system",
    version="0.1.0"
)

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React 개발 서버
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 라우터 등록
app.include_router(recommendations.router)
app.include_router(regulations.router)
app.include_router(database_test.router)


@app.get("/health")
async def health_check():
    """헬스 체크"""
    return {"status": "ok", "environment": settings.ENV}

@app.get("/")
async def root():
    """루트 엔드포인트"""
    return {
        "message": "Fragrance Formulation API",
        "version": "0.1.0",
        "docs": "/docs"
    }

