"""
اختبارات التسجيل وتسجيل الدخول
"""


def test_register_patient(client):
    res = client.post("/api/auth/register", json={
        "full_name": "أحمد محمد",
        "email": "ahmed@test.com",
        "password": "password123",
        "role": "patient"
    })
    assert res.status_code == 201
    data = res.json()
    assert "access_token" in data
    assert data["role"] == "patient"
    assert data["full_name"] == "أحمد محمد"


def test_register_doctor(client):
    res = client.post("/api/auth/register", json={
        "full_name": "د. سارة خالد",
        "email": "sara@test.com",
        "password": "password123",
        "role": "doctor"
    })
    assert res.status_code == 201
    assert res.json()["role"] == "doctor"


def test_register_duplicate_email(client):
    client.post("/api/auth/register", json={
        "full_name": "مستخدم",
        "email": "duplicate@test.com",
        "password": "pass123",
        "role": "patient"
    })
    # نفس الإيميل مرة ثانية
    res = client.post("/api/auth/register", json={
        "full_name": "مستخدم آخر",
        "email": "duplicate@test.com",
        "password": "pass456",
        "role": "patient"
    })
    assert res.status_code == 400
    assert "already registered" in res.json()["detail"]


def test_login_success(client):
    client.post("/api/auth/register", json={
        "full_name": "مستخدم تجريبي",
        "email": "login_test@test.com",
        "password": "mypassword",
        "role": "caregiver"
    })
    res = client.post("/api/auth/login", json={
        "email": "login_test@test.com",
        "password": "mypassword"
    })
    assert res.status_code == 200
    assert "access_token" in res.json()


def test_login_wrong_password(client):
    client.post("/api/auth/register", json={
        "full_name": "مستخدم",
        "email": "wrongpass@test.com",
        "password": "correctpass",
        "role": "patient"
    })
    res = client.post("/api/auth/login", json={
        "email": "wrongpass@test.com",
        "password": "wrongpass"
    })
    assert res.status_code == 401


def test_login_nonexistent_user(client):
    res = client.post("/api/auth/login", json={
        "email": "nobody@test.com",
        "password": "pass123"
    })
    assert res.status_code == 401


def test_get_me(client, auth_headers_patient):
    res = client.get("/api/auth/me", headers=auth_headers_patient)
    assert res.status_code == 200
    data = res.json()
    assert data["role"] == "patient"
    assert "email" in data


def test_get_me_without_token(client):
    res = client.get("/api/auth/me")
    assert res.status_code == 401


def test_get_me_invalid_token(client):
    res = client.get("/api/auth/me", headers={"Authorization": "Bearer fake_token"})
    assert res.status_code == 401
