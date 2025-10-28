from __future__ import annotations
from pathlib import Path
import json
import threading
from datetime import datetime
from typing import Any, Dict
from utils.constants import ACTIVITY_PATH, DATETIME_FMT

DATA_DIR = Path(__file__).resolve().parents[1] / "data"
DATA_DIR.mkdir(parents=True, exist_ok=True)

_LOCK = threading.Lock()

def _ensure_file(path, default_payload):
    path = Path(path)
    path.parent.mkdir(parents=True, exist_ok=True)
    if not path.exists():
        with open(path, "w", encoding="utf-8") as f:
            json.dump(default_payload, f, indent=2)


def read_json(path):
    path = Path(path)
    _ensure_file(path, {})
    with _LOCK:
        try:
            with path.open("r", encoding="utf-8") as f:
                return json.load(f)
        except json.JSONDecodeError:
            return {}


from pathlib import Path
import json
import threading
from typing import Any, Dict

_LOCK = threading.Lock()

def write_json(path: Path | str, data: Dict[str, Any]) -> None:
    """Thread-safe write with atomic replace."""
    path = Path(path)
    path.parent.mkdir(parents=True, exist_ok=True)
    tmp = path.with_suffix(path.suffix + ".tmp")
    with _LOCK:
        with tmp.open("w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        tmp.replace(path)


def add_activity(user: str, action: str, details: str | None = None) -> None:
    """Log an activity entry."""
    _ensure_file(ACTIVITY_PATH, {"logs": []})
    now = datetime.now().strftime(DATETIME_FMT)
    data = read_json(ACTIVITY_PATH)
    data.setdefault("logs", []).append({
        "timestamp": now,
        "user": user,
        "action": action,
        "details": details,
    })
    write_json(ACTIVITY_PATH, data)
