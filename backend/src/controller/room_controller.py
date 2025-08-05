# backend/src/main.py
from fastapi import WebSocket, WebSocketDisconnect, Request, Query, APIRouter
from uuid import uuid4
from typing import Dict, List
import random
from fastapi import HTTPException
import loguru

logger = loguru.logger
router = APIRouter(tags=["Room"])

# Data storage
rooms: Dict[str, List[dict]] = {}  # Room ID -> List of users
pins_data: Dict[str, List[dict]] = {}  # Room ID -> List of pins
active_edits: Dict[str, str] = {}  # pin_id -> username who is editing


@router.post("/api/rooms")
async def create_room(request: Request):
    logger.info("Creating room")
    data = await request.json()
    username = data.get("username", f"User-{random.randint(1000, 9999)}")
    room_id = str(uuid4())
    rooms[room_id] = []
    pins_data[room_id] = []
    logger.info(f"Room created: {room_id}")
    return {"room_id": room_id, "username": username}

@router.get("/api/rooms/{room_id}/users")
async def get_active_users(room_id: str):
    if room_id not in rooms:
        raise HTTPException(status_code=404, detail="Room not found")
    
    users = [
        {
            "id": user["id"],
            "username": user["username"],
            "color": user["color"],
            "cursor": user.get("cursor", {"x": 0, "y": 0})
        }
        for user in rooms[room_id]
    ]
    return {"room_id": room_id, "users": users}

@router.websocket("/ws/{room_id}")
async def websocket_endpoint(websocket: WebSocket, room_id: str, username: str = Query(...)):
    await websocket.accept()
    
    def random_color():
        return "#{:06x}".format(random.randint(0, 0xFFFFFF))
    
    if room_id not in rooms:
        await websocket.send_json({"type": "error", "message": "Room not found"})
        await websocket.close()
        return
    
    user_id = str(uuid4())
    color = random_color()
    
    user_entry = {
        "id": user_id,
        "username": username,
        "socket": websocket,
        "color": color,
        "cursor": {"x": 0, "y": 0}
    }
    
    rooms[room_id].append(user_entry)
    
    # Send initial state to the new user
    await websocket.send_json({
        "type": "init",
        "user": {"id": user_id, "username": username, "color": color},
        "pins": pins_data.get(room_id, []),
        "users": [user_info(u) for u in rooms[room_id] if u["id"] != user_id]
    })
    
    # Notify others about the new user
    await broadcast(room_id, {
        "type": "user_joined",
        "user": user_info(user_entry)
    }, exclude_user_id=user_id)
    
    try:
        while True:
            data = await websocket.receive_json()
            action = data.get("action")
            
            if action == "pin_create":
                pin = {
                    "id": str(uuid4()),
                    "x": data["x"],
                    "y": data["y"],
                    "text": data.get("text", "New Note"),
                    "created_by": user_id,
                    "color": color
                }
                pins_data[room_id].append(pin)
                await broadcast(room_id, {
                    "type": "pin_created",
                    "pin": pin
                })
                
            elif action == "pin_update":
                for pin in pins_data[room_id]:
                    if pin["id"] == data["id"]:
                        if "x" in data:
                            pin["x"] = data["x"]
                        if "y" in data:
                            pin["y"] = data["y"]
                        if "text" in data:
                            pin["text"] = data["text"]
                            active_edits.pop(data["id"], None)  # Clear edit lock
                        break
                
                await broadcast(room_id, {
                    "type": "pin_updated",
                    "pin": next((p for p in pins_data[room_id] if p["id"] == data["id"]), None)
                })
                
            elif action == "pin_delete":
                pins_data[room_id] = [p for p in pins_data[room_id] if p["id"] != data["id"]]
                active_edits.pop(data["id"], None)
                await broadcast(room_id, {
                    "type": "pin_deleted",
                    "pin_id": data["id"]
                })
                
            elif action == "cursor_move":
                for user in rooms[room_id]:
                    if user["id"] == user_id:
                        user["cursor"] = {"x": data["x"], "y": data["y"]}
                        break
                
                await broadcast(room_id, {
                    "type": "cursor_moved",
                    "user_id": user_id,
                    "cursor": {"x": data["x"], "y": data["y"]}
                }, exclude_user_id=user_id)
                
            elif action == "start_edit":
                pin_id = data["pin_id"]
                if pin_id not in active_edits:
                    active_edits[pin_id] = user_id
                    await broadcast(room_id, {
                        "type": "edit_started",
                        "pin_id": pin_id,
                        "user_id": user_id
                    })
                
    except WebSocketDisconnect:
        # Remove user from room
        rooms[room_id] = [u for u in rooms[room_id] if u["id"] != user_id]
        
        # Release any edit locks
        for pin_id, editor_id in list(active_edits.items()):
            if editor_id == user_id:
                del active_edits[pin_id]
        
        # Notify others
        res = await broadcast(room_id, {
            "type": "user_left",
            "user_id": user_id
        })
        if not res:
            raise HTTPException(status_code=404, detail="Room not found !")

async def broadcast(room_id: str, message: dict, exclude_user_id: str = None):
    if room_id not in rooms:
        return False
        
    for user in rooms[room_id]:
        if exclude_user_id and user["id"] == exclude_user_id:
            continue
        try:
            await user["socket"].send_json(message)
        except:
            pass

    return True

def user_info(user: dict) -> dict:
    return {
        "id": user["id"],
        "username": user["username"],
        "color": user["color"],
        "cursor": user.get("cursor", {"x": 0, "y": 0})
    }

