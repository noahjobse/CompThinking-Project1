from fastapi import APIRouter
from models.schemas import ActivityRequest
from utils.file_ops import read_json, add_activity
from utils.constants import ACTIVITY_PATH
from datetime import datetime

router = APIRouter(prefix="/api/activity", tags=["activity"])

@router.get("")
def get_activity():
    """Get all activity logs."""
    data = read_json(ACTIVITY_PATH)
    return data

@router.post("")
def log_activity(request: ActivityRequest):
    """Log user activity."""
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    add_activity(f"{request.user} {request.action}")
    return {"status": "Activity logged ✅"}
