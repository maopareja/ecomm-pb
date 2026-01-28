from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
from pydantic import BaseModel
from app.models import User, UserRole
from app.models_location import Location, Inventory
from app.dependencies import get_current_user, require_tenant
from app.permissions import require_role

router = APIRouter(
    tags=["locations"],
    responses={404: {"description": "Not found"}},
)

# Schemas
class LocationCreate(BaseModel):
    name: str
    address: Optional[str] = None
    phone: Optional[str] = None

class InventoryUpdate(BaseModel):
    product_id: str
    quantity: int

# Endpoints

@router.post("/", response_model=Location)
async def create_location(
    loc: LocationCreate, 
    user: User = Depends(require_role([UserRole.ADMIN, UserRole.OWNER]))
):
    # Determine tenant from user
    tenant_id = str(user.tenant.id) if user.tenant else None
    if not tenant_id:
         # Fallback or Error if strict multi-tenant
         # For single tenant app, maybe hardcode or error?
         # Let's assume there is a default tenant if user is admin
         pass 

    
    new_loc = Location(
        name=loc.name,
        address=loc.address,
        phone=loc.phone,
        tenant_id=tenant_id
    )
    await new_loc.insert()
    return new_loc

@router.get("/", response_model=List[Location])
async def list_locations(
    user: User = Depends(get_current_user)
):
    # Everyone can list locations? Or just internal?
    # For now, let's allow authenticated users to see locations (e.g. for pickup selector)
    tenant_id = str(user.tenant.id) if user.tenant else None
    return await Location.find(Location.tenant_id == tenant_id).to_list()

@router.get("/{location_id}/inventory", response_model=List[Inventory])
async def get_location_inventory(
    location_id: str,
    user: User = Depends(require_role([UserRole.INVENTORY_MANAGER, UserRole.ADMIN, UserRole.OWNER, UserRole.SALES]))
):
    return await Inventory.find(Inventory.location_id == location_id).to_list()

@router.post("/{location_id}/inventory")
async def update_inventory(
    location_id: str,
    update: InventoryUpdate,
    user: User = Depends(require_role([UserRole.INVENTORY_MANAGER, UserRole.ADMIN, UserRole.OWNER]))
):
    # Upsert inventory
    inv = await Inventory.find_one(
        Inventory.location_id == location_id,
        Inventory.product_id == update.product_id
    )
    
    if inv:
        inv.quantity = update.quantity
        await inv.save()
    else:
        inv = Inventory(
            location_id=location_id,
            product_id=update.product_id,
            quantity=update.quantity
        )
        await inv.insert()
    
    return inv
