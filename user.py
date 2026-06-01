from sqlalchemy import Column, Integer, String, DateTime, Boolean, Float, Text, ForeignKey, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from app.core.database import Base


class RoleEnum(str, enum.Enum):
    patient = "patient"
    doctor = "doctor"
    caregiver = "caregiver"
    admin = "admin"


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(150), nullable=False)
    email = Column(String(200), unique=True, index=True, nullable=False)
    phone = Column(String(20))
    country_code = Column(String(10), default="+962")  # رمز الدولة
    hashed_password = Column(String, nullable=False)
    role = Column(Enum(RoleEnum), nullable=False)
    is_active = Column(Boolean, default=True)
    is_approved = Column(Boolean, default=True)        # الأطباء يحتاجون موافقة أدمن
    fcm_token = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    patient_profile = relationship("PatientProfile", back_populates="user",
                                   foreign_keys="PatientProfile.user_id", uselist=False)
    doctor_profile = relationship("DoctorProfile", back_populates="user", uselist=False)
    sent_messages = relationship("Message", foreign_keys="Message.sender_id", back_populates="sender")


class PatientProfile(Base):
    __tablename__ = "patient_profiles"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    date_of_birth = Column(String(20))
    diagnosis_stage = Column(String(50))
    emergency_contact = Column(String(150))
    emergency_phone = Column(String(20))
    assigned_doctor_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    assigned_caregiver_id = Column(Integer, ForeignKey("users.id"), nullable=True)

    user = relationship("User", back_populates="patient_profile", foreign_keys=[user_id])
    medical_records = relationship("MedicalRecord", back_populates="patient")
    medications = relationship("Medication", back_populates="patient")
    appointments = relationship("Appointment", back_populates="patient")
    locations = relationship("LocationLog", back_populates="patient")


class DoctorProfile(Base):
    __tablename__ = "doctor_profiles"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    specialization = Column(String(100))
    hospital = Column(String(150))
    license_number = Column(String(50))

    user = relationship("User", back_populates="doctor_profile")


class MedicalRecord(Base):
    __tablename__ = "medical_records"
    id = Column(Integer, primary_key=True)
    patient_id = Column(Integer, ForeignKey("patient_profiles.id"))
    doctor_id = Column(Integer, ForeignKey("users.id"))
    title = Column(String(200))
    diagnosis = Column(Text)
    treatment = Column(Text)
    notes = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    patient = relationship("PatientProfile", back_populates="medical_records")
    doctor = relationship("User", foreign_keys=[doctor_id])


class Medication(Base):
    __tablename__ = "medications"
    id = Column(Integer, primary_key=True)
    patient_id = Column(Integer, ForeignKey("patient_profiles.id"))
    prescribed_by = Column(Integer, ForeignKey("users.id"))
    name = Column(String(150))
    dosage = Column(String(100))
    frequency = Column(String(100))
    reminder_times = Column(String(200))
    start_date = Column(String(20))
    end_date = Column(String(20), nullable=True)
    is_active = Column(Boolean, default=True)

    patient = relationship("PatientProfile", back_populates="medications")


class MedicationLog(Base):
    __tablename__ = "medication_logs"
    id = Column(Integer, primary_key=True)
    medication_id = Column(Integer, ForeignKey("medications.id"))
    taken_at = Column(DateTime(timezone=True), server_default=func.now())
    was_taken = Column(Boolean, default=True)
    notes = Column(String(200), nullable=True)


class Appointment(Base):
    __tablename__ = "appointments"
    id = Column(Integer, primary_key=True)
    patient_id = Column(Integer, ForeignKey("patient_profiles.id"))
    doctor_id = Column(Integer, ForeignKey("users.id"))
    scheduled_at = Column(DateTime(timezone=True))
    location = Column(String(200))
    notes = Column(Text, nullable=True)
    status = Column(String(30), default="scheduled")

    patient = relationship("PatientProfile", back_populates="appointments")
    doctor = relationship("User", foreign_keys=[doctor_id])


class LocationLog(Base):
    __tablename__ = "location_logs"
    id = Column(Integer, primary_key=True)
    patient_id = Column(Integer, ForeignKey("patient_profiles.id"))
    latitude = Column(Float)
    longitude = Column(Float)
    accuracy = Column(Float, nullable=True)
    recorded_at = Column(DateTime(timezone=True), server_default=func.now())
    is_safe_zone = Column(Boolean, default=True)

    patient = relationship("PatientProfile", back_populates="locations")


class SafeZone(Base):
    __tablename__ = "safe_zones"
    id = Column(Integer, primary_key=True)
    patient_id = Column(Integer, ForeignKey("patient_profiles.id"))
    label = Column(String(100))
    latitude = Column(Float)
    longitude = Column(Float)
    radius_meters = Column(Float, default=200.0)


class Message(Base):
    __tablename__ = "messages"
    id = Column(Integer, primary_key=True)
    sender_id = Column(Integer, ForeignKey("users.id"))
    receiver_id = Column(Integer, ForeignKey("users.id"))
    patient_id = Column(Integer, ForeignKey("patient_profiles.id"), nullable=True)
    body = Column(Text)
    is_read = Column(Boolean, default=False)
    sent_at = Column(DateTime(timezone=True), server_default=func.now())

    sender = relationship("User", foreign_keys=[sender_id], back_populates="sent_messages")
    receiver = relationship("User", foreign_keys=[receiver_id])


class Notification(Base):
    __tablename__ = "notifications"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    title = Column(String(200))
    body = Column(Text)
    type = Column(String(50))
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
