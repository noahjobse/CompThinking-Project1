from fastapi import HTTPException
from utils.file_ops import read_json
from utils.constants import USERS_PATH

def require_role(username: str, allowed_roles: set[str]) -> None:
    """
    Ensure `username` exists and their role is in `allowed_roles`.
    - Raises 401 if user not found
    - Raises 403 if role not permitted
    """
    data = read_json(USERS_PATH)
    users = data.get("users", [])
    user = next((u for u in users if u.get("username") == username), None)

    if not user:
        raise HTTPException(status_code=401, detail="User not found or not authenticated.")

    role = user.get("role")
    if role not in allowed_roles:
        raise HTTPException(status_code=403, detail=f"Insufficient role: {role}. Required: {', '.join(sorted(allowed_roles))}.")
