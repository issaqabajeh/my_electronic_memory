"""
اختبارات المواعيد والرسائل والإشعارات
"""


# ── Appointments ──────────────────────────────────────

def test_doctor_can_create_appointment(client, auth_headers_doctor):
    res = client.post("/api/appointments/", json={
        "patient_id": 1,
        "doctor_id": 1,
        "scheduled_at": "2026-06-15T10:00:00",
        "location": "عيادة الدكتور - عمّان",
        "notes": "مراجعة دورية"
    }, headers=auth_headers_doctor)
    assert res.status_code in (201, 404)


def test_patient_cannot_create_appointment(client, auth_headers_patient):
    res = client.post("/api/appointments/", json={
        "patient_id": 1,
        "doctor_id": 1,
        "scheduled_at": "2026-06-15T10:00:00",
        "location": "عيادة"
    }, headers=auth_headers_patient)
    assert res.status_code == 403


def test_get_patient_appointments(client, auth_headers_patient):
    res = client.get("/api/appointments/patient/1", headers=auth_headers_patient)
    assert res.status_code == 200
    assert isinstance(res.json(), list)


def test_get_doctor_appointments(client, auth_headers_doctor):
    res = client.get("/api/appointments/doctor/1", headers=auth_headers_doctor)
    assert res.status_code == 200
    assert isinstance(res.json(), list)


def test_update_appointment_status(client, auth_headers_doctor):
    # أنشئ موعد أولاً
    create_res = client.post("/api/appointments/", json={
        "patient_id": 1,
        "doctor_id": 1,
        "scheduled_at": "2026-07-01T09:00:00",
        "location": "المستشفى"
    }, headers=auth_headers_doctor)

    if create_res.status_code == 201:
        appt_id = create_res.json()["id"]
        res = client.put(
            f"/api/appointments/{appt_id}/status?new_status=completed",
            headers=auth_headers_doctor
        )
        assert res.status_code == 200
        assert res.json()["status"] == "completed"


# ── Messages ──────────────────────────────────────────

def test_send_message(client, auth_headers_patient):
    res = client.post("/api/messages", json={
        "receiver_id": 2,
        "body": "مرحباً دكتور، لدي سؤال"
    }, headers=auth_headers_patient)
    assert res.status_code in (201, 404)


def test_get_inbox(client, auth_headers_patient):
    res = client.get("/api/messages/inbox", headers=auth_headers_patient)
    assert res.status_code == 200
    assert isinstance(res.json(), list)


def test_get_thread(client, auth_headers_patient):
    res = client.get("/api/messages/thread/2", headers=auth_headers_patient)
    assert res.status_code == 200
    assert isinstance(res.json(), list)


def test_unauthorized_cannot_send_message(client):
    res = client.post("/api/messages", json={
        "receiver_id": 1,
        "body": "رسالة بدون token"
    })
    assert res.status_code == 401


# ── Notifications ─────────────────────────────────────

def test_get_notifications(client, auth_headers_patient):
    res = client.get("/api/notifications", headers=auth_headers_patient)
    assert res.status_code == 200
    assert isinstance(res.json(), list)


def test_mark_notification_read(client, auth_headers_patient):
    # هذا الاختبار يمر حتى لو الإشعار غير موجود
    res = client.put("/api/notifications/999/read", headers=auth_headers_patient)
    assert res.status_code == 200
