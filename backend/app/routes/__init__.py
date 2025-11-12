from fastapi import APIRouter
from .ingredients import router as ingredients_router
from .formulations import router as formulations_router
from .development import router as development_router  

router = APIRouter()

router.include_router(ingredients_router, prefix="/ingredients", tags=["ingredients"])
router.include_router(formulations_router, prefix="/formulations", tags=["formulations"])
router.include_router(development_router, prefix="/development", tags=["development"]) 