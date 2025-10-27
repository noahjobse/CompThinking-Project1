from typing import Optional, Literal, List
from pydantic import BaseModel

Role = Literal["Admin", "Editor", "Viewer"]

class User(BaseModel):
    id: int
    username: str
    password: str
    role: Role

class Task(BaseModel):
    id: int
    title: str
    assignedTo: str
    status: Literal["Pending", "In Progress", "Done"]

class Document(BaseModel):
    title: str
    content: str
    lastEditedBy: str
    lastUpdated: str

class ActivityLog(BaseModel):
    timestamp: str
    user: str
    action: str
    details: Optional[str] = None

class UsersPayload(BaseModel):
    users: List[User]

class TasksPayload(BaseModel):
    tasks: List[Task]

class DocumentPayload(BaseModel):
    document: Document

class ActivityPayload(BaseModel):
    logs: List[ActivityLog]

class LoginRequest(BaseModel):
    username: str
    password: str

class ActivityRequest(BaseModel):
    user: str
    action: str