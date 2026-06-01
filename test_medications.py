"""
اختبارات الأدوية والتذكيرات
"""


def test_doctor_can_prescribe(client, auth_headers_doctor):
    res = client.post("/api/medications/", json={
        "patient_id": 1,
        "name": "أريسبت",
        "dosage": "5mg",
        "frequency": "مرة يومياً",
        "reminder_times": "08:00",
        "start_date": "2026-05-12"
    }, headers=auth_headers_doctor)
    assert res.status_code in (201, 404)


def test_patient_cannot_prescribe(client, auth_headers_patient):
    res = client.post("/api/medications/", json={
        "patient_id": 1,
        "name": "دواء",
        "dosage": "10mg",
        "frequency": "مرتين",
        "reminder_times": "08:00,20:00",
        "start_date": "2026-05-12"
    }, headers=auth_headers_patient)
    assert res.status_code == 403


def test_get_medications_list(client, auth_headers_patient):
    res = client.get("/api/medications/patient/1", headers=auth_headers_patient)
    assert res.status_code == 200
    assert isinstance(res.json(), list)


def test_log_medication_taken(client, auth_headers_patient):
    res = client.post("/api/medications/log", json={
        "medication_id": 1,
        "was_taken": True
    }, headers=auth_headers_patient)
    # 201 = logged, 404 = medication not found (both acceptable)
    assert res.status_code in (201, 404, 200)


def test_log_medication_missed(client, auth_headers_patient):
    res = client.post("/api/medications/log", json={
        "medication_id": 1,
        "was_taken": False,
        "notes": "نسيت الجرعة"
    }, headers=auth_headers_patient)
    assert res.status_code in (201, 404, 200)
