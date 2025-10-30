import asyncio
from fastapi import WebSocket
from utils.connection_manager import ConnectionManager

class DummyWebSocket:
    """Mock WebSocket object with send_json recorder."""
    def __init__(self):
        self.sent = []

    async def accept(self):
        self.accepted = True

    async def send_json(self, data):
        self.sent.append(data)


def test_connect_and_disconnect():
    manager = ConnectionManager()
    ws1, ws2 = DummyWebSocket(), DummyWebSocket()

    # Connect
    asyncio.run(manager.connect(ws1))
    asyncio.run(manager.connect(ws2))
    manager.active_connections = [
        {"ws": ws1, "user": "admin123", "cursor": None},
        {"ws": ws2, "user": "editor123", "cursor": None},
    ]

    # Update cursor
    manager.update_cursor(ws1, 5)
    assert manager.active_connections[0]["cursor"] == 5

    # Broadcast test
    msg = {"type": "ping"}
    asyncio.run(manager.broadcast(msg, sender=ws1))
    assert ws2.sent and ws2.sent[0] == msg
    assert ws1.sent == []  # sender excluded

    # Disconnect test
    manager.disconnect(ws1)
    assert len(manager.active_connections) == 1
