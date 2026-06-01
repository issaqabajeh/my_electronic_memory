# My Electronic Memory — Backend

FastAPI backend for the Alzheimer's patient care platform.

---

## Tech Stack

| Tool | Version | Purpose |
|------|---------|---------|
| FastAPI | 0.111 | Web framework |
| Uvicorn | 0.29 | ASGI server |
| SQLAlchemy | 2.0 | ORM and database layer |
| Alembic | 1.13 | Database migrations |
| Pydantic v2 | 2.7 | Data validation and schemas |
| pydantic-settings | 2.2 | Environment variable management |
| python-jose | 3.3 | JWT token generation and verification |
| bcrypt | 4.1 | Password hashing |
| SQLite | built-in | Default database (no installation needed) |
| PostgreSQL | optional | Production database |
| Redis | optional | Caching and Celery broker |
| Celery | 5.4 | Background task queue |
| python-socketio | 5.11 | WebSocket support |

---

## Prerequisites

- Python 3.11 or higher
- pip

---

## Setup & Run

```bash
# 1. Create virtual environment
python -m venv venv

# Windows PowerShell
venv\Scripts\Activate.ps1

# Mac / Linux
source venv/bin/activate

# 2. Install dependencies
pip install -r requirements.txt

# 3. Configure environment
copy .env.example .env     # Windows
cp .env.example .env       # Mac / Linux
# Edit .env if needed

# 4. Start the server
uvicorn app.main:app --reload --port 8000
```

Server runs at: **http://localhost:8000**
Interactive API docs: **http://localhost:8000/docs**

---

## Environment Variables (`.env`)

```env
APP_NAME=My Electronic Memory
SECRET_KEY=dev-secret-key-change-in-production
DATABASE_URL=sqlite:///./mem.db
REDIS_URL=redis://localhost:6379/0
FRONTEND_URL=http://localhost:5173
FCM_SERVER_KEY=optional-firebase-key
```

To switch to PostgreSQL, replace `DATABASE_URL`:
```env
DATABASE_URL=postgresql://user:password@localhost:5432/mem_db
```

---

## Project Structure

```
mem-backend/
├── .env                                # Environment variables
├── requirements.txt                    # Python dependencies
└── app/
    ├── __init__.py
    ├── main.py                         # FastAPI app, CORS, router includes
    ├── core/
    │   ├── config.py                   # Settings loaded from .env
    │   ├── database.py                 # SQLAlchemy engine, session, Base
    │   └── security.py                 # JWT, bcrypt, get_current_user, require_role
    ├── models/
    │   └── user.py                     # All 11 SQLAlchemy database models
    ├── schemas/
    │   └── schemas.py                  # All Pydantic request/response schemas
    └── routers/
        ├── auth.py                     # Register, Login, Me
        ├── users.py                    # User management + doctor approval + change doctor
        └── main_routers.py             # Records, Medications, Appointments, Location, Messages
```

---

## Database Models

| Model | Table | Description |
|-------|-------|-------------|
| User | users | All system users (patient, doctor, caregiver, admin) |
| PatientProfile | patient_profiles | Extended patient data: DOB, diagnosis stage, assigned doctor/caregiver |
| DoctorProfile | doctor_profiles | Extended doctor data: specialization, hospital, license |
| MedicalRecord | medical_records | Patient health records created by doctors |
| Medication | medications | Active prescriptions |
| MedicationLog | medication_logs | Log of taken/missed doses |
| Appointment | appointments | Scheduled appointments between patient and doctor |
| LocationLog | location_logs | GPS coordinates with safe zone status |
| SafeZone | safe_zones | Geofenced areas defined per patient |
| Message | messages | Direct messages between users |
| Notification | notifications | System notifications per user |

**New fields in v2:**
- `User.country_code` — stores phone country code (e.g. `+962`)
- `User.is_approved` — doctors start as `False`, set to `True` by admin

---

## API Endpoints

### Auth — `/api/auth`

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/register` | Public | Register new user. Doctors start with `is_approved=False` |
| POST | `/login` | Public | Login. Blocked if `is_approved=False` |
| GET | `/me` | Any auth | Get current user profile |
| PUT | `/fcm-token` | Any auth | Update Firebase push notification token |

### Users — `/api/users`

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/` | Admin, Doctor | List all users |
| GET | `/patients` | Admin, Doctor, Caregiver | List all patients |
| GET | `/doctors` | Any auth | List approved active doctors |
| GET | `/pending-doctors` | Admin | List doctors awaiting approval |
| PUT | `/{id}/approve` | Admin | Approve a doctor account |
| PUT | `/{id}/reject` | Admin | Reject and disable a doctor account |
| GET | `/{id}` | Any auth | Get user by ID |
| PUT | `/patient-profile/{id}` | Doctor, Admin | Update patient profile fields |
| PUT | `/patient/{id}/change-doctor` | Caregiver, Admin | Reassign patient to a different doctor |
| PUT | `/{id}/deactivate` | Admin | Deactivate a user account |

### Medical Records — `/api/records`

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/` | Doctor, Admin | Create medical record |
| GET | `/patient/{id}` | Any auth | Get records for a patient |
| PUT | `/{id}` | Doctor, Admin | Update record |
| DELETE | `/{id}` | Doctor, Admin | Delete record |

### Medications — `/api/medications`

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/` | Doctor, Admin | Prescribe medication |
| GET | `/patient/{id}` | Any auth | Get active medications |
| POST | `/log` | Any auth | Log dose as taken or missed |
| PUT | `/{id}/deactivate` | Doctor, Admin | Stop a medication |

### Appointments — `/api/appointments`

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/` | Doctor, Admin, Caregiver | Schedule appointment |
| GET | `/patient/{id}` | Any auth | Patient's appointments |
| GET | `/doctor/{id}` | Any auth | Doctor's appointments |
| PUT | `/{id}/status` | Doctor, Admin | Update status: scheduled / completed / cancelled |

### Location — `/api/location`

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/update` | Any auth | Send GPS coordinates. Checks against safe zones |
| GET | `/patient/{id}/latest` | Any auth | Get latest location |
| GET | `/patient/{id}/history` | Any auth | Get location history (last 50) |
| POST | `/safe-zone` | Doctor, Admin, Caregiver | Add safe zone |
| GET | `/safe-zone/patient/{id}` | Any auth | List safe zones for patient |
| DELETE | `/safe-zone/{id}` | Doctor, Admin, Caregiver | Delete safe zone |

### Messages & Notifications — `/api`

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/messages` | Any auth | Send message |
| GET | `/messages/inbox` | Any auth | Get received messages |
| GET | `/messages/thread/{id}` | Any auth | Get conversation thread (marks as read) |
| GET | `/notifications` | Any auth | Get user notifications (last 50) |
| PUT | `/notifications/{id}/read` | Any auth | Mark notification as read |
| PUT | `/notifications/read-all` | Any auth | Mark all notifications as read |

---

## Authentication & Authorization

JWT tokens are used for all protected routes.

**Token flow:**
1. User registers or logs in → receives `access_token`
2. Client stores token in `localStorage`
3. All subsequent requests include `Authorization: Bearer <token>`
4. Token expires after 24 hours

**Role guards:**
```python
# Any authenticated user
current_user = Depends(get_current_user)

# Specific roles only
current_user = Depends(require_role("doctor", "admin"))
```

**Doctor approval flow:**
1. Doctor registers → `is_approved = False`
2. API returns HTTP 202 (not a token)
3. Doctor cannot log in until admin approves
4. Admin calls `PUT /api/users/{id}/approve`
5. Doctor can now log in normally

---

## Geofencing Logic

When a location update is received, the backend checks all safe zones for that patient using the Haversine formula:

```python
def haversine(lat1, lon1, lat2, lon2) -> float:
    # Returns distance in meters between two GPS coordinates
```

If the patient is outside all defined safe zones, `is_safe_zone = False` is stored and a `location_alert` notification is created.

---

## Running Tests

```bash
# Install test dependencies
pip install pytest httpx

# Create pytest.ini in mem-backend/
echo "[pytest]
pythonpath = .
testpaths = tests" > pytest.ini

# Run all tests
python -m pytest tests/ -v
```

Expected result: **36 passed**

---

## Creating the First Admin

Admin accounts cannot be created through the registration form (the UI only shows patient/doctor/caregiver). To create an admin:

1. Open **http://localhost:8000/docs**
2. Go to `POST /api/auth/register`
3. Set `role` to `"admin"`
4. Execute — you receive a token immediately

---

## Common Issues

| Problem | Fix |
|---------|-----|
| `psycopg2 connection refused` | Switch to SQLite in `.env`: `DATABASE_URL=sqlite:///./mem.db` |
| `bcrypt` / `passlib` error | Ensure `bcrypt==4.1.3` is in requirements and installed |
| `AmbiguousForeignKeysError` | Add `foreign_keys=` to all relationships in `models/user.py` |
| `ModuleNotFoundError: app` | Run `python -m pytest` not just `pytest`, or add `pytest.ini` |
| `source` not recognized on Windows | Use `venv\Scripts\Activate.ps1` in PowerShell |
