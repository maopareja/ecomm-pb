import asyncio
import os
from app.database import init_db
from app.models import User, UserRole

async def promote_admin():
    await init_db()
    email = "adminpb@mail.com"
    user = await User.find_one(User.email == email)
    if user:
        print(f"Found user {user.email} with role {user.role}")
        user.role = UserRole.OWNER
        await user.save()
        print(f"Updated {user.email} to {user.role}")
    else:
        print(f"User {email} not found")

if __name__ == "__main__":
    asyncio.run(promote_admin())
