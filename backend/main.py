from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from .database import Base, engine
from .routers import (
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
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://urbanlens-techno.vercel.app",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

upload_root = Path(__file__).resolve().parent.parent / "uploads"
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
