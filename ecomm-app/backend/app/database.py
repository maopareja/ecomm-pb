from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
from app.config import settings
# Models will be imported here later to init beanie
# from app.models import User, Tenant, Product, Order

from app.models import Module

INITIAL_MODULES = [
    {
        "module_id": "online_sales",
        "name": "Venta en Línea",
        "description": "Tienda online completa para vender productos veterinarios",
        "price": 29.99,
        "features": ["Catálogo de productos", "Carrito de compras", "Pasarela de pagos", "Gestión de inventario"]
    },
    {
        "module_id": "pos",
        "name": "Punto de Venta",
        "description": "Sistema POS para ventas presenciales en tu clínica",
        "price": 39.99,
        "features": ["Ventas presenciales", "Inventario en tiempo real", "Reportes de caja", "Control de turnos"]
    },
    {
        "module_id": "home_package",
        "name": "Historia Clinica",
        "description": "Gestión de servicios veterinarios a domicilio",
        "price": 49.99,
        "features": ["Historia clínica básica", "Gestión de citas", "Recordatorios automáticos", "Seguimiento de pacientes"]
    },
    {
        "module_id": "vet_clinic",
        "name": "Clínica Veterinaria",
        "description": "Suite completa para gestión de clínica veterinaria",
        "price": 79.99,
        "features": ["Historia clínica completa", "Sistema de citas", "Inventario de medicamentos", "Reportes médicos", "Cirugías y procedimientos"]
    }
]

async def seed_modules():
    for mod_data in INITIAL_MODULES:
        existing = await Module.find_one(Module.module_id == mod_data["module_id"])
        if not existing:
            await Module(**mod_data).insert()
            print(f"Seeded module: {mod_data['name']}")

async def seed_default_tenant():
    # Ensure default tenant 'ecomm-pb' exists for Single Tenant mode
    from app.models import Tenant, User
    from passlib.context import CryptContext
    
    pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
    
    slug = "ecomm-pb"
    existing_tenant = await Tenant.find_one(Tenant.slug == slug)
    
    if not existing_tenant:
        print(f"Seeding default tenant: {slug}")
        
        # Ensure Owner exists
        admin_email = "adminpb@mail.com"
        admin = await User.find_one(User.email == admin_email)
        
        if not admin:
            print(f"Seeding default admin: {admin_email}")
            admin = User(
                email=admin_email,
                hashed_password=pwd_context.hash("adminpb123"), # Default password
                is_owner=True
            )
            await admin.insert()
            
        # Create Tenant
        tenant = Tenant(
            name="E-Comm PB Store",
            slug=slug,
            owner=admin,
            active_modules={
                "online_sales": "ACTIVE",
                "pos": "ACTIVE",
                "home_package": "ACTIVE",
                "vet_clinic": "ACTIVE"
            }
        )
        await tenant.insert()
        
        # Link tenant to user
        admin.tenant = tenant
        await admin.save()
        print("Default tenant and admin seeded successfully.")


async def init_db():
    client = AsyncIOMotorClient(settings.MONGO_URI)
    await init_beanie(database=client[settings.DATABASE_NAME], document_models=[
        # User, Tenant, Product, Order, Module
        "app.models.User",
        "app.models.Tenant",
        "app.models.Module",
        "app.models.Product",
        "app.models.Order",
        "app.models.MedicalRecord",
        "app.models.Appointment",
        "app.models.Client",
        "app.models.Patient",
        "app.models.ClinicalRecord",
        "app.models_location.Location",
        "app.models_location.Inventory",
        "app.models.Category"
    ])
    await seed_modules()
    await seed_default_tenant()

