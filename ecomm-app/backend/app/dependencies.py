from fastapi import Request, HTTPException, Depends, status
from jose import JWTError, jwt, ExpiredSignatureError
from app.config import settings
from app.models import User, Tenant
from typing import Optional
import logging

logger = logging.getLogger(__name__)

async def get_current_user(request: Request):
    # Debug logging - Using warning to ensure visibility in standard docker outputs
    host = request.headers.get('host')
    x_forwarded_host = request.headers.get('x-forwarded-host')
    cookie_header = request.headers.get('cookie', 'NONE')
    logger.warning(f"--- AUTH CHECK ---")
    logger.warning(f"Host: {host}, X-Forwarded-Host: {x_forwarded_host}")
    logger.warning(f"Cookie Header: {cookie_header}")
    logger.warning(f"Parsed Cookies: {list(request.cookies.keys())}")
    
    token = request.cookies.get(settings.COOKIE_NAME)
    
    if not token:
        # Try getting from Authorization header as fallback
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ")[1]
    
    if not token:
        logger.warning(f"No access_token cookie found for host {host}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Sesión no encontrada. Por favor, inicie sesión.",
        )

    try:
        logger.warning(f"Raw token: {token}")
        # Sanitize token: remove quotes first, then "Bearer " prefix, then whitespace
        token = token.strip().strip('"').strip("'")
        
        if token.startswith("Bearer "):
            token = token[7:] # Remove "Bearer " prefix
            
        token = token.strip() # Final cleanup
        logger.warning(f"Sanitized token: {token}")
        
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        email: str = payload.get("sub")
        if not email:
            logger.error("Token decoding failed: missing sub")
            raise HTTPException(status_code=401, detail="Token inválido.")
        
        user = await User.find_one(User.email == email)
        if not user:
            logger.error(f"User not found for email: {email}")
            raise HTTPException(status_code=401, detail="Usuario no encontrado.")
        
        return user

    except ExpiredSignatureError:
        logger.error("Token expired")
        raise HTTPException(status_code=401, detail="La sesión ha expirado.")
    except JWTError as e:
        logger.error(f"JWT Verification failed: {str(e)}")
        raise HTTPException(status_code=401, detail="Error de autenticación.")
    except Exception as e:
        logger.error(f"Unexpected auth error: {str(e)}")
        raise HTTPException(status_code=401, detail="Error inesperado de autenticación.")



async def get_tenant_by_host(request: Request) -> Optional[Tenant]:
    # SINGLE TENANT MODE: Always return 'ecomm-pb'
    # Ignore headers, subdomains, etc.
    
    # Try to find the default tenant
    default_slug = "ecomm-pb"
    tenant = await Tenant.find_one(Tenant.slug == default_slug)
    
    if tenant:
        logger.warning(f"Tenant found: {tenant.slug} (ID: {tenant.id})")
        return tenant
    
    logger.error(f"Tenant NOT FOUND: {default_slug}!")
    return None



async def require_tenant(tenant: Tenant = Depends(get_tenant_by_host)):
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant not found")
    return tenant

async def require_vet_module(user: User = Depends(get_current_user)):
    tenant = await Tenant.find_one(Tenant.owner.id == user.id)
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant not found for this user")
    
    is_vet = tenant.active_modules.get("vet_clinic") == "ACTIVE"
    is_home = tenant.active_modules.get("home_package") == "ACTIVE"
    
    if not (is_vet or is_home):
        raise HTTPException(status_code=403, detail="Neither Vet Clinic nor Home Package modules are active")
    
    return tenant
