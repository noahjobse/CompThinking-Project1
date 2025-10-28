from fastapi import APIRouter
from models.schemas import ActivityRequest
from utils.file_ops import read_json, add_activity
from utils.constants import ACTIVITY_PATH
from datetime import datetime

router = APIRouter(prefix="/api/activity", tags=["activity"])

@router.get("/")
async def get_activity():
    """Get all activity logs."""
    data = read_json(ACTIVITY_PATH)
    return {"status": "success", "data": data.get("logs", [])}


@router.post("/")
async def create_activity(request: ActivityRequest):
    """Log a new activity."""
    add_activity(f"{request.user} {request.action}")
    return {"status": "success", "data": {"user": request.user, "action": request.action}}
