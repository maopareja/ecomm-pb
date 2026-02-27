from typing import List, Optional, Dict
from beanie import Document, Link
from pydantic import BaseModel, Field
from datetime import datetime
from enum import Enum
from beanie import Document, Link, Indexed

class UserRole(str, Enum):
    OWNER = "OWNER"
    ADMIN = "ADMIN"
    MANAGER = "MANAGER"
    PRODUCT_MANAGER = "PRODUCT_MANAGER"
    INVENTORY_MANAGER = "INVENTORY_MANAGER"
    SALES = "SALES"
    CUSTOMER = "CUSTOMER"

class User(Document):
    email: Indexed(str, unique=True)
    hashed_password: str
    is_owner: bool = False # Kept for backward compatibility
    role: UserRole = UserRole.CUSTOMER
    tenant: Optional[Link["Tenant"]] = None # Reverse link for easier access

    class Settings:
        name = "users"

class Customer(Document):
    user: Link[User]
    full_name: str
    phone: Optional[str] = None
    address: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "customers"

class Tenant(Document):
    name: str
    slug: str = Field(unique=True)  # Required, auto-generated from email
    owner: Link[User]
    active_modules: Dict[str, str] = Field(default_factory=lambda: {
        "online_sales": "INACTIVE",
        "pos": "INACTIVE",
        "home_package": "INACTIVE",
        "vet_clinic": "INACTIVE"
    })
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "tenants"

class Module(Document):
    module_id: str = Field(unique=True)  # e.g., "online_sales"
    name: str  # e.g., "Venta en Línea"
    description: str
    price: float  # Monthly price
    features: List[str] = []
    is_active: bool = True  # If module is available for purchase
    
    class Settings:
        name = "modules"
class Category(Document):
    name: str
    tenant: Link[Tenant]
    
    class Settings:
        name = "categories"

class Product(Document):
    name: str
    price: float
    description: Optional[str] = None
    stock: int = 0
    category: Optional[str] = None
    images: List[str] = []
    is_featured: bool = False
    delivery_days: str = "immediate"  # immediate, 1, 2, 3, 5, 7, custom
    tax_rate: float = 0.0  # Tax percentage (e.g., 7.0 for 7%)
    tenant: Link[Tenant] # Use Link[Tenant] for consistency with User model

    class Settings:
        name = "products"

class OrderStatus(str, Enum):
    PENDING = "PENDING"
    PAID = "PAID"
    FAILED = "FAILED"

class OrderItem(BaseModel):
    product_id: str
    product_name: str
    price: float
    quantity: int

class Order(Document):
    tenant: Link[Tenant]
    items: List[OrderItem]
    total: float
    status: OrderStatus = OrderStatus.PENDING
    shipping_address: Optional[str] = None
    location_id: Optional[str] = None # Added
    payment_method: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "orders"

class MedicalRecord(Document):
    tenant: Link[Tenant]
    patient_name: str
    owner_name: str
    species: str
    diagnosis: str
    treatment: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "medical_records"

class Appointment(Document):
    tenant: Link[Tenant]
    customer_name: str
    pet_name: str
    date: datetime
    reason: str
    status: str = "SCHEDULED" # SCHEDULED, COMPLETED, CANCELLED
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "appointments"

class Client(Document):
    tenant: Link[Tenant]
    name: str = Field(index=True)
    id_card: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "clients"

class Patient(Document):
    tenant: Link[Tenant]
    client: Link[Client]
    name: str
    species: Optional[str] = None
    breed: Optional[str] = None
    photo_url: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "patients"

class ClinicalRecord(Document):
    tenant: Link[Tenant]
    patient: Link[Patient]
    date: datetime = Field(default_factory=datetime.utcnow)
    reason: Optional[str] = None
    diagnosis: Optional[str] = None
    treatment: Optional[str] = None
    weight: Optional[float] = None
    temperature: Optional[float] = None
    notes: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "clinical_records_data" # Avoid conflict with existing MedicalRecord if any, naming it distinct
