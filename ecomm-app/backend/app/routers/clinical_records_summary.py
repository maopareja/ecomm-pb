from fastapi import APIRouter, Depends, HTTPException
from typing import List, Optional, Any, Dict
from beanie import PydanticObjectId
from app.models import User, Client, Patient, ClinicalRecord, Tenant
from app.dependencies import get_current_user, require_vet_module
from pymongo import ASCENDING, DESCENDING
from beanie.operators import In

router = APIRouter(tags=["Clinical Records Summary"])

@router.get("/")
async def get_clinical_records_summary(
    page: int = 1,
    limit: int = 10,
    owner_search: Optional[str] = None,
    pet_search: Optional[str] = None,
    tenant: Tenant = Depends(require_vet_module)
):
    skip = (page - 1) * limit
    tenant_id = tenant.id

    client_ids = None

    # 1. If pet_search is active, find relevant Client IDs first
    if pet_search:
        pet_query = [Patient.tenant.id == tenant_id]
        pet_query.append({"name": {"$regex": pet_search, "$options": "i"}})
        
        matching_patients = await Patient.find(*pet_query).project(Patient.client).to_list()
        # Extract unique client IDs
        client_ids = list(set([p.client.ref.id for p in matching_patients if p.client]))
        
        if not client_ids:
             return {"data": [], "total": 0}

    # 2. Build Client Query
    client_query = [Client.tenant.id == tenant_id]
    
    if client_ids is not None:
        client_query.append(In(Client.id, client_ids))
        
    if owner_search:
        search_regex = {"$regex": owner_search, "$options": "i"} 
        client_query.append(
            {
                "$or": [
                    {"name": search_regex},
                    {"id_card": search_regex},
                    {"email": search_regex},
                ]
            }
        )

    # 3. Fetch Clients with pagination
    total_clients = await Client.find(*client_query).count()
    clients = await Client.find(*client_query).sort(("name", ASCENDING)).skip(skip).limit(limit).to_list()
    
    if not clients:
        return {"data": [], "total": total_clients}

    # 4. Fetch Patients for these clients
    fetched_client_ids = [c.id for c in clients]
    patients = await Patient.find(
        Patient.tenant.id == tenant_id,
        In(Patient.client.id, fetched_client_ids)
    ).to_list()

    # 5. Fetch Latest Clinical Record for these patients
    patient_ids = [p.id for p in patients]
    
    # We want latest record per patient. 
    # Beanie doesn't do distinct on field easily with find.
    # We'll fetch all records for these patients (assuming not millions per page view) or use aggregation.
    # For optimization, let's fetch only needed fields, sorted by date.
    # Actually, simpler: fetch all records for these patients.
    records = await ClinicalRecord.find(
        ClinicalRecord.tenant.id == tenant_id,
        In(ClinicalRecord.patient.id, patient_ids)
    ).sort([("date", DESCENDING)]).to_list()
    
    # Group records by patient_id, take first (latest)
    latest_records_map = {}
    for r in records:
        pid = r.patient.ref.id if r.patient else None
        if pid and pid not in latest_records_map:
            latest_records_map[pid] = r

    # Group patients by client_id
    patients_map = {cid: [] for cid in fetched_client_ids}
    for p in patients:
        if p.client and p.client.ref.id in patients_map:
            # Attach latest record info
            last_record = latest_records_map.get(p.id)
            p_data = {
                "id": str(p.id),
                "name": p.name,
                "species": p.species,
                "photo_url": p.photo_url,
                "last_visit_date": last_record.date if last_record else None,
                "last_visit_reason": last_record.reason if last_record else None
            }
            patients_map[p.client.ref.id].append(p_data)

    # 6. Assemble Data
    result_data = []
    for client in clients:
        client_data = {
            "id": str(client.id),
            "name": client.name,
            "email": client.email,
            "id_card": client.id_card,
            "phone": client.phone,
            "pets": patients_map.get(client.id, [])
        }
        result_data.append(client_data)

    return {"data": result_data, "total": total_clients}
