from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from app.database import init_db
from app.routers import auth, products, cart, checkout, modules, vet, clients, clinical_records, patients, clinical_records_summary, locations, users, categories
from app.config import settings
import redis.asyncio as aioredis
import asyncio

app = FastAPI()

# CORS for Frontend (supports both localhost and vetnexus.local for development)
app.add_middleware(
    CORSMiddleware,
    # Allow specific origins for credentials support (Wildcard allowed only if credentials=False)
    allow_origin_regex=r"^https?://(localhost|ecommpb\.local|vetnexus\.local)(:\d+)?$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def on_startup():
    await init_db()

app.include_router(auth.router, prefix="/auth", tags=["Auth"])
app.include_router(modules.router, prefix="/modules", tags=["Modules"])
app.include_router(products.router, prefix="/products", tags=["Products"])
app.include_router(cart.router, prefix="/cart", tags=["Cart"])
app.include_router(checkout.router, prefix="/checkout", tags=["Checkout"])
app.include_router(locations.router, prefix="/locations", tags=["Locations"])
app.include_router(users.router, prefix="/users", tags=["Users"])
app.include_router(categories.router, prefix="/categories", tags=["Categories"])
app.include_router(vet.router, prefix="/vet", tags=["Vet"])
app.include_router(clients.router, prefix="/clients", tags=["Clients"])
app.include_router(clinical_records.router, prefix="/clinical-records", tags=["Clinical Records CRUD"])
app.include_router(clinical_records_summary.router, prefix="/clinical-records-summary", tags=["Clinical Records Summary"])
app.include_router(patients.router, prefix="/patients", tags=["Patients"])

@app.get("/")
def read_root():
    return {"message": "SaaS Platform API"}

# WebSocket for Real-time Order Updates
@app.websocket("/ws/orders/{order_id}")
async def order_websocket(websocket: WebSocket, order_id: str):
    await websocket.accept()
    r = await aioredis.from_url(settings.REDIS_URL, decode_responses=True)
    pubsub = r.pubsub()
    channel = f"orders:{order_id}"
    await pubsub.subscribe(channel)
    
    try:
        while True:
            message = await pubsub.get_message(ignore_subscribe_messages=True)
            if message:
                await websocket.send_json({"status": message["data"]})
            await asyncio.sleep(0.1) # Prevent busy loop
    except WebSocketDisconnect:
        await pubsub.unsubscribe(channel)
    finally:
        await r.close()
