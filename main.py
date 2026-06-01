from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import Base, engine
from app.routers.auth import router as auth_router
from app.routers.users import router as users_router
from app.routers.main_routers import (
    records_router, meds_router, appt_router, loc_router, msg_router
)

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.APP_NAME,
    version="2.0.0",
    description="Integrated Alzheimer's care platform — Full stack API",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL, "http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(users_router)
app.include_router(records_router)
app.include_router(meds_router)
app.include_router(appt_router)
app.include_router(loc_router)
app.include_router(msg_router)

@app.get("/")
def root():
    return {"app": settings.APP_NAME, "version": "2.0.0", "status": "running"}

@app.get("/health")
def health():
    return {"status": "healthy"}
