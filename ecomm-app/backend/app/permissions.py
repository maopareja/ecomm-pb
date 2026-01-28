from fastapi import Depends, HTTPException, status
from typing import List
from app.models import User, UserRole
from app.dependencies import get_current_user

class RoleChecker:
    def __init__(self, allowed_roles: List[UserRole]):
        self.allowed_roles = allowed_roles

    def __call__(self, user: User = Depends(get_current_user)):
        if user.role not in self.allowed_roles and user.role != UserRole.OWNER:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN, 
                detail="Operation not permitted"
            )
        return user

def require_role(allowed_roles: List[UserRole]):
    return RoleChecker(allowed_roles)
