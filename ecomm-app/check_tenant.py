
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie, Document
from pydantic import Field

class Tenant(Document):
    slug: str = Field(unique=True)
    class Settings:
        name = "tenants"

async def check():
    client = AsyncIOMotorClient("mongodb://pbmnguser:P1n3c1092$@localhost:28018/admin")
    await init_beanie(database=client["ecomm_db"], document_models=[Tenant])
    
    tenant = await Tenant.find_one(Tenant.slug == "ecomm-pb")
    if tenant:
        print(f"FOUND: Tenant {tenant.slug} with ID {tenant.id}")
    else:
        print("NOT FOUND: Tenant ecomm-pb")
        
    # Also list all tenants
    all_tenants = await Tenant.find_all().to_list()
    print(f"Total tenants in DB: {len(all_tenants)}")
    for t in all_tenants:
        print(f" - {t.slug}")

if __name__ == "__main__":
    asyncio.run(check())
