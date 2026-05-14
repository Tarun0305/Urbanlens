from datetime import datetime
from typing import Any, List, Optional

from pydantic import BaseModel, EmailStr, Field


class TokenOut(BaseModel):
    token: str
    token_type: str = "bearer"


class UserPublic(BaseModel):
    id: int
    full_name: str
    email: str
    phone: str
    role: str
    language: str
    points: int
    rating: float
    achievements: Optional[str] = None
    avatar_url: Optional[str] = None
    is_active: bool
    is_approved: bool
    created_at: datetime

    class Config:
        from_attributes = True


class LoginIn(BaseModel):
    email: EmailStr
    password: str


class LoginOut(BaseModel):
    token: str
    user: UserPublic


class RegisterIn(BaseModel):
    full_name: str
    email: EmailStr
    phone: str
    password: str
    role: str = "citizen"
    language: str = "en"
    achievements: Optional[str] = None


class ReportCreateIn(BaseModel):
    title: str
    description: str
    category: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    address: Optional[str] = None
    area: Optional[str] = None
    road_name: Optional[str] = None
    cross_street: Optional[str] = None
    image_url: Optional[str] = None
    video_url: Optional[str] = None
    severity: str = "medium"
    ai_verified: bool = False
    ai_confidence: float = 0.0
    ai_result: Optional[str] = None


class ReportUpdateIn(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    status: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    address: Optional[str] = None
    area: Optional[str] = None
    road_name: Optional[str] = None
    cross_street: Optional[str] = None
    severity: Optional[str] = None
    estimated_cost: Optional[float] = None
    work_start_date: Optional[datetime] = None
    work_end_date: Optional[datetime] = None
    workforce_count: Optional[int] = None
    assigned_contractor_id: Optional[int] = None


class AssignIn(BaseModel):
    contractor_id: int
    estimated_cost: Optional[float] = None
    work_start_date: Optional[datetime] = None
    work_end_date: Optional[datetime] = None
    workforce_count: Optional[int] = None


class ProgressCreateIn(BaseModel):
    report_id: int
    note: str = ""
    money_spent: float = 0.0
    workers_today: int = 0


class ReviewCreateIn(BaseModel):
    report_id: int
    reviewee_id: int
    rating: int = Field(ge=1, le=5)
    comment: Optional[str] = None


class UserAdminCreateIn(BaseModel):
    full_name: str
    email: EmailStr
    phone: str
    password: str
    role: str
    language: str = "en"


class UserAdminUpdateIn(BaseModel):
    full_name: Optional[str] = None
    role: Optional[str] = None
    language: Optional[str] = None
    is_active: Optional[bool] = None


class GeotagOut(BaseModel):
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    source: Optional[str] = None


class UploadImageOut(BaseModel):
    image_url: str
    ai_verified: bool
    ai_confidence: float
    ai_result: str
    geotag: GeotagOut
    needs_review: bool = False
    category_detected: Optional[str] = None
