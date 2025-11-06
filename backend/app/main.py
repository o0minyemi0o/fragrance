from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import recommendations, regulations, database_test, formulations
from app.config import settings
import logging

logging.basicConfig(level=logging.INFO)

app = FastAPI(
    title="Fragrance Formulation API",
    version="0.2.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 라우터
app.include_router(recommendations.router)
app.include_router(regulations.router)
app.include_router(database_test.router)
app.include_router(formulations.router) 

@app.get("/health")
async def health_check():
    return {"status": "ok", "version": "0.2.0"}
