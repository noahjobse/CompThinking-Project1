from fastapi import APIRouter, HTTPException
from utils.file_ops import read_json, write_json, add_activity
from utils.constants import USERS_PATH

router = APIRouter(prefix="/api/users", tags=["users"])

@router.get("/")
async def get_users():
    """Get all users."""
    data = read_json(USERS_PATH)
    return {"status": "success", "data": data.get("users", [])}

@router.post("/")
async def create_user():
    """Create a new user."""
    data = read_json(USERS_PATH)
    users = data.get("users", [])
    new_user = {
        "id": len(users) + 1,
        "name": f"User {len(users) + 1}",
        "password": "defaultpassword",
        "role": "user"
    }

    users.append(new_user)
    write_json(USERS_PATH, {"users": users})
    add_activity(f"Created new user: {new_user['name']}")
    return {"status": "success", "data": new_user}