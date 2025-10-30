from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from utils.constants import USERS_PATH, ACTIVITY_PATH
from utils.file_ops import write_json
from routes.api import activity, users, tasks, document
from utils.constants import USERS_PATH, ACTIVITY_PATH
from routes.ws import document_ws


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
app.include_router(tasks.router)
app.include_router(document.router)

app.include_router(document_ws.router)

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
