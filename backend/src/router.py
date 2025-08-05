from fastapi import APIRouter
from .system.routes import router as system_router
from .controller.room_controller import router as room_router

api_router = APIRouter()

api_router.include_router(system_router)
api_router.include_router(room_router)





