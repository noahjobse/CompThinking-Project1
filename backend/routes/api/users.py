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
async def create_user(request: dict):
    """Create a new user (Admin-only)."""
    try:
        creator = request.get("creator")
        new_username = request.get("username")
        new_password = request.get("password")
        new_role = request.get("role", "Viewer")

        if not creator or not new_username or not new_password:
            raise HTTPException(status_code=400, detail="Missing required fields.")

        # Load all users
        data = read_json(USERS_PATH)
        users = data.get("users", [])

        # Verify creator is Admin
        creator_user = next((u for u in users if u["username"] == creator), None)
        if not creator_user or creator_user["role"] != "Admin":
            raise HTTPException(status_code=403, detail="Only Admins can create users.")

        # Check for duplicates
        if any(u["username"] == new_username for u in users):
            raise HTTPException(status_code=400, detail="Username already exists.")

        # Create the new user
        new_user = {
            "id": len(users) + 1,
            "username": new_username,
            "password": new_password,
            "role": new_role,
        }

        users.append(new_user)
        write_json(USERS_PATH, {"users": users})
        add_activity(creator, "created user", new_username)

        return {"status": "success", "data": new_user}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create user: {str(e)}")


@router.post("/login")
async def login(request: LoginRequest):
    """Authenticate a user and return role information."""
    try:
        data = read_json(USERS_PATH)
        users = data.get("users", [])

        for user in users:
            if user["username"] == request.username and user["password"] == request.password:
                add_activity(user["username"], "logged in")
                return {
                    "status": "success",
                    "data": {"username": user["username"], "role": user["role"]},
                }

        raise HTTPException(status_code=401, detail="Invalid username or password")

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to log in: {str(e)}")
