from fastapi import APIRouter, UploadFile, File, HTTPException
import shutil
import os
import uuid
from pathlib import Path

router = APIRouter()

UPLOAD_DIR = Path("app/static_uploads")
UPLOAD_HERO_DIR = UPLOAD_DIR / "hero"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
UPLOAD_HERO_DIR.mkdir(parents=True, exist_ok=True)

@router.get("/hero")
async def list_hero_images():
    try:
        if not UPLOAD_HERO_DIR.exists():
            return []
        
        # List all files with image extensions
        images = []
        for file in UPLOAD_HERO_DIR.iterdir():
            if file.is_file() and file.suffix.lower() in [".jpg", ".jpeg", ".png", ".webp", ".gif"]:
                images.append(file.name)
        
        return sorted(images)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("")
async def upload_image(file: UploadFile = File(...)):
    try:
        # Validate file type
        # Allow images and we can be explicit about extensions if needed
        # But for now, accept image/*
        if not file.content_type.startswith("image/"):
            raise HTTPException(status_code=400, detail="File must be an image")
            
        # Generate unique filename
        file_ext = os.path.splitext(file.filename)[1]
        filename = f"{uuid.uuid4()}{file_ext}"
        file_path = UPLOAD_DIR / filename
        
        # Save file
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        # Return public URL prefixed with /api/static so HAProxy routes it to backend
        # Note: Backend sees /static, but HAProxy strips /api.
        # So we want the URL to be /api/static/filename
        # And backend to mount /static -> app/static_uploads
        return {"url": f"/api/static/{filename}"}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
