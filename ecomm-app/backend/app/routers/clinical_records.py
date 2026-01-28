from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from beanie import PydanticObjectId

from app.models import User, Patient, ClinicalRecord, Tenant
from app.schemas import ClinicalRecordRead, ClinicalRecordCreate, ClinicalRecordUpdate
from app.dependencies import require_vet_module

router = APIRouter(tags=["Clinical Records"])

@router.post("/", response_model=ClinicalRecordRead, status_code=status.HTTP_201_CREATED)
async def create_clinical_record(
    record_in: ClinicalRecordCreate,
    tenant: Tenant = Depends(require_vet_module)
):
    patient = await Patient.get(record_in.patient_id)
    if not patient or patient.tenant.ref.id != tenant.id:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    record = ClinicalRecord(
        **record_in.model_dump(exclude={"patient_id"}), 
        patient=patient, 
        tenant=tenant
    )
    await record.insert()
    return record

@router.get("/", response_model=List[ClinicalRecordRead])
async def list_records_for_patient(
    patient_id: PydanticObjectId,
    tenant: Tenant = Depends(require_vet_module)
):
    # Ensure patient belongs to the current tenant
    patient = await Patient.get(patient_id)
    if not patient or patient.tenant.ref.id != tenant.id:
        raise HTTPException(status_code=404, detail="Patient not found")

    # Use raw filter to ensure matching with DBRef when fetch_links is False
    records = await ClinicalRecord.find({"patient.$id": patient_id}).sort("-date").to_list()
    return records

@router.get("/{record_id}", response_model=ClinicalRecordRead)
async def get_clinical_record(
    record_id: PydanticObjectId,
    tenant: Tenant = Depends(require_vet_module)
):
    record = await ClinicalRecord.get(record_id)
    if not record or record.tenant.ref.id != tenant.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Record not found")
    return record

@router.put("/{record_id}", response_model=ClinicalRecordRead)
async def update_clinical_record(
    record_id: PydanticObjectId,
    record_in: ClinicalRecordUpdate,
    tenant: Tenant = Depends(require_vet_module)
):
    record = await ClinicalRecord.get(record_id)
    if not record or record.tenant.ref.id != tenant.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Record not found")
    
    update_data = record_in.model_dump(exclude_unset=True)
    await record.update({"$set": update_data})
    
    # Return updated record
    return await ClinicalRecord.get(record_id)

@router.delete("/{record_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_clinical_record(
    record_id: PydanticObjectId,
    tenant: Tenant = Depends(require_vet_module)
):
    record = await ClinicalRecord.get(record_id)
    if not record or record.tenant.ref.id != tenant.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Record not found")
    
    await record.delete()
    return None
