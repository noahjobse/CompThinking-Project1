from fastapi import APIRouter, HTTPException
from models.schemas import ActivityRequest
from utils.file_ops import read_json, add_activity
from utils.constants import ACTIVITY_PATH

router = APIRouter(prefix="/api/activity", tags=["activity"])

@router.get("/")
async def get_activity():
    """Get all activity logs."""
    try: 
        data = read_json(ACTIVITY_PATH)
        return {"status": "success", "data": data.get("logs", [])}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to read activity logs: {str(e)}")

@router.post("/")
async def create_activity(request: ActivityRequest):
    """Log a new activity."""
    try:
        add_activity(request.user, request.action)
        return {"status": "success", "data": {"user": request.user, "action": request.action}}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to log activity: {str(e)}")