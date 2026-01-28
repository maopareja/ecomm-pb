from fastapi import APIRouter, HTTPException, Response, Depends
from pydantic import BaseModel
from app.models import User, Tenant
from app.auth import get_password_hash, verify_password, create_access_token
from app.config import settings
from app.dependencies import get_current_user
from datetime import timedelta
import re
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

class RegisterRequest(BaseModel):
    email: str
    password: str

class LoginRequest(BaseModel):
    email: str
    password: str

def generate_slug_from_email(email: str) -> str:
    """Generate a slug from email username part (before @)"""
    username = email.split('@')[0]
    # Replace non-alphanumeric with hyphens, convert to lowercase
    slug = re.sub(r'[^a-z0-9]+', '-', username.lower()).strip('-')
    return slug

async def get_unique_slug(base_slug: str) -> str:
    """Get unique slug, appending number if necessary"""
    slug = base_slug
    counter = 2
    while await Tenant.find_one(Tenant.slug == slug):
        slug = f"{base_slug}{counter}"
        counter += 1
    return slug

@router.post("/register")
async def register(req: RegisterRequest, response: Response):
    # Public registration disabled. Use Admin Panel.
    raise HTTPException(status_code=403, detail="Registration is disabled. Contact administrator.")


    hashed = get_password_hash(req.password)
    # Register as normal user (Customer), NOT owner
    user = User(
        email=req.email, 
        hashed_password=hashed, 
        is_owner=False,
        tenant=tenant
    )
    await user.insert()
    
    # Generate token for session
    access_token = create_access_token(
        data={"sub": user.email},
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    
    # Set HttpOnly cookie
    max_age = settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60
    response.set_cookie(
        key=settings.COOKIE_NAME,
        value=access_token,
        httponly=True,
        secure=settings.COOKIE_SECURE, 
        domain=settings.DOMAIN,
        path="/",
        samesite="lax",
        max_age=max_age
    )
    
    return {
        "message": "Account registered successfully",
        "tenant_slug": default_slug
    }

@router.post("/login")
async def login(req: LoginRequest, response: Response):
    user = await User.find_one(User.email == req.email)
    if not user or not verify_password(req.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
        
    access_token = create_access_token(
        data={"sub": user.email},
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    
    # Set HttpOnly cookie for configured domain
    max_age = settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60
    response.set_cookie(
        key=settings.COOKIE_NAME,
        value=access_token,
        httponly=True,
        secure=settings.COOKIE_SECURE, 
        domain=settings.DOMAIN,
        path="/",
        samesite="lax",
        max_age=max_age
    )
    logger.warning(f"Login: Cookie generated for {settings.DOMAIN}. Header: {response.headers.get('set-cookie')}")
    
    # Get tenant info. 
    # In Single Tenant mode, we can just return default or check user.tenant
    default_slug = "ecomm-pb"
    tenant = await Tenant.find_one(Tenant.slug == default_slug)
    
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant not found")
    
    return {
        "message": "Login successful",
        "email": user.email,
        "is_owner": user.is_owner,
        "tenant_slug": tenant.slug,
        "active_modules": tenant.active_modules
    }

@router.post("/logout")
async def logout(response: Response):
    # Delete cookie from all possible domains
    response.delete_cookie(key=settings.COOKIE_NAME, path="/")
    response.delete_cookie(key=settings.COOKIE_NAME, domain=settings.DOMAIN, path="/")
    # Keep .localhost for backwards compatibility during transition
    response.delete_cookie(key=settings.COOKIE_NAME, domain=".localhost", path="/")
    return {"message": "Logged out successfully"}

@router.get("/me")
async def get_current_user_info(user: User = Depends(get_current_user)):
    tenant = await Tenant.find_one(Tenant.owner.id == user.id)
    return {
        "email": user.email,
        "is_owner": user.is_owner,
        "tenant": {
            "name": tenant.name if tenant else None,
            "slug": tenant.slug if tenant else None,
            "active_modules": tenant.active_modules if tenant else {}
        } if tenant else None
    }
