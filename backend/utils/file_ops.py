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

def _ensure_file(path: Path, default_payload: Dict[str, Any]) -> None:
    """Create file if missing."""
    path.parent.mkdir(parents=True, exist_ok=True)
    if not path.exists():
        write_json(path, default_payload)

def read_json(path: Path) -> Dict[str, Any]:
    """Thread-safe read."""
    _ensure_file(path, {})
    with _LOCK:
        with path.open("r", encoding="utf-8") as f:
            return json.load(f)

def write_json(path: Path, data: Dict[str, Any]) -> None:
    """Thread-safe write with atomic replace."""
    path.parent.mkdir(parents=True, exist_ok=True)
    tmp = path.with_suffix(path.suffix + ".tmp")
    with _LOCK:
        with tmp.open("w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        tmp.replace(path)

def add_activity(user: str, action: str, details: str | None = None) -> None:
    """Log an activity entry."""
    log_path = ACTIVITY_PATH
    _ensure_file(log_path, {"logs": []})
    now = datetime.now().strftime(DATETIME_FMT)
    data = read_json(log_path)
    data.setdefault("logs", []).append({
        "timestamp": now,
        "user": user,
        "action": action,
        "details": details
    })
    write_json(log_path, data)
