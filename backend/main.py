from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from models.schemas import LoginRequest, ActivityRequest
from utils.constants import USERS_PATH, ACTIVITY_PATH, DATETIME_FMT
from utils.file_ops import read_json, write_json, add_activity
from routes.api import users
from pathlib import Path
import json
from datetime import datetime
from routes.api import activity
from utils.constants import USERS_PATH, ACTIVITY_PATH


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

app.include_router(users.router)
app.include_router(activity.router)

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
    data = read_json(ACTIVITY_PATH)
    logs = data.get("logs", [])
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    logs.append(f"{timestamp} — {message}")
    write_json(ACTIVITY_PATH, {"logs": logs})

# -----------------------------
# Seed default users (if empty)
# -----------------------------
if not USERS_PATH.exists():
    default_users = {
        "users": [
            {"id": 1, "username": "admin123", "password": "admin123", "role": "Admin"},
            {"id": 2, "username": "editor123", "password": "editor123", "role": "Editor"},
            {"id": 3, "username": "viewer123", "password": "viewer123", "role": "Viewer"},
        ]
    }
    write_json(USERS_PATH, default_users)
    write_json(ACTIVITY_PATH, {"logs": []})

# -----------------------------
# Routes
# -----------------------------
@app.get("/")
def root():
    return {"message": "FastAPI JSON backend running ✅"}

@app.post("/login")
def login(request: LoginRequest):
    """Authenticate user with username and password."""
    users = read_json(USERS_PATH).get("users", [])
    
    for user in users:
        if user["username"] == request.username and user["password"] == request.password:
            return {
                "username": user["username"],
                "role": user["role"]
            }
    
    raise HTTPException(status_code=401, detail="Invalid username or password")
