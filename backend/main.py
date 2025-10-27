from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from models.schemas import LoginRequest, ActivityRequest
from utils.constants import USERS_PATH, ACTIVITY_PATH, DATETIME_FMT
from utils.file_ops import read_json, write_json, add_activity
from routes.api import users
from pathlib import Path
import json
from datetime import datetime


# -----------------------------
# Setup
# -----------------------------
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Update to specific domain later
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(users.router, prefix="/api")


# -----------------------------
# File paths
# -----------------------------
DATA_DIR = Path(__file__).parent / "data"
DATA_DIR.mkdir(exist_ok=True)

USERS_FILE = DATA_DIR / "users.json"
ACTIVITY_FILE = DATA_DIR / "activity.json"

# -----------------------------
# Helper functions
# -----------------------------
def read_json(path: Path):
    if not path.exists():
        return {}
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)

def write_json(path: Path, data):
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)

def add_activity(message: str):
    data = read_json(ACTIVITY_FILE)
    logs = data.get("logs", [])
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    logs.append(f"{timestamp} — {message}")
    write_json(ACTIVITY_FILE, {"logs": logs})

# -----------------------------
# Seed default users (if empty)
# -----------------------------
if not USERS_FILE.exists():
    default_users = {
        "users": [
            {"id": 1, "username": "admin123", "password": "admin123", "role": "Admin"},
            {"id": 2, "username": "editor123", "password": "editor123", "role": "Editor"},
            {"id": 3, "username": "viewer123", "password": "viewer123", "role": "Viewer"},
        ]
    }
    write_json(USERS_FILE, default_users)
    write_json(ACTIVITY_FILE, {"logs": []})

# -----------------------------
# Routes
# -----------------------------
@app.get("/")
def root():
    return {"message": "FastAPI JSON backend running ✅"}

@app.post("/login")
def login(request: LoginRequest):
    """Authenticate user with username and password."""
    users = read_json(USERS_FILE).get("users", [])
    
    for user in users:
        if user["username"] == request.username and user["password"] == request.password:
            return {
                "username": user["username"],
                "role": user["role"]
            }
    
    raise HTTPException(status_code=401, detail="Invalid username or password")

@app.get("/api/activity")
def get_activity():
    """Get all activity logs."""
    data = read_json(ACTIVITY_FILE)
    return data

@app.post("/api/activity")
def log_activity(request: ActivityRequest):
    """Log user activity."""
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    add_activity(f"{request.user} {request.action}")
    return {"status": "Activity logged ✅"}

@app.post("/admin/users")
def admin_insert_user():
    """Add a user locally (Admin only placeholder)."""
    data = read_json(USERS_FILE)
    users = data.get("users", [])
    new_user = {"id": len(users) + 1, "username": f"user{len(users)+1}", "password": "1234", "role": "Viewer"}
    users.append(new_user)
    write_json(USERS_FILE, {"users": users})
    add_activity(f"admin123 created new user {new_user['username']}")
    return {"status": "User added ✅", "data": new_user}
