from pathlib import Path

BACKEND_ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = BACKEND_ROOT / "data"
DATA_DIR.mkdir(parents=True, exist_ok=True)

USERS_PATH = DATA_DIR / "users.json"
TASKS_PATH = DATA_DIR / "tasks.json"
DOCUMENT_PATH = DATA_DIR / "document.json"
ACTIVITY_PATH = DATA_DIR / "activity.json"

ROLES = ["Admin", "Editor", "Viewer"]
DATETIME_FMT = "%Y-%m-%d %H:%M:%S"