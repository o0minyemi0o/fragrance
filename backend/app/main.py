from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import formulations, ingredients, development
from app.schema.config import settings
import logging

logging.basicConfig(level=logging.INFO)

app = FastAPI(
    title="Fragrance Formulation API",
    version="0.2.0",
    description="AI-powered fragrance accord & formula generator"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(formulations.router)
app.include_router(ingredients.router) 
app.include_router(development.router)

@app.get("/health")
async def health_check():
    return {"status": "ok", "version": "0.2.0"}

@app.get("/")
async def root():
    return {
        "message": "Fragrance Formulation API",
        "version": "0.2.0"
    }
