import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.main import app
from app.core.database import Base, get_db

# قاعدة بيانات مستقلة للاختبارات فقط
TEST_DATABASE_URL = "sqlite:///./test.db"

engine = create_engine(TEST_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


@pytest.fixture(scope="session", autouse=True)
def setup_database():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


@pytest.fixture()
def client():
    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()


@pytest.fixture()
def patient_token(client):
    """تسجيل وتسجيل دخول مريض — يرجع الـ token"""
    client.post("/api/auth/register", json={
        "full_name": "مريض تجريبي",
        "email": "patient@test.com",
        "password": "test1234",
        "role": "patient"
    })
    res = client.post("/api/auth/login", json={
        "email": "patient@test.com",
        "password": "test1234"
    })
    return res.json()["access_token"]


@pytest.fixture()
def doctor_token(client):
    """تسجيل وتسجيل دخول طبيب — يرجع الـ token"""
    client.post("/api/auth/register", json={
        "full_name": "دكتور تجريبي",
        "email": "doctor@test.com",
        "password": "test1234",
        "role": "doctor"
    })
    res = client.post("/api/auth/login", json={
        "email": "doctor@test.com",
        "password": "test1234"
    })
    return res.json()["access_token"]


@pytest.fixture()
def auth_headers_patient(patient_token):
    return {"Authorization": f"Bearer {patient_token}"}


@pytest.fixture()
def auth_headers_doctor(doctor_token):
    return {"Authorization": f"Bearer {doctor_token}"}
