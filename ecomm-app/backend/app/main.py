from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.database import init_db
from app.routers import auth, products, cart, checkout, vet, locations, users, categories, upload
from app.config import settings
import redis.asyncio as aioredis
import asyncio

app = FastAPI()

# CORS for Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"^https?://(localhost|ecommpb\.local|vetnexus\.local)(:\d+)?$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def on_startup():
    await init_db()

# Mount static files
# HAProxy routes /api/static -> Backend /static (because of strip prefix)
# So we mount matching the STRIPPED path.
app.mount("/static", StaticFiles(directory="app/static_uploads"), name="static")

app.include_router(auth.router, prefix="/auth", tags=["Auth"])
app.include_router(products.router, prefix="/products", tags=["Products"])
app.include_router(cart.router, prefix="/cart", tags=["Cart"])
app.include_router(checkout.router, prefix="/checkout", tags=["Checkout"])
app.include_router(locations.router, prefix="/locations", tags=["Locations"])
app.include_router(users.router, prefix="/users", tags=["Users"])
app.include_router(categories.router, prefix="/categories", tags=["Categories"])
app.include_router(upload.router, prefix="/upload", tags=["Uploads"])
app.include_router(vet.router, prefix="/vet", tags=["Vet"])

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
