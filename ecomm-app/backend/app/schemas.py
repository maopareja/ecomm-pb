from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from beanie import PydanticObjectId

# --- Client Schemas ---
class ClientBase(BaseModel):
    name: str
    id_card: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None

class ClientCreate(ClientBase):
    pass

class ClientUpdate(ClientBase):
    name: Optional[str] = None

class ClientRead(ClientBase):
    id: PydanticObjectId
    created_at: datetime

# --- Patient Schemas ---
class PatientBase(BaseModel):
    name: str
    species: Optional[str] = None
    breed: Optional[str] = None
    photo_url: Optional[str] = None

class PatientCreate(PatientBase):
    client_id: PydanticObjectId

class PatientUpdate(PatientBase):
    name: Optional[str] = None

class PatientRead(PatientBase):
    id: PydanticObjectId
    created_at: datetime

# --- Clinical Record Schemas ---
class ClinicalRecordBase(BaseModel):
    reason: Optional[str] = None
    diagnosis: Optional[str] = None
    treatment: Optional[str] = None
    weight: Optional[float] = None
    temperature: Optional[float] = None
    notes: Optional[str] = None

class ClinicalRecordCreate(ClinicalRecordBase):
    patient_id: PydanticObjectId

class ClinicalRecordUpdate(ClinicalRecordBase):
    pass

class ClinicalRecordRead(ClinicalRecordBase):
    id: PydanticObjectId
    date: datetime
    created_at: datetime
# --- Customer Schemas ---
class CustomerBase(BaseModel):
    full_name: str
    phone: Optional[str] = None
    address: Optional[str] = None

class CustomerCreate(CustomerBase):
    pass

class CustomerRead(CustomerBase):
    id: PydanticObjectId
    created_at: datetime
