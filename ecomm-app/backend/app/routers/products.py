from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List, Optional
from app.models import Product, User, Tenant, UserRole
from app.dependencies import get_current_user, require_tenant
from app.permissions import require_role
from pydantic import BaseModel

router = APIRouter()

class InventoryItemInput(BaseModel):
    location_id: str
    quantity: int

class ProductCreate(BaseModel):
    name: str
    price: float
    description: str = None
    # stock: int = 0 # Deprecated input, calculated from inventory
    initial_inventory: List[InventoryItemInput] = []
    category: str = None
    images: List[str] = []
    is_featured: bool = False

@router.get("/", response_model=List[Product])
async def list_products(
    tenant: Tenant = Depends(require_tenant),
    q: Optional[str] = None,
    category: Optional[str] = None
):
    # Base criteria
    criteria = [Product.tenant_id == str(tenant.id)]
    
    if category:
        criteria.append(Product.category == category)
        
    products = await Product.find(*criteria).to_list()
    
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
    from app.models_location import Inventory
    
    # Calculate total stock from initial inventory
    total_stock = sum(item.quantity for item in prod.initial_inventory)
        
    product = Product(
        name=prod.name,
        price=prod.price,
        description=prod.description,
        stock=total_stock,
        category=prod.category,
        images=prod.images,
        is_featured=prod.is_featured,
        tenant_id=str(tenant.id)
    )
    await product.insert()
    
    # Create inventory records
    if prod.initial_inventory:
        inventory_docs = []
        for item in prod.initial_inventory:
            if item.quantity > 0:
                inv = Inventory(
                    product_id=str(product.id),
                    location_id=item.location_id,
                    quantity=item.quantity
                )
                inventory_docs.append(inv)
        
        if inventory_docs:
            await Inventory.insert_many(inventory_docs)
            
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
    # product.stock = prod.stock # Managed via Inventory now
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

@router.get("/{product_id}/inventory")
async def get_product_inventory(
    product_id: str,
    user: User = Depends(get_current_user),
    tenant: Tenant = Depends(require_tenant)
):
    """
    Obtiene el inventario detallado de un producto en todas las sedes activas.
    Retorna una lista con info de la sede y la cantidad disponible.
    """
    from app.models_location import Location, Inventory
    
    # 1. Obtener todas las sedes del tenant
    locations = await Location.find(
        Location.tenant_id == str(tenant.id),
        Location.is_active == True
    ).to_list()
    
    # 2. Obtener registros de inventario para este producto
    inventory_records = await Inventory.find(
        Inventory.product_id == product_id
    ).to_list()
    
    # Mapear inventario por location_id para acceso rápido
    inv_map = {inv.location_id: inv.quantity for inv in inventory_records}
    
    result = []
    for loc in locations:
        loc_id = str(loc.id)
        qty = inv_map.get(loc_id, 0)
        result.append({
            "location_id": loc_id,
            "location_name": loc.name,
            "quantity": qty
        })
        
    return result
