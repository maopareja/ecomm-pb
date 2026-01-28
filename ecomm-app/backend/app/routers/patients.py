from fastapi import APIRouter, Depends, HTTPException, status, File, UploadFile
from typing import List, Optional
from beanie import PydanticObjectId
import shutil
import os
from uuid import uuid4

from app.models import User, Patient, Client, Tenant
from app.schemas import PatientRead, PatientCreate, PatientUpdate
from app.dependencies import get_current_user, require_vet_module

from pymongo.errors import DuplicateKeyError

router = APIRouter(tags=["Patients"])

@router.post("/", response_model=PatientRead, status_code=status.HTTP_201_CREATED)
async def create_patient(
    patient_in: PatientCreate,
    tenant: Tenant = Depends(require_vet_module)
):
    # Verify that the client exists and belongs to the current tenant
    client = await Client.get(patient_in.client_id)
    if not client or client.tenant.ref.id != tenant.id:
        raise HTTPException(status_code=404, detail="Client not found")

    try:
        patient = Patient(
            **patient_in.model_dump(exclude={"client_id"}), 
            client=client, 
            tenant=tenant
        )
        await patient.insert()
        # We don't need to fetch link immediately if we assign object, but ensuring it's loaded for response
        return patient
    except DuplicateKeyError:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Ya existe una mascota con este nombre para este cliente."
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"No se pudo crear el paciente. Error: {e}")

@router.get("/", response_model=List[PatientRead])
async def list_patients(
    client_id: Optional[PydanticObjectId] = None,
    tenant: Tenant = Depends(require_vet_module)
):
    filter_conditions = [Patient.tenant.id == tenant.id]
    
    if client_id:
        filter_conditions.append(Patient.client.id == client_id)

    patients = await Patient.find(*filter_conditions).to_list()
    return patients

@router.get("/{patient_id}", response_model=PatientRead)
async def get_patient(
    patient_id: PydanticObjectId,
    tenant: Tenant = Depends(require_vet_module)
):
    patient = await Patient.get(patient_id)
    if not patient or patient.tenant.ref.id != tenant.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient not found")
    return patient

@router.put("/{patient_id}", response_model=PatientRead)
async def update_patient(
    patient_id: PydanticObjectId,
    patient_in: PatientUpdate,
    tenant: Tenant = Depends(require_vet_module)
):
    patient = await Patient.get(patient_id)
    if not patient or patient.tenant.ref.id != tenant.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient not found")
        
    update_data = patient_in.model_dump(exclude_unset=True)
    await patient.update({"$set": update_data})
    # Fetch again to return updated state
    updated_patient = await Patient.get(patient_id)
    return updated_patient

@router.delete("/{patient_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_patient(
    patient_id: PydanticObjectId,
    tenant: Tenant = Depends(require_vet_module)
):
    patient = await Patient.get(patient_id)
    if not patient or patient.tenant.ref.id != tenant.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient not found")
    await patient.delete()
    return None

@router.post("/{patient_id}/photo", response_model=PatientRead)
async def upload_patient_photo(
    patient_id: PydanticObjectId,
    file: UploadFile = File(...),
    tenant: Tenant = Depends(require_vet_module)
):
    patient = await Patient.get(patient_id)
    if not patient or patient.tenant.ref.id != tenant.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient not found")
    
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    upload_dir = "static/uploads/patients"
    os.makedirs(upload_dir, exist_ok=True)
    
    file_ext = file.filename.split(".")[-1]
    filename = f"{patient_id}_{uuid4()}.{file_ext}"
    file_path = os.path.join(upload_dir, filename)
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    photo_url = f"/static/uploads/patients/{filename}"
    patient.photo_url = photo_url
    await patient.save()
    
    return patient
