from fastapi import APIRouter, Depends, HTTPException
from typing import List, Optional
from pydantic import BaseModel
from app.models import User, UserRole, Customer
from app.dependencies import require_tenant
from app.permissions import require_role

router = APIRouter(
    tags=["customers"],
    responses={404: {"description": "Not found"}},
)

class CustomerResponse(BaseModel):
    id: str
    email: str
    full_name: str
    phone: Optional[str] = None
    address: Optional[str] = None

    model_config = {
        "from_attributes": True
    }


@router.get("", response_model=List[CustomerResponse])
async def list_customers(
    admin: User = Depends(require_role([UserRole.ADMIN, UserRole.OWNER, UserRole.PRODUCT_MANAGER, UserRole.SALES])),
    tenant = Depends(require_tenant)
):
    customers = await Customer.find(fetch_links=True).to_list()
    
    return [
        CustomerResponse(
            id=str(c.id),
            email=c.user.email,
            full_name=c.full_name,
            phone=c.phone,
            address=c.address
        ) for c in customers
    ]
