from fastapi import APIRouter
from .ingredients import router as ingredients_router
from .accords import router as accords_router
from .formulas import router as formulas_router
from .development import router as development_router

router = APIRouter()

router.include_router(ingredients_router, prefix="/ingredients", tags=["ingredients"])
router.include_router(accords_router, prefix="/accords", tags=["accords"])
router.include_router(formulas_router, prefix="/formulas", tags=["formulas"])
router.include_router(development_router, prefix="/development", tags=["development"]) 