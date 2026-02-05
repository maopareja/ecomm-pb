import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie, Link
from app.models import Category, Tenant, User, UserRole
from app.config import settings

async def test_category_creation():
    client = AsyncIOMotorClient(settings.MONGO_URI)
    await init_beanie(database=client[settings.DATABASE_NAME], document_models=[User, Tenant, Category])
    
    tenant = await Tenant.find_one(Tenant.slug == "ecomm-pb")
    if not tenant:
        print("Error: Tenant ecomm-pb not found")
        return

    print(f"Testing creation with Tenant ID: {tenant.id}")
    
    try:
        new_cat = Category(
            name="Test Category AI",
            tenant=tenant
        )
        await new_cat.insert()
        print(f"Successfully created Category: {new_cat.name} (ID: {new_cat.id})")
        
        # Verify query
        found = await Category.find_one(Category.tenant.id == tenant.id, Category.name == "Test Category AI")
        if found:
            print("Successfully verified query by tenant relationship.")
        else:
            print("Failed to find category after creation using tenant link query.")
            
    except Exception as e:
        print(f"Exception during category creation: {type(e).__name__}: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test_category_creation())
