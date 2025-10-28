from typing import Optional, Literal, List
from pydantic import BaseModel

# Core Type Aliases
Role = Literal["Admin", "Editor", "Viewer"]
TaskStatus = Literal["Pending", "In Progress", "Done"]

# Entity Models
class User(BaseModel):
    """Represents a user account."""
    id: int
    username: str
    password: str
    role: Role

class Task(BaseModel):
    """Represents a single task entry."""
    id: int | None = None
    title: str
    assignedTo: str
    status: TaskStatus


class Document(BaseModel):
    """Represents a shared editable document."""
    title: str
    content: str
    lastEditedBy: str
    lastUpdated: str

class ActivityLog(BaseModel):
    """Represents a logged user action."""
    timestamp: str
    user: str
    action: str
    details: Optional[str] = None

# Payload Wrappers (for persisted JSON)
class UsersPayload(BaseModel):
    users: List[User]

class TasksPayload(BaseModel):
    tasks: List[Task]

class DocumentPayload(BaseModel):
    document: Document

class ActivityPayload(BaseModel):
    logs: List[ActivityLog]

# Request Models
class LoginRequest(BaseModel):
    username: str
    password: str

class ActivityRequest(BaseModel):
    user: str
    action: str
    details: Optional[str] = None

class CreateUserRequest(BaseModel):
    creator: str
    username: str
    password: str
    role: str = "Viewer"

class LogoutRequest(BaseModel):
    username: str
