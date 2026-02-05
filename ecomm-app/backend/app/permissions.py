from fastapi import Depends, HTTPException, status
import logging
from typing import List
from app.models import User, UserRole
from app.dependencies import get_current_user

class RoleChecker:
    def __init__(self, allowed_roles: List[UserRole]):
        self.allowed_roles = allowed_roles

    def __call__(self, user: User = Depends(get_current_user)):
        logging.warning(f"--- AUTH DEBUG ---")
        logging.warning(f"User: {user.email}, Role: {user.role}, Is Owner: {user.is_owner}")
        logging.warning(f"Allowed roles: {self.allowed_roles}")
        
        # Allow if user is explicitly an owner via flag, OR if their role is in allowed list
        if user.is_owner:
            logging.warning("User permitted via is_owner flag")
            return user
            
        if user.role not in self.allowed_roles and user.role != UserRole.OWNER:
            logging.error(f"User {user.email} DENIED access")
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN, 
                detail="Operation not permitted"
            )
        return user

def require_role(allowed_roles: List[UserRole]):
    return RoleChecker(allowed_roles)
