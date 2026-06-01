from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime


class RegisterRequest(BaseModel):
    full_name: str
    email: EmailStr
    phone: Optional[str] = None
    country_code: str = "+962"   # رمز الدولة
    password: str
    role: str

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str
    user_id: int
    full_name: str

class UserOut(BaseModel):
    id: int
    full_name: str
    email: str
    phone: Optional[str] = None
    country_code: Optional[str] = None
    role: str
    is_active: bool
    is_approved: bool
    created_at: datetime
    class Config:
        from_attributes = True

class UserListOut(BaseModel):
    id: int
    full_name: str
    email: str
    role: str
    is_active: bool
    is_approved: bool
    class Config:
        from_attributes = True

class MedicalRecordCreate(BaseModel):
    patient_id: int
    title: str
    diagnosis: str
    treatment: str
    notes: Optional[str] = None

class MedicalRecordOut(MedicalRecordCreate):
    id: int
    doctor_id: int
    created_at: datetime
    class Config:
        from_attributes = True

class MedicationCreate(BaseModel):
    patient_id: int
    name: str
    dosage: str
    frequency: str
    reminder_times: str
    start_date: str
    end_date: Optional[str] = None

class MedicationOut(MedicationCreate):
    id: int
    prescribed_by: int
    is_active: bool
    class Config:
        from_attributes = True

class MedicationLogCreate(BaseModel):
    medication_id: int
    was_taken: bool
    notes: Optional[str] = None

class AppointmentCreate(BaseModel):
    patient_id: int
    doctor_id: int
    scheduled_at: datetime
    location: str
    notes: Optional[str] = None

class AppointmentOut(AppointmentCreate):
    id: int
    status: str
    class Config:
        from_attributes = True

class LocationUpdate(BaseModel):
    patient_id: int
    latitude: float
    longitude: float
    accuracy: Optional[float] = None

class LocationOut(LocationUpdate):
    id: int
    recorded_at: datetime
    is_safe_zone: bool
    class Config:
        from_attributes = True

class SafeZoneCreate(BaseModel):
    patient_id: int
    label: str
    latitude: float
    longitude: float
    radius_meters: float = 200.0

class SafeZoneOut(SafeZoneCreate):
    id: int
    class Config:
        from_attributes = True

class MessageCreate(BaseModel):
    receiver_id: int
    patient_id: Optional[int] = None
    body: str

class MessageOut(MessageCreate):
    id: int
    sender_id: int
    is_read: bool
    sent_at: datetime
    class Config:
        from_attributes = True

class NotificationOut(BaseModel):
    id: int
    title: str
    body: str
    type: str
    is_read: bool
    created_at: datetime
    class Config:
        from_attributes = True

class PatientProfileUpdate(BaseModel):
    date_of_birth: Optional[str] = None
    diagnosis_stage: Optional[str] = None
    emergency_contact: Optional[str] = None
    emergency_phone: Optional[str] = None
    assigned_doctor_id: Optional[int] = None
    assigned_caregiver_id: Optional[int] = None

class ChangeDoctorRequest(BaseModel):
    new_doctor_id: int
