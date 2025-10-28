from fastapi import APIRouter, HTTPException
from models.schemas import Task
from utils.file_ops import read_json, write_json, add_activity
from utils.constants import TASKS_PATH

router = APIRouter(prefix="/api/tasks", tags=["tasks"])

@router.get("/")
async def get_tasks():
    """Get all tasks."""
    data = read_json(TASKS_PATH)
    return data.get("tasks", [])

@router.post("/")
async def create_task(task: Task):
    """Create a new task."""
    data = read_json(TASKS_PATH)
    tasks = data.get("tasks", [])
    new_task = task.model_dump()
    new_task["id"] = len(tasks) + 1

    tasks.append(new_task)
    write_json(TASKS_PATH, {"tasks": tasks})

    add_activity(f"{new_task['assigned_to']} created a new task: {new_task['title'] }")
    return {"status": "success", "data": new_task}

@router.put("/{task_id}")
async def update_task(task_id: int, task: Task):
    """Update an existing task."""
    data = read_json(TASKS_PATH)
    tasks = data.get("tasks", [])
    
    for idx, existing_task in enumerate(tasks):
        if existing_task["id"] == task_id:
            updated_task = task.model_dump()
            updated_task["id"] = task_id
            tasks[idx] = updated_task
            write_json(TASKS_PATH, {"tasks": tasks})

            add_activity(f"Task {task_id} updated by {updated_task['assigned_to']}")
            return {"status": "success", "data": updated_task}
    
    raise HTTPException(status_code=404, detail="Task not found")

@router.delete("/{task_id}")
async def delete_task(task_id: int):
    """Delete a task."""
    data = read_json(TASKS_PATH)
    tasks = data.get("tasks", [])
    
    for idx, existing_task in enumerate(tasks):
        if existing_task["id"] == task_id:
            deleted_task = tasks.pop(idx)
            write_json(TASKS_PATH, {"tasks": tasks})

            add_activity(f"Task {task_id} deleted by {deleted_task['assigned_to']}")
            return {"status": "success", "data": f"Task {task_id} deleted"}
    
    raise HTTPException(status_code=404, detail="Task not found")