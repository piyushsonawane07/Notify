from fastapi import APIRouter

router = APIRouter(tags=["System"])


@router.get("/")
def index():
    return {"status": "Hi! Welcome to Notify"}


@router.get("/health")
def health():
    return {"status": "ok"}