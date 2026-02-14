
import asyncio
from app.database import init_db
from app.models import Tenant
from app.models_location import Location
import os

STORES_DATA = [
    {"name": "Pinecrest", "address": "12101 S. Dixie Hwy", "phone": "786-732-2269"},
    {"name": "Bird Road East", "address": "6718 SW 40th St", "phone": "305-663-0318"},
    {"name": "Homestead", "address": "2540 NE 10th Court", "phone": "305-242-0080"},
    {"name": "Bird Road West", "address": "11375 SW 40th St", "phone": "305-228-9222"},
    {"name": "West Miami", "address": "1144 SW 67th Ave", "phone": "305-262-0544"},
    {"name": "Key Largo", "address": "99100 Overseas Hwy", "phone": "305-735-4368"},
    {"name": "South Miami", "address": "6655 S. Dixie Hwy", "phone": "305-668-2910"},
    {"name": "Cutler Bay", "address": "18751 S. Dixie Hwy", "phone": "786-732-7955"},
    {"name": "Miami Beach", "address": "1511 Alton Road", "phone": "786-717-5958"},
    {"name": "Miller", "address": "14766 SW 56th St", "phone": "786-292-0355"},
    {"name": "Kendall", "address": "9710 SW 88th St", "phone": "786-701-0202"},
    {"name": "Sweetwater", "address": "10780 W. Flagler St", "phone": "786-607-2007"},
    {"name": "Coral Gables", "address": "3906 SW 8th St", "phone": "786-591-7800"},
    {"name": "Doral", "address": "8398 NW 58th St", "phone": "786-628-7878"},
    {"name": "Goulds", "address": "21657 South Dixie Hwy", "phone": "786-980-1776"},
    {"name": "Tropical Park", "address": "8318 SW 40th St", "phone": "786-432-0006"},
    {"name": "West Palm Beach", "address": "2024 N Military Trail", "phone": "561-855-4874"},
    {"name": "Greenacres", "address": "4650 Jog Rd", "phone": "561-331-4741"},
    {"name": "Sunset", "address": "7315 SW 57th Ave", "phone": "786-634-6355"},
    {"name": "Miami River", "address": "1401 NW 7th St", "phone": "305-707-0095"},
    {"name": "Downtown", "address": "200 SE 1st Street", "phone": "305-465-2253"},
    {"name": "Coconut Grove", "address": "2720 S Dixie Hwy", "phone": "305-680-0906"},
]

async def populate():
    print("🔄 Conectando a Base de Datos...")
    await init_db()
    
    # Obtener tenant por defecto (asumimos ecomm-pb)
    default_tenant = await Tenant.find_one(Tenant.slug == "ecomm-pb")
    if not default_tenant:
        print("❌ Tenant 'ecomm-pb' no encontrado. Asegúrate de ejecutar bootstrap.py primero.")
        return

    print(f"✅ Usando Tenant: {default_tenant.name} ({default_tenant.id})")

    count_new = 0
    count_existing = 0

    for store in STORES_DATA:
        # Verificar si existe por nombre y tenant
        existing = await Location.find_one(
            Location.name == store["name"],
            Location.tenant.id == default_tenant.id
        )
        
        if existing:
            print(f"🔹 Ya existe: {store['name']}")
            # Opcional: Actualizar datos si cambiaron
            existing.address = store["address"]
            existing.phone = store["phone"]
            await existing.save()
            count_existing += 1
        else:
            print(f"✨ Creando: {store['name']}")
            new_loc = Location(
                name=store["name"],
                address=store["address"],
                phone=store["phone"],
                tenant=default_tenant
            )
            await new_loc.insert()
            count_new += 1

    print(f"\n🚀 Proceso finalizado.")
    print(f"   Creadas: {count_new}")
    print(f"   Existentes/Actualizadas: {count_existing}")

if __name__ == "__main__":
    asyncio.run(populate())
