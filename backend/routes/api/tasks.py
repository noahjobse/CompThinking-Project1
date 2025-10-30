from fastapi import APIRouter, HTTPException
from models.schemas import Task
from utils.file_ops import read_json, write_json, add_activity
from utils.constants import TASKS_PATH
from utils.auth import require_role


router = APIRouter(prefix="/api/tasks", tags=["tasks"])


@router.get("/")
async def get_tasks():
    """Get all tasks."""
    data = read_json(TASKS_PATH)
    return {"status": "success", "data": data.get("tasks", [])}


@router.post("/")
async def create_task(task: Task):
    """Create a new task."""
    require_role(task.assignedTo, {"Admin", "Editor"})

    data = read_json(TASKS_PATH)
    tasks = data.get("tasks", [])
    new_task = task.model_dump()
    new_task["id"] = max([t["id"] for t in tasks], default=0) + 1

    tasks.append(new_task)
    write_json(TASKS_PATH, {"tasks": tasks})

    add_activity(new_task["assignedTo"], "created task", new_task["title"])
    return {"status": "success", "data": new_task}


@router.put("/{task_id}")
async def update_task(task_id: int, task: Task):
    """Update an existing task."""
    require_role(task.assignedTo, {"Admin", "Editor"})

    data = read_json(TASKS_PATH)
    tasks = data.get("tasks", [])
    
    for idx, existing_task in enumerate(tasks):
        if existing_task["id"] == task_id:
            updated_task = task.model_dump()
            updated_task["id"] = task_id
            tasks[idx] = updated_task
            write_json(TASKS_PATH, {"tasks": tasks})

            add_activity(updated_task["assignedTo"], "updated task", updated_task["title"])
            return {"status": "success", "data": updated_task}
    
    raise HTTPException(status_code=404, detail="Task not found")


@router.delete("/{task_id}")
async def delete_task(task_id: int):
    """Delete a task."""
    data = read_json(TASKS_PATH)
    tasks = data.get("tasks", [])
    
    for idx, existing_task in enumerate(tasks):
        if existing_task["id"] == task_id:
            require_role(existing_task["assignedTo"], {"Admin", "Editor"})

            deleted_task = tasks.pop(idx)
            write_json(TASKS_PATH, {"tasks": tasks})

            add_activity(deleted_task["assignedTo"], "deleted task", deleted_task["title"])
            return {"status": "success", "data": f"Task {task_id} deleted"}
    
    raise HTTPException(status_code=404, detail="Task not found")
