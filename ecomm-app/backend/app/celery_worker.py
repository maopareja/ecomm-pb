from celery import Celery
import time
import os
import pymongo
import redis
from bson import ObjectId
# Do NOT import generic settings or async init here to avoid conflicts, 
# just hardcode or read env for simplicity in worker, or import config carefully.
# We will trust environment variables which Pydantic settings reads.

# Config vals
MONGO_URI = os.getenv("MONGO_URI", "mongodb://mongo:27017")
DATABASE_NAME = os.getenv("DATABASE_NAME", "saas_ecommerce")
REDIS_URL = os.getenv("REDIS_URL", "redis://redis:6379/0")
RABBITMQ_URL = os.getenv("RABBITMQ_URL", "amqp://guest:guest@rabbitmq:5672//")

celery_app = Celery("worker", broker=RABBITMQ_URL, backend=REDIS_URL)

@celery_app.task
def process_payment(order_id: str):
    print(f"Processing payment for order {order_id}")
    # Simulate work
    time.sleep(3)
    
    # Sync DB update
    client = pymongo.MongoClient(MONGO_URI)
    db = client[DATABASE_NAME]
    orders_coll = db["orders"]
    
    # Update status
    result = orders_coll.update_one(
        {"_id": ObjectId(order_id)},
        {"$set": {"status": "PAID"}}
    )
    
    if result.modified_count:
        print(f"Order {order_id} marked as PAID")
        
        # Publish event for Realtime updates
        r = redis.Redis.from_url(REDIS_URL)
        channel = f"orders:{order_id}"
        r.publish(channel, "PAID")
        print(f"Published update to {channel}")
    else:
        print(f"Order {order_id} not found or already paid")
