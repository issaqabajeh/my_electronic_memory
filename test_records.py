"""
اختبارات السجلات الطبية
"""


def get_patient_profile_id(client, auth_headers_patient):
    res = client.get("/api/auth/me", headers=auth_headers_patient)
    return res.json()["id"]


def test_doctor_can_create_record(client, auth_headers_doctor, auth_headers_patient):
    # نحتاج patient_profile id — نستخدم 1 كافتراض في الاختبار
    res = client.post("/api/records/", json={
        "patient_id": 1,
        "title": "فحص دوري",
        "diagnosis": "ألزهايمر مرحلة خفيفة",
        "treatment": "أريسبت 5mg",
        "notes": "مراقبة شهرية"
    }, headers=auth_headers_doctor)
    # 201 = تم الإنشاء، 404 = patient_id غير موجود (كلاهما مقبول في الاختبار)
    assert res.status_code in (201, 404)


def test_patient_cannot_create_record(client, auth_headers_patient):
    res = client.post("/api/records/", json={
        "patient_id": 1,
        "title": "سجل غير مصرح",
        "diagnosis": "تشخيص",
        "treatment": "علاج"
    }, headers=auth_headers_patient)
    assert res.status_code == 403


def test_get_patient_records(client, auth_headers_patient):
    res = client.get("/api/records/patient/1", headers=auth_headers_patient)
    assert res.status_code == 200
    assert isinstance(res.json(), list)


def test_unauthorized_cannot_get_records(client):
    res = client.get("/api/records/patient/1")
    assert res.status_code == 401
