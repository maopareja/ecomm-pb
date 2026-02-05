from fastapi import APIRouter, Depends, HTTPException
from typing import List
from app.models_location import Location, Inventory
from app.models import User, UserRole, Tenant
from app.dependencies import get_current_user, require_tenant
from app.permissions import require_role
from pydantic import BaseModel
from datetime import datetime

router = APIRouter(
    tags=["locations"],
    responses={404: {"description": "Not found"}},
)

class LocationCreate(BaseModel):
    name: str
    address: str = ""
    phone: str = ""

class InventoryUpdate(BaseModel):
    product_id: str
    quantity: int

@router.post("", response_model=Location)
async def create_location(
    loc: LocationCreate, 
    user: User = Depends(require_role([UserRole.ADMIN, UserRole.OWNER])),
    tenant = Depends(require_tenant)
):
    new_loc = Location(
        name=loc.name,
        address=loc.address,
        phone=loc.phone,
        tenant=tenant
    )
    await new_loc.insert()
    return new_loc

@router.get("", response_model=List[Location])
async def list_locations(
    tenant: Tenant = Depends(require_tenant)
):
    return await Location.find(Location.tenant.id == tenant.id).to_list()

@router.delete("/{location_id}")
async def delete_location(
    location_id: str,
    user: User = Depends(require_role([UserRole.ADMIN, UserRole.OWNER]))
):
    # Delete location (admin/owner only)
    location = await Location.get(location_id)
    if not location:
        raise HTTPException(status_code=404, detail="Location not found")
    
    # Check if there's inventory linked to this location
    inventory_items = await Inventory.find(Inventory.location_id == location_id).to_list()
    if inventory_items:
        raise HTTPException(
            status_code=400, 
            detail=f"No se puede eliminar sede con inventario ({len(inventory_items)} productos)"
        )
    
    await location.delete()
    return {"message": "Location deleted successfully"}

@router.get("/{location_id}/inventory", response_model=List[Inventory])
async def get_location_inventory(
    location_id: str,
    user: User = Depends(get_current_user)
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
        inv.updated_at = datetime.utcnow()
        await inv.save()
    else:
        inv = Inventory(
            location_id=location_id,
            product_id=update.product_id,
            quantity=update.quantity
        )
        await inv.insert()
    
    return inv
