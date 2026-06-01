# My Electronic Memory — Backend Tests

دليل شامل لاختبارات الـ backend للنظام.

---

## نتائج الاختبارات

```
36 passed, 0 failed in 21.48s
```

| الملف | عدد الاختبارات | النتيجة |
|-------|---------------|---------|
| test_auth.py | 10 | ✅ نجح |
| test_location.py | 7 | ✅ نجح |
| test_appointments_messages.py | 11 | ✅ نجح |
| test_medications.py | 5 | ✅ نجح |
| test_records.py | 4 | ✅ نجح |
| **المجموع** | **36** | **✅ كل الاختبارات نجحت** |

---

## المتطلبات

```bash
pip install pytest httpx
```

---

## هيكل ملفات الاختبار

```
mem-backend/
├── conftest.py                         # إضافة app إلى Python path
├── pytest.ini                          # إعدادات pytest
└── tests/
    ├── conftest.py                     # إعداد قاعدة البيانات التجريبية و fixtures
    ├── test_auth.py                    # اختبارات التسجيل وتسجيل الدخول
    ├── test_records.py                 # اختبارات السجلات الطبية
    ├── test_medications.py             # اختبارات الأدوية والتذكيرات
    ├── test_location.py                # اختبارات تتبع الموقع
    └── test_appointments_messages.py   # اختبارات المواعيد والرسائل
```

---

## الملفات المطلوبة قبل التشغيل

### `mem-backend/conftest.py`
```python
import sys
import os
sys.path.insert(0, os.path.dirname(__file__))
```

### `mem-backend/pytest.ini`
```ini
[pytest]
pythonpath = .
testpaths = tests
```

---

## تشغيل الاختبارات

### تشغيل كل الاختبارات
```bash
python -m pytest tests/ -v
```

### تشغيل ملف محدد
```bash
python -m pytest tests/test_auth.py -v
python -m pytest tests/test_location.py -v
python -m pytest tests/test_medications.py -v
python -m pytest tests/test_records.py -v
python -m pytest tests/test_appointments_messages.py -v
```

### تشغيل اختبار واحد فقط
```bash
python -m pytest tests/test_auth.py::test_register_patient -v
```

### تشغيل مع إظهار print output
```bash
python -m pytest tests/ -v -s
```

### تشغيل مع تقرير مختصر
```bash
python -m pytest tests/ -q
```

---

## قاعدة البيانات التجريبية

الاختبارات تستخدم قاعدة بيانات **SQLite منفصلة** (`test.db`) لا تؤثر على بيانات التطوير أو الإنتاج.

- تُنشأ تلقائياً قبل بدء الاختبارات
- تُحذف تلقائياً بعد انتهاء كل الاختبارات
- معزولة تماماً عن `mem.db`

---

## تفصيل الاختبارات

### `test_auth.py` — المصادقة (10 اختبارات)

| الاختبار | ما يتحقق منه |
|---------|-------------|
| `test_register_patient` | تسجيل مريض جديد بنجاح |
| `test_register_doctor` | تسجيل طبيب جديد بنجاح |
| `test_register_duplicate_email` | رفض إيميل مكرر برمز 400 |
| `test_login_success` | تسجيل دخول صحيح يرجع token |
| `test_login_wrong_password` | كلمة مرور خاطئة ترجع 401 |
| `test_login_nonexistent_user` | مستخدم غير موجود يرجع 401 |
| `test_get_me` | جلب بيانات المستخدم الحالي |
| `test_get_me_without_token` | بدون token يرجع 401 |
| `test_get_me_invalid_token` | token مزيف يرجع 401 |

---

### `test_records.py` — السجلات الطبية (4 اختبارات)

| الاختبار | ما يتحقق منه |
|---------|-------------|
| `test_doctor_can_create_record` | الطبيب يستطيع إنشاء سجل طبي |
| `test_patient_cannot_create_record` | المريض لا يستطيع إنشاء سجل (403) |
| `test_get_patient_records` | جلب سجلات مريض |
| `test_unauthorized_cannot_get_records` | بدون token يرجع 401 |

---

### `test_medications.py` — الأدوية (5 اختبارات)

| الاختبار | ما يتحقق منه |
|---------|-------------|
| `test_doctor_can_prescribe` | الطبيب يستطيع وصف دواء |
| `test_patient_cannot_prescribe` | المريض لا يستطيع وصف دواء (403) |
| `test_get_medications_list` | جلب قائمة الأدوية |
| `test_log_medication_taken` | تسجيل أخذ الجرعة |
| `test_log_medication_missed` | تسجيل نسيان الجرعة |

---

### `test_location.py` — تتبع الموقع (7 اختبارات)

| الاختبار | ما يتحقق منه |
|---------|-------------|
| `test_update_location` | تحديث موقع المريض |
| `test_get_latest_location` | جلب آخر موقع |
| `test_location_history` | جلب سجل المواقع |
| `test_add_safe_zone` | إضافة منطقة آمنة |
| `test_patient_inside_safe_zone` | كشف أن المريض داخل المنطقة الآمنة |
| `test_patient_outside_safe_zone` | كشف أن المريض خارج المنطقة الآمنة |
| `test_unauthorized_cannot_update_location` | بدون token يرجع 401 |

---

### `test_appointments_messages.py` — المواعيد والرسائل (11 اختبار)

| الاختبار | ما يتحقق منه |
|---------|-------------|
| `test_doctor_can_create_appointment` | الطبيب يستطيع إنشاء موعد |
| `test_patient_cannot_create_appointment` | المريض لا يستطيع إنشاء موعد (403) |
| `test_get_patient_appointments` | جلب مواعيد المريض |
| `test_get_doctor_appointments` | جلب مواعيد الطبيب |
| `test_update_appointment_status` | تحديث حالة الموعد |
| `test_send_message` | إرسال رسالة |
| `test_get_inbox` | جلب صندوق الوارد |
| `test_get_thread` | جلب محادثة مع مستخدم |
| `test_unauthorized_cannot_send_message` | بدون token يرجع 401 |
| `test_get_notifications` | جلب الإشعارات |
| `test_mark_notification_read` | تحديد إشعار كمقروء |

---

## نظام الـ Fixtures

الـ fixtures في `tests/conftest.py` تُنشئ مستخدمين تجريبيين تلقائياً:

| Fixture | ما تفعله |
|---------|---------|
| `client` | TestClient معزول لكل اختبار |
| `patient_token` | يسجل مريض ويرجع JWT token |
| `doctor_token` | يسجل طبيب ويرجع JWT token |
| `auth_headers_patient` | headers جاهزة للمريض |
| `auth_headers_doctor` | headers جاهزة للطبيب |

---

## رموز الاستجابة المتوقعة

| الرمز | المعنى |
|------|--------|
| 200 | نجاح |
| 201 | تم الإنشاء |
| 400 | طلب خاطئ (مثل إيميل مكرر) |
| 401 | غير مصادق (token مفقود أو خاطئ) |
| 403 | غير مصرح (صلاحيات غير كافية) |
| 404 | العنصر غير موجود |

---

## التحذيرات الشائعة

التحذيرات التالية تظهر لكنها **غير مؤثرة** على الاختبارات:

- `PydanticDeprecatedSince20` — تحذير من pydantic v2 حول config قديم
- `MovedIn20Warning` — تحذير من SQLAlchemy حول `declarative_base()`

كلاهما من مكتبات خارجية وليس من كود المشروع.
