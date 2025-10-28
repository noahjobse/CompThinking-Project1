from fastapi import APIRouter, HTTPException
from models.schemas import LoginRequest
from utils.file_ops import read_json, write_json, add_activity
from utils.constants import USERS_PATH

router = APIRouter(prefix="/api/users", tags=["users"])

@router.get("/")
async def get_users():
    """Get all users."""
    try:
        data = read_json(USERS_PATH)
        return {"status": "success", "data": data.get("users", [])}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to read users: {str(e)}")
    
@router.post("/")
async def create_user():
    """Create a new user."""
    try:
        data = read_json(USERS_PATH)
        users = data.get("users", [])
        new_user = {
            "id": len(users) + 1,
            "username": f"user{len(users) + 1}",
            "password": "defaultpassword",
            "role": "Viewer",  # ✅ match schema literal
        }

        users.append(new_user)
        write_json(USERS_PATH, {"users": users})
        add_activity("system", "created user", new_user["username"])

        return {"status": "success", "data": new_user}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create user: {str(e)}")


@router.post("/login")
async def login(request: LoginRequest):
    """Authenticate user credentials and return role info."""
    try:
        data = read_json(USERS_PATH)
        users = data.get("users", [])

        for user in users:
            if user["username"] == request.username and user["password"] == request.password:
                add_activity(user["username"], "logged in")
                return {
                    "status": "success",
                    "data": {
                        "username": user["username"],
                        "role": user["role"]
                    }
                }

        raise HTTPException(status_code=401, detail="Invalid username or password")

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to log in: {str(e)}")
