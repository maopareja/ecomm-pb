import asyncio
from app.database import init_db
from app.models import User, UserRole, Tenant
from app.models_location import Location

async def bootstrap_system():
    await init_db()
    
    # 1. Promote Admin
    email = "adminpb@mail.com"
    user = await User.find_one(User.email == email)
    if user:
        print(f"Found user {user.email}. Current Role: {user.role}")
        user.role = UserRole.OWNER
        await user.save()
        print(f"✅ Promoted {user.email} to OWNER")
    else:
        print(f"❌ User {email} not found")

    # 2. Ensure Default Tenant (just in case)
    tenant = await Tenant.find_one(Tenant.slug == "ecomm-pb")
    if not tenant:
        print("⚠️ Default tenant not found (unexpected)")
    else:
        print(f"✅ Tenant '{tenant.name}' found")

    # 3. Create Default Location if missing
    locs = await Location.find_all().to_list()
    if not locs:
        print("⚠️ No locations found. Creating 'Sede Principal'...")
        main_loc = Location(
            name="Sede Principal",
            address="Calle Principal #123",
            phone="555-0000",
            tenant_id=str(tenant.id) if tenant else "default_tenant_id"
        )
        await main_loc.insert()
        print("✅ Created 'Sede Principal'")
    else:
        print(f"✅ Found {len(locs)} locations: {[l.name for l in locs]}")

    # 4. Check Users Visibility
    all_users = await User.find_all().to_list()
    print(f"✅ Total Users in DB: {len(all_users)}")
    for u in all_users:
        print(f" - {u.email} ({u.role}) Tenant: {u.tenant.id if u.tenant else 'None'}")

if __name__ == "__main__":
    asyncio.run(bootstrap_system())
