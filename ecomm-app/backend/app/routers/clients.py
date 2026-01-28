from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
from beanie import PydanticObjectId

from app.models import User, Client, Tenant
from app.schemas import ClientRead, ClientCreate, ClientUpdate
from app.dependencies import get_current_user, require_vet_module

from pymongo import ASCENDING
from pymongo.errors import DuplicateKeyError

router = APIRouter(tags=["Clients"])

@router.post("/", response_model=ClientRead, status_code=status.HTTP_201_CREATED)
async def create_client(
    client_in: ClientCreate,
    tenant: Tenant = Depends(require_vet_module)
):
    try:
        # User is authenticated and has vet module via require_vet_module
        client = Client(**client_in.model_dump(), tenant=tenant)
        await client.insert()
        return client
    except DuplicateKeyError:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Un cliente con esta cédula ya existe."
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"No se pudo crear el cliente. Error: {e}")

@router.get("/", response_model=List[ClientRead])
async def list_clients(
    search: Optional[str] = None,
    tenant: Tenant = Depends(require_vet_module)
):
    # Using alias or manual check to ensure we filter by tenant link
    # Beanie links can be queried by ID directly usually
    query = [Client.tenant.id == tenant.id]
    
    if search:
        search_regex = {"$regex": search, "$options": "i"} 
        query.append(
            {
                "$or": [
                    {"name": search_regex},
                    {"id_card": search_regex},
                    {"email": search_regex},
                ]
            }
        )
    
    clients = await Client.find(*query).sort(("name", ASCENDING)).limit(20).to_list()
    return clients

@router.get("/{client_id}", response_model=ClientRead)
async def get_client(
    client_id: PydanticObjectId,
    tenant: Tenant = Depends(require_vet_module)
):
    client = await Client.get(client_id)
    if not client or client.tenant.ref.id != tenant.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Client not found")
    return client
