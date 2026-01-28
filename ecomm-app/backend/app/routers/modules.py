from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List
from app.models import Tenant, User, Module
from app.dependencies import get_current_user

router = APIRouter()

from beanie.operators import In

class ActivateModulesRequest(BaseModel):
    modules: List[str]  # List of module IDs to activate

class ModuleResponse(BaseModel):
    id: str
    name: str
    description: str
    price: float
    features: List[str]

@router.get("/", response_model=dict)
async def list_modules():
    """List all available modules with pricing and features"""
    modules_db = await Module.find(Module.is_active == True).to_list()
    
    # Map module_id to id for frontend compatibility
    modules_list = []
    for m in modules_db:
        modules_list.append({
            "id": m.module_id,
            "name": m.name,
            "description": m.description,
            "price": m.price,
            "features": m.features
        })
        
    return {"modules": modules_list}

@router.post("/activate")
async def activate_modules(
    req: ActivateModulesRequest,
    user: User = Depends(get_current_user)
):
    """Activate selected modules for the user's tenant"""
    # Get user's tenant
    tenant = await Tenant.find_one(Tenant.owner.id == user.id)
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant not found")
    
    # Validate user is owner
    if not user.is_owner:
        raise HTTPException(status_code=403, detail="Only tenant owner can activate modules")
    
    # Validate at least one module selected
    if not req.modules:
        raise HTTPException(status_code=400, detail="At least one module must be selected")
    
    # Validate all module IDs exist in DB
    found_modules = await Module.find(In(Module.module_id, req.modules)).to_list()
    found_ids = [m.module_id for m in found_modules]
    
    for module_id in req.modules:
        if module_id not in found_ids:
            raise HTTPException(status_code=400, detail=f"Invalid module ID: {module_id}")
    
    # Activate selected modules
    for module_id in req.modules:
        tenant.active_modules[module_id] = "ACTIVE"
    
    await tenant.save()
    
    return {
        "message": "Modules activated successfully",
        "active_modules": tenant.active_modules
    }

@router.get("/active")
async def get_active_modules(user: User = Depends(get_current_user)):
    """Get active modules for the user's tenant"""
    tenant = await Tenant.find_one(Tenant.owner.id == user.id)
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant not found")
    
    return {"active_modules": tenant.active_modules}

@router.get("/tenant/{slug}")
async def get_tenant_modules(slug: str):
    """Public endpoint to check active modules for a tenant by slug"""
    tenant = await Tenant.find_one(Tenant.slug == slug)
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant not found")
    return {"active_modules": tenant.active_modules}
