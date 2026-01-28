from fastapi import APIRouter, Depends, Request, HTTPException
from app.dependencies import require_tenant
from app.models import Tenant, Order, OrderItem
from app.routers.cart import get_redis
from app.celery_worker import process_payment
from datetime import datetime
from app.models import Product
from pydantic import BaseModel
import asyncio
import random

router = APIRouter()

class CheckoutRequest(BaseModel):
    shipping_address: str
    payment_method: str # credit_card, paypal, etc.

@router.post("/")
async def checkout(
    req_body: CheckoutRequest,
    request: Request,
    tenant: Tenant = Depends(require_tenant)
):
    session_id = request.headers.get("x-session-id")
    if not session_id:
        raise HTTPException(status_code=400, detail="Missing Session ID")
        
    r = await get_redis()
    key = f"cart:{tenant.slug}:{session_id}"
    cart_data = await r.hgetall(key)
    
    if not cart_data:
        raise HTTPException(status_code=400, detail="Cart is empty")
    
    # 1. Fetch Products for prices and STOCK check
    product_ids = list(cart_data.keys())
    
    # Import ObjectId locally to avoid broader scope issues if not verified
    from bson import ObjectId
    try:
        pids = [ObjectId(pid) for pid in product_ids]
    except:
        raise HTTPException(status_code=400, detail="Invalid Product IDs in cart")

    products = await Product.find(Product.id << pids).to_list()
    prod_map = {str(p.id): p for p in products}
    
    items = []
    total = 0.0
    products_to_update = []
    
    # 2. Build items and VALIDATE STOCK
    for pid_str, qty_str in cart_data.items():
        prod = prod_map.get(pid_str)
        if prod:
            qty = int(qty_str)
            
            # STOCK CHECK
            if prod.stock < qty:
                raise HTTPException(
                    status_code=400, 
                    detail=f"Insufficient stock for {prod.name}. Available: {prod.stock}"
                )
            
            cost = prod.price * qty
            total += cost
            items.append(OrderItem(
                product_id=str(prod.id),
                product_name=prod.name,
                price=prod.price,
                quantity=qty
            ))
            
            # Prepare stock update (optimistic locking would be better but simple decrement for MVP)
            prod.stock -= qty
            products_to_update.append(prod)
            
    if not items:
        raise HTTPException(status_code=400, detail="No valid items found")

    # 3. Simulate Payment Gateway (Random delay + Success/Fail)
    await asyncio.sleep(random.uniform(0.5, 2.0))
    # For MVP, always succeed if payment method is valid
    if req_body.payment_method == "fail_test": 
         raise HTTPException(status_code=402, detail="Payment Failed")

    # 4. Atomically update stock? Beanie doesn't do multi-doc transactions easily without replica set.
    # We will just save them one by one. If one fails, we are in inconsistent state (MVP limitation).
    for p in products_to_update:
        await p.save()

    # 5. Create Order
    order = Order(
        tenant_id=str(tenant.id),
        items=items,
        total=total,
        status="PAID", # We assume immediate payment success for MVP
        shipping_address=req_body.shipping_address,
        payment_method=req_body.payment_method
    )
    await order.insert()
    
    # Clear Cart
    await r.delete(key)
    
    # Trigger Async Tasks if any (emails, etc)
    # process_payment.delay(str(order.id)) # If we had async processing
    
    return {
        "order_id": str(order.id), 
        "status": "PAID", 
        "message": "Order placed successfully"
    }
