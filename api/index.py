from contextlib import asynccontextmanager
from pathlib import Path
import os
import sys

# Add the project root to sys.path for Vercel deployment
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from backend.database import Base, engine
from backend.routers import (
    analytics_router,
    auth_router,
    notifications_router,
    progress_router,
    reports_router,
    reviews_router,
    users_router,
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    root = Path(__file__).resolve().parent.parent / "uploads"
    (root / "reports").mkdir(parents=True, exist_ok=True)
    (root / "progress").mkdir(parents=True, exist_ok=True)
    yield


app = FastAPI(title="UrbanLens API", lifespan=lifespan)

env_origins = os.getenv("ALLOWED_ORIGINS")
if env_origins:
    origins = [origin.strip() for origin in env_origins.split(",") if origin.strip()]
else:
    origins = [
        "https://urbanlens-techno.vercel.app",
        "https://urbanlens-sandy.vercel.app",
        "https://urbanlens-techno.railway.app",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

upload_root = Path(__file__).resolve().parent.parent / "uploads"
upload_root.mkdir(parents=True, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=str(upload_root)), name="uploads")

app.include_router(auth_router.router, prefix="/api/auth", tags=["auth"])
app.include_router(reports_router.router, prefix="/api/reports", tags=["reports"])
app.include_router(progress_router.router, prefix="/api/progress", tags=["progress"])
app.include_router(reviews_router.router, prefix="/api/reviews", tags=["reviews"])
app.include_router(users_router.router, prefix="/api/users", tags=["users"])
app.include_router(
    notifications_router.router, prefix="/api/notifications", tags=["notifications"]
)
app.include_router(
    analytics_router.router, prefix="/api/analytics", tags=["analytics"]
)


@app.get("/health")
def health():
    return {"status": "ok"}
