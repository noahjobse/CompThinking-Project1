from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
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

@app.get("/users")
def get_users():
    """Return all users."""
    users = read_json(USERS_FILE).get("users", [])
    return users

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

