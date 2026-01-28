from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List, Optional
from app.models import Product, User, Tenant, UserRole
from app.dependencies import get_current_user, require_tenant
from app.permissions import require_role
from pydantic import BaseModel

router = APIRouter()

class ProductCreate(BaseModel):
    name: str
    price: float
    description: str = None
    stock: int = 0
    category: str = None
    images: List[str] = []
    is_featured: bool = False

@router.get("/", response_model=List[Product])
async def list_products(
    tenant: Tenant = Depends(require_tenant),
    q: Optional[str] = None,
    category: Optional[str] = None
):
    # Base query for tenant
    query = Product.tenant_id == str(tenant.id)
    
    if category:
        query = (query) & (Product.category == category)
        
    products = await Product.find(query).to_list()
    
    # In-memory search for MVP (Beanie text search requires index setup)
    if q:
        q_lower = q.lower()
        products = [
            p for p in products 
            if q_lower in p.name.lower() or (p.description and q_lower in p.description.lower())
        ]
        
    return products

@router.post("/")
async def create_product(
    prod: ProductCreate, 
    user: User = Depends(require_role([UserRole.PRODUCT_MANAGER, UserRole.ADMIN, UserRole.OWNER])),
    tenant: Tenant = Depends(require_tenant)
):
    # (Role check handled by dependency)
        
    product = Product(
        name=prod.name,
        price=prod.price,
        description=prod.description,
        stock=prod.stock,
        category=prod.category,
        images=prod.images,
        is_featured=prod.is_featured,
        tenant_id=str(tenant.id)
    )
    await product.insert()
    return product

@router.patch("/{product_id}")
async def update_product(
    product_id: str,
    prod: ProductCreate,
    user: User = Depends(require_role([UserRole.PRODUCT_MANAGER, UserRole.ADMIN, UserRole.OWNER])),
    tenant: Tenant = Depends(require_tenant)
):
    product = await Product.get(product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Update fields
    product.name = prod.name
    product.price = prod.price
    product.description = prod.description
    product.stock = prod.stock
    product.category = prod.category
    product.images = prod.images
    product.is_featured = prod.is_featured
    
    await product.save()
    return product

@router.delete("/{product_id}")
async def delete_product(
    product_id: str,
    user: User = Depends(require_role([UserRole.PRODUCT_MANAGER, UserRole.ADMIN, UserRole.OWNER])),
    tenant: Tenant = Depends(require_tenant)
):
    product = await Product.get(product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    await product.delete()
    return {"message": "Product deleted successfully"}
