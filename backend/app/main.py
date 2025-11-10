from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import regulations, database_test, formulations, ingredients, development
from app.config import settings
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
app.include_router(regulations.router)
app.include_router(database_test.router)
app.include_router(development.router)

@app.get("/health")
async def health_check():
    return {"status": "ok", "version": "0.2.0"}

@app.get("/")
async def root():
    return {
        "message": "Fragrance Formulation API",
        "version": "0.2.0",
        "endpoints": {
            "accord_generate": "POST /api/formulations/accord/generate",
            "accord_save": "POST /api/formulations/accord/save",
            "formula_generate": "POST /api/formulations/formula/generate",
            "formula_save": "POST /api/formulations/formula/save",
            "accords_list": "GET /api/formulations/accords",
            "formulas_list": "GET /api/formulations/formulas",
            "development_chat": "POST /api/development/chat"
        }
    }
