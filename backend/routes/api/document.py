from fastapi import APIRouter, HTTPException
from models.schemas import Document
from utils.file_ops import read_json, write_json, add_activity
from utils.constants import DOCUMENT_PATH
from utils.auth import require_role
from datetime import datetime
from utils.constants import DATETIME_FMT

router = APIRouter(prefix="/api/document", tags=["document"])


@router.get("/")
async def get_document():
    """Get the single document."""
    data = read_json(DOCUMENT_PATH)
    document = data.get("document")

    if not document:
        raise HTTPException(status_code=404, detail="No document found.")
    
    return {"status": "success", "data": document}


@router.put("/")
async def update_document(updated: Document):
    """Update the document content."""
    try:
        # Enforce Admin or Editor
        require_role(updated.lastEditedBy, {"Admin", "Editor"})

        # Auto-fill timestamp if missing
        if not updated.lastUpdated:
            updated.lastUpdated = datetime.now().strftime(DATETIME_FMT)

        write_json(DOCUMENT_PATH, {"document": updated.model_dump()})
        add_activity(updated.lastEditedBy, "updated document", updated.title)
        return {"status": "success", "data": updated}

    # Allow FastAPI errors (403, 404, etc.) to pass through
    except HTTPException:
        raise
    # Catch other unexpected errors
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update document: {str(e)}")
