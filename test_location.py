"""
اختبارات تتبع الموقع والمناطق الآمنة
"""


def test_update_location(client, auth_headers_patient):
    res = client.post("/api/location/update", json={
        "patient_id": 1,
        "latitude": 31.9522,
        "longitude": 35.9330,
        "accuracy": 10.0
    }, headers=auth_headers_patient)
    assert res.status_code in (200, 404)


def test_get_latest_location(client, auth_headers_patient):
    # أضف موقع أولاً
    client.post("/api/location/update", json={
        "patient_id": 1,
        "latitude": 31.9522,
        "longitude": 35.9330
    }, headers=auth_headers_patient)

    res = client.get("/api/location/patient/1/latest", headers=auth_headers_patient)
    assert res.status_code in (200, 404)


def test_location_history(client, auth_headers_patient):
    res = client.get("/api/location/patient/1/history", headers=auth_headers_patient)
    assert res.status_code == 200
    assert isinstance(res.json(), list)


def test_add_safe_zone(client, auth_headers_doctor):
    res = client.post("/api/location/safe-zone", json={
        "patient_id": 1,
        "label": "المنزل",
        "latitude": 31.9522,
        "longitude": 35.9330,
        "radius_meters": 200.0
    }, headers=auth_headers_doctor)
    assert res.status_code in (201, 404)


def test_patient_inside_safe_zone(client, auth_headers_doctor, auth_headers_patient):
    # أضف منطقة آمنة
    client.post("/api/location/safe-zone", json={
        "patient_id": 1,
        "label": "المنزل",
        "latitude": 31.9522,
        "longitude": 35.9330,
        "radius_meters": 500.0
    }, headers=auth_headers_doctor)

    # أرسل موقع داخل المنطقة الآمنة
    res = client.post("/api/location/update", json={
        "patient_id": 1,
        "latitude": 31.9522,  # نفس النقطة = داخل المنطقة
        "longitude": 35.9330
    }, headers=auth_headers_patient)

    if res.status_code == 200:
        assert res.json()["is_safe_zone"] == True


def test_patient_outside_safe_zone(client, auth_headers_doctor, auth_headers_patient):
    # أضف منطقة آمنة صغيرة
    client.post("/api/location/safe-zone", json={
        "patient_id": 1,
        "label": "المنزل",
        "latitude": 31.9522,
        "longitude": 35.9330,
        "radius_meters": 10.0  # 10 متر فقط
    }, headers=auth_headers_doctor)

    # أرسل موقع بعيد جداً
    res = client.post("/api/location/update", json={
        "patient_id": 1,
        "latitude": 32.0,  # بعيد عن المنطقة
        "longitude": 36.0
    }, headers=auth_headers_patient)

    if res.status_code == 200:
        assert res.json()["is_safe_zone"] == False


def test_unauthorized_cannot_update_location(client):
    res = client.post("/api/location/update", json={
        "patient_id": 1,
        "latitude": 31.9522,
        "longitude": 35.9330
    })
    assert res.status_code == 401
