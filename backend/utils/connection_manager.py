from fastapi import WebSocket
from typing import Dict, List, Any

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[Dict[str, Any]] = []

    async def connect(self, websocket: WebSocket):
        """Accept a new WebSocket connection"""
        await websocket.accept()

    def disconnect(self, websocket: WebSocket):
        """Remove a disconnected WebSocket from the active list"""
        self.active_connections = [
            conn for conn in self.active_connections if conn["ws"] != websocket
        ]

    async def broadcast(self, message: dict, sender: WebSocket | None = None):
        """Broadcast a message to all connected WebSockets except the sender"""
        for connection in self.active_connections:
            ws = connection["ws"]
            if connection["ws"] != sender:
                await connection["ws"].send_json(message)

    def update_cursor(self, websocket: WebSocket, position: int):
        """Update the cursor position for a specific user"""
        for connection in self.active_connections:
            if connection["ws"] == websocket:
                connection["cursor"] = position
                break

    def get_presence(self) -> List[Dict]:
        """Get the list of active users and their cursor positions"""
        return [
            {"username": conn["username"], "cursor": conn.get("cursor", None)}
            for conn in self.active_connections
        ]
    
# Shared global instance for all WebSocket routes
manager = ConnectionManager()
