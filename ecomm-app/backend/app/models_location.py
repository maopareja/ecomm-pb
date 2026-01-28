from typing import Optional
from beanie import Document, Link
from pydantic import BaseModel, Field
from datetime import datetime
from .models import Product

class Location(Document):
    name: str
    address: Optional[str] = None
    phone: Optional[str] = None
    is_active: bool = True
    tenant_id: str

    class Settings:
        name = "locations"

class Inventory(Document):
    product_id: str # Link manually or use Link[Product]
    location_id: str # Link manually or use Link[Location]
    quantity: int = 0
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Settings:
        name = "inventory"
        indexes = [
            [("product_id", 1), ("location_id", 1)] # Unique compound index ideally
        ]
