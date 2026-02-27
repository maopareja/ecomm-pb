from fastapi import APIRouter, Depends, Request
from pydantic import BaseModel
import redis
from app.config import settings
from app.dependencies import require_tenant
from app.models import Tenant
import json

router = APIRouter()

# Simple blocking redis for now, or use aioredis (redis.asyncio)
# Using redis.from_url is blocking by default, let's use asyncio for consistency if we want but for MVP simple is fine.
# Actually config says redis:// so let's import the async one.
from redis import asyncio as aioredis

async def get_redis():
    try:
        r = aioredis.from_url(settings.REDIS_URL, decode_responses=True)
        # Check connection or return and handle in routes
        return r
    except Exception:
        return None

class CartItem(BaseModel):
    product_id: str
    quantity: int

@router.post("")
async def add_to_cart(
    item: CartItem, 
    request: Request,
    tenant: Tenant = Depends(require_tenant)
):
    # Session ID from cookie or header?
    # For MVP let's assume a generated session_id passed in header 'x-session-id' or similiar for simplicity
    # OR create one if not exists.
    # Let's use a simple query param or header for the MVP.
    session_id = request.headers.get("x-session-id")
    if not session_id:
        return {"error": "Missing x-session-id header"}

    r = await get_redis()
    if not r:
        return {"error": "Redis not available"}
    
    key = f"cart:{tenant.slug}:{session_id}"
    
    try:
        # Store as hash: product_id -> quantity
        # Or just a list of JSONs. Hash is better for updating qtys.
        await r.hincrby(key, item.product_id, item.quantity)
        return {"message": "Added to cart", "cart": await r.hgetall(key)}
    except Exception as e:
        print(f"Redis Error: {e}")
        return {"error": "Could not update cart"}

@router.get("")
async def get_cart(
    request: Request,
    tenant: Tenant = Depends(require_tenant)
):
    session_id = request.headers.get("x-session-id")
    if not session_id:
        return {}
        
    r = await get_redis()
    if not r:
        return {}
        
    key = f"cart:{tenant.slug}:{session_id}"
    try:
        return await r.hgetall(key)
    except Exception:
        return {}

@router.delete("")
async def clear_cart(
    request: Request,
    tenant: Tenant = Depends(require_tenant)
):
    session_id = request.headers.get("x-session-id")
    if not session_id:
        return {"message": "No session"}
        
    r = await get_redis()
    if not r:
        return {"message": "Redis not available"}

    key = f"cart:{tenant.slug}:{session_id}"
    try:
        await r.delete(key)
    except Exception:
        pass
    
    return {"message": "Cart cleared"}
