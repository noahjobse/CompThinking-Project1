from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from utils.connection_manager import manager
from utils.file_ops import read_json, write_json, add_activity
from utils.constants import DOCUMENT_PATH, DATETIME_FMT
from datetime import datetime

router = APIRouter()

@router.websocket("/ws/document")
async def document_websocket(websocket: WebSocket):
    await manager.connect(websocket)
    username = websocket.query_params.get("user", "unknown")

    manager.active_connections.append({
        "ws": websocket,
        "user": username,
        "cursor": None
    })

    add_activity(username, "joined document")

    doc_data = read_json(DOCUMENT_PATH)
    await websocket.send_json({
        "type": "init",
        "data": {
            "document": doc_data.get("document", {}),
            "users": manager.get_presence()
        }
    })
    print("[WS INIT] sent to", username)


    await manager.broadcast({
        "type": "presence",
        "data": manager.get_presence()
    }, sender=websocket)

    try:
        while True:
            msg = await websocket.receive_json()

            if msg["type"] == "update":
                new_doc = msg["data"]
                new_doc["lastEditedBy"] = username
                new_doc["lastUpdated"] = datetime.now().strftime(DATETIME_FMT)
                write_json(DOCUMENT_PATH, {"document": new_doc})
                add_activity(username, "edited document")

                await manager.broadcast({
                    "type": "update",
                    "data": new_doc
                }, sender=websocket)

            elif msg["type"] == "cursor":
                position = msg["data"].get("position")
                manager.update_cursor(websocket, position)
                await manager.broadcast({
                    "type": "presence",
                    "data": manager.get_presence()
                }, sender=websocket)
                
    except WebSocketDisconnect:
        manager.disconnect(websocket)
        add_activity(username, "left document")
