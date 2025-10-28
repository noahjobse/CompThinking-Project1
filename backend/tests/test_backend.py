import sys, os, json, copy
sys.path.append(os.path.dirname(os.path.dirname(__file__)))

from fastapi.testclient import TestClient
from main import app
from utils.file_ops import read_json, write_json

client = TestClient(app)

# ---------- Paths ----------
DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "data")
USERS_PATH = os.path.join(DATA_DIR, "users.json")
TASKS_PATH = os.path.join(DATA_DIR, "tasks.json")
DOC_PATH = os.path.join(DATA_DIR, "document.json")
ACT_PATH = os.path.join(DATA_DIR, "activity.json")


def load_json(path):
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


# ---------- Root ----------
def test_root_200():
    r = client.get("/")
    assert r.status_code == 200
    assert "FastAPI" in r.text or "backend" in r.text


# ---------- Users ----------
def test_get_users_list():
    r = client.get("/api/users/")
    assert r.status_code == 200
    assert "data" in r.json()


def test_create_user_success_admin():
    payload = {
        "creator": "admin123",
        "username": "pytest_user",
        "password": "pytest123",
        "role": "Viewer"
    }
    r = client.post("/api/users/", json=payload)
    assert r.status_code == 200
    data = r.json()["data"]
    assert data["username"] == "pytest_user"

    # cleanup to prevent duplicate user in next run
    users = read_json(USERS_PATH)
    users["users"] = [u for u in users["users"] if u["username"] != "pytest_user"]
    write_json(USERS_PATH, users)


def test_create_user_fail_non_admin():
    payload = {
        "creator": "viewer123",
        "username": "illegal_user",
        "password": "nope",
        "role": "Viewer"
    }
    r = client.post("/api/users/", json=payload)
    assert r.status_code == 403


def test_login_success_and_fail():
    # success case
    r = client.post("/api/users/login", json={"username": "admin123", "password": "admin123"})
    assert r.status_code == 200
    assert r.json()["data"]["role"] == "Admin"

    # invalid password
    r = client.post("/api/users/login", json={"username": "admin123", "password": "wrong"})
    assert r.status_code == 401


def test_logout_success():
    payload = {"username": "admin123"}
    r = client.post("/api/users/logout", json=payload)
    assert r.status_code == 200
    assert "logged out" in r.text


def test_logout_fail_missing_user():
    payload = {"username": "ghost_user"}
    r = client.post("/api/users/logout", json=payload)
    assert r.status_code == 404


# ---------- Document ----------
def test_get_document_success():
    r = client.get("/api/document/")
    assert r.status_code == 200
    data = r.json()["data"]
    assert "title" in data and "content" in data


def test_document_update_success_admin():
    payload = {
        "title": "Testing Doc",
        "content": "Admin updated content",
        "lastEditedBy": "admin123",
        "lastUpdated": ""
    }
    r = client.put("/api/document/", json=payload)
    assert r.status_code == 200
    assert "updated" in r.text


def test_document_update_success_editor():
    payload = {
        "title": "Testing Doc",
        "content": "Editor updated content",
        "lastEditedBy": "editor123",
        "lastUpdated": ""
    }
    r = client.put("/api/document/", json=payload)
    assert r.status_code == 200
    assert "updated" in r.text


def test_document_update_fail_viewer():
    payload = {
        "title": "Testing Doc",
        "content": "Viewer tried to edit",
        "lastEditedBy": "viewer123",
        "lastUpdated": ""
    }
    r = client.put("/api/document/", json=payload)
    assert r.status_code == 403


def test_document_update_missing_field():
    payload = {"title": "Doc Missing Fields"}
    r = client.put("/api/document/", json=payload)
    assert r.status_code == 422


def test_document_auto_timestamp_on_empty():
    payload = {
        "title": "Timestamp Doc",
        "content": "Checking auto timestamp",
        "lastEditedBy": "editor123",
        "lastUpdated": ""
    }
    r = client.put("/api/document/", json=payload)
    assert r.status_code == 200
    data = r.json()["data"]
    assert data["lastUpdated"] != ""


# ---------- Tasks ----------
def test_get_tasks_list():
    r = client.get("/api/tasks/")
    assert r.status_code == 200
    data = r.json()["data"]
    assert isinstance(data, list)


def test_task_crud_cycle():
    # Create
    payload = {"title": "Test Task", "assignedTo": "editor123", "status": "Pending"}
    r = client.post("/api/tasks/", json=payload)
    assert r.status_code == 200
    new_task = r.json()["data"]
    task_id = new_task["id"]

    # Update
    payload["status"] = "Done"
    r = client.put(f"/api/tasks/{task_id}", json=payload)
    assert r.status_code == 200
    updated = r.json()["data"]
    assert updated["status"] == "Done"

    # Delete
    r = client.delete(f"/api/tasks/{task_id}")
    assert r.status_code == 200
    assert "deleted" in r.json()["data"].lower()


# ---------- Tasks: Extended ----------
def test_task_create_admin_editor_success():
    for user in ["admin123", "editor123"]:
        payload = {"title": f"{user}-task", "assignedTo": user, "status": "Pending"}
        r = client.post("/api/tasks/", json=payload)
        assert r.status_code == 200
        data = r.json()["data"]
        assert data["title"] == f"{user}-task"
        assert data["assignedTo"] == user


def test_task_create_viewer_forbidden():
    payload = {"title": "viewer-task", "assignedTo": "viewer123", "status": "Pending"}
    r = client.post("/api/tasks/", json=payload)
    assert r.status_code == 403


def test_task_update_role_restriction():
    create = {"title": "rolecheck", "assignedTo": "editor123", "status": "Pending"}
    r = client.post("/api/tasks/", json=create)
    assert r.status_code == 200
    task_id = r.json()["data"]["id"]

    update = {"id": task_id, "title": "rolecheck", "assignedTo": "viewer123", "status": "Done"}
    r = client.put(f"/api/tasks/{task_id}", json=update)
    assert r.status_code == 403


def test_task_delete_role_restriction():
    create = {"title": "deletecheck", "assignedTo": "editor123", "status": "Pending"}
    r = client.post("/api/tasks/", json=create)
    assert r.status_code == 200
    task_id = r.json()["data"]["id"]

    data = read_json(TASKS_PATH)
    for t in data["tasks"]:
        if t["id"] == task_id:
            t["assignedTo"] = "viewer123"
    write_json(TASKS_PATH, data)

    r = client.delete(f"/api/tasks/{task_id}")
    assert r.status_code == 403


def test_task_invalid_payload_rejected():
    payload = {"assignedTo": "editor123"}
    r = client.post("/api/tasks/", json=payload)
    assert r.status_code == 422


# ---------- Activity ----------
def test_activity_limit_query():
    r = client.get("/api/activity/?limit=2")
    assert r.status_code == 200
    data = r.json()["data"]
    assert isinstance(data, list)
    assert len(data) <= 2


def test_create_activity_log():
    payload = {"user": "admin123", "action": "manual test", "details": "testing"}
    r = client.post("/api/activity/", json=payload)
    assert r.status_code == 200
    assert r.json()["data"]["action"] == "manual test"


# ---------- Integration Smoke ----------
def test_json_files_exist_and_valid():
    for path in [USERS_PATH, TASKS_PATH, DOC_PATH, ACT_PATH]:
        assert os.path.exists(path)
        data = load_json(path)
        assert isinstance(data, dict)
