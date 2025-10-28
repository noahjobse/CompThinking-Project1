from fastapi import APIRouter, HTTPException
from models.schemas import Document
from utils.file_ops import read_json, write_json, add_activity
from utils.constants import DOCUMENTS_PATH

router = APIRouter(prefix="/api/documents", tags=["documents"])

@router.get("/")
async def get_documents():
    """Get all documents."""
    data = read_json(DOCUMENTS_PATH)
    document = data.get("documents")

    if not document:
        raise HTTPException(status_code=404, detail="No documents found.")  
    
    return {"status": "success", "data": document}

@router.put("/")
async def update_document(updated: Document):
    """Update the document content."""
    try:
        write_json(DOCUMENTS_PATH, {"documents": updated.model_dump()})
        add_activity("Document updated.")
        return {"status": "success", "data": updated}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update document: {str(e)}")