from fastapi import APIRouter, Depends, HTTPException, Body
from typing import List
from pydantic import BaseModel
from app.models import User, UserRole, Tenant
from app.dependencies import require_tenant
from app.permissions import require_role
from app.auth import get_password_hash

router = APIRouter(
    tags=["users"],
    responses={404: {"description": "Not found"}},
)

class UserCreate(BaseModel):
    email: str
    password: str
    role: UserRole = UserRole.CUSTOMER

class UserRoleUpdate(BaseModel):
    role: UserRole

# Response model to hide password
class UserResponse(BaseModel):
    id: str
    email: str
    role: UserRole

    class Config:
        orm_mode = True

@router.get("", response_model=List[UserResponse])
async def list_users(
    user: User = Depends(require_role([UserRole.ADMIN, UserRole.OWNER]))
):
    users = await User.find_all().to_list()
    # Manual mapping if needed or rely on Pydantic
    return [
        UserResponse(
            id=str(u.id), 
            email=u.email, 
            role=u.role
        ) for u in users
    ]

@router.patch("/{user_id}/role")
async def update_user_role(
    user_id: str,
    update: UserRoleUpdate,
    admin: User = Depends(require_role([UserRole.OWNER, UserRole.ADMIN]))
):
    target_user = await User.get(user_id)
    if not target_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Optional: Prevent self-demotion or modifying other owners if needed
    
    target_user.role = update.role
    await target_user.save()
    return {"status": "success", "role": target_user.role}

@router.post("", response_model=UserResponse)
async def create_user(
    new_user: UserCreate,
    admin: User = Depends(require_role([UserRole.ADMIN, UserRole.OWNER])),
    tenant = Depends(require_tenant)
):
    # Check if exists
    if await User.find_one(User.email == new_user.email):
        raise HTTPException(status_code=400, detail="User already exists")
    
    # Create user
    user = User(
        email=new_user.email,
        hashed_password=get_password_hash(new_user.password),
        role=new_user.role,
        tenant=tenant  # Use the fetched tenant document
    )
    await user.insert()
    
    return UserResponse(
        id=str(user.id),
        email=user.email,
        role=user.role
    )

