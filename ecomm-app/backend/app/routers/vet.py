from fastapi import APIRouter, Depends, HTTPException
from typing import List
from app.models import MedicalRecord, Appointment, Tenant
from app.dependencies import require_vet_module
from pydantic import BaseModel
from datetime import datetime

router = APIRouter()

class MedicalRecordCreate(BaseModel):
    patient_name: str
    owner_name: str
    species: str
    diagnosis: str
    treatment: str

class AppointmentCreate(BaseModel):
    customer_name: str
    pet_name: str
    date: datetime
    reason: str

@router.get("/records", response_model=List[MedicalRecord])
async def list_records(tenant: Tenant = Depends(require_vet_module)):
    return await MedicalRecord.find(MedicalRecord.tenant_id == str(tenant.id)).to_list()

@router.post("/records", response_model=MedicalRecord)
async def create_record(
    record: MedicalRecordCreate,
    tenant: Tenant = Depends(require_vet_module)
):
    new_record = MedicalRecord(
        tenant_id=str(tenant.id),
        patient_name=record.patient_name,
        owner_name=record.owner_name,
        species=record.species,
        diagnosis=record.diagnosis,
        treatment=record.treatment
    )
    await new_record.insert()
    return new_record

@router.get("/appointments", response_model=List[Appointment])
async def list_appointments(tenant: Tenant = Depends(require_vet_module)):
    return await Appointment.find(Appointment.tenant_id == str(tenant.id)).to_list()

@router.post("/appointments", response_model=Appointment)
async def create_appointment(
    appt: AppointmentCreate,
    tenant: Tenant = Depends(require_vet_module)
):
    new_appt = Appointment(
        tenant_id=str(tenant.id),
        customer_name=appt.customer_name,
        pet_name=appt.pet_name,
        date=appt.date,
        reason=appt.reason
    )
    await new_appt.insert()
    return new_appt
