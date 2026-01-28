
from fastapi import APIRouter, Depends, HTTPException
from typing import List
from app.models import Category, User, UserRole
from app.dependencies import get_current_user, require_tenant
from app.permissions import require_role
from pydantic import BaseModel

router = APIRouter(
    tags=["categories"],
    responses={404: {"description": "Not found"}},
)

class CategoryCreate(BaseModel):
    name: str

@router.get("/", response_model=List[Category])
async def list_categories(
    tenant = Depends(require_tenant)
):
    return await Category.find(Category.tenant_id == str(tenant.id)).to_list()

@router.post("/", response_model=Category)
async def create_category(
    cat: CategoryCreate,
    user: User = Depends(require_role([UserRole.PRODUCT_MANAGER, UserRole.ADMIN, UserRole.OWNER])),
    tenant = Depends(require_tenant)
):
    # Check if exists
    existing = await Category.find_one(
        Category.name == cat.name,
        Category.tenant_id == str(tenant.id)
    )
    if existing:
        raise HTTPException(status_code=400, detail="Category already exists")
        
    new_cat = Category(
        name=cat.name,
        tenant_id=str(tenant.id)
    )
    await new_cat.insert()
    return new_cat

@router.delete("/{category_id}")
async def delete_category(
    category_id: str,
    user: User = Depends(require_role([UserRole.PRODUCT_MANAGER, UserRole.ADMIN, UserRole.OWNER])),
    tenant = Depends(require_tenant)
):
    cat = await Category.find_one(
        Category.id == category_id,
        Category.tenant_id == str(tenant.id)
    )
    if not cat:
        raise HTTPException(status_code=404, detail="Category not found")
        
    # Optional: Check if used in products?
    # For now allow deletion, products might just show the old string or need update
    
    await cat.delete()
    return {"message": "Category deleted"}
