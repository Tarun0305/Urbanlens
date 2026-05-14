from datetime import datetime

from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
)
from sqlalchemy.orm import relationship

from .database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    phone = Column(String(64), nullable=False, default="")
    password_hash = Column(String(255), nullable=False)
    role = Column(String(32), nullable=False, default="citizen")
    language = Column(String(8), nullable=False, default="en")
    points = Column(Integer, nullable=False, default=0)
    rating = Column(Float, nullable=False, default=5.0)
    avatar_url = Column(String(512), nullable=True)
    is_active = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)

    reports_submitted = relationship(
        "Report",
        foreign_keys="Report.citizen_id",
        back_populates="citizen",
    )
    reports_assigned = relationship(
        "Report",
        foreign_keys="Report.assigned_contractor_id",
        back_populates="assigned_contractor",
    )
    notifications = relationship("Notification", back_populates="user")


class Report(Base):
    __tablename__ = "reports"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False, default="")
    category = Column(String(64), nullable=False)
    status = Column(String(32), nullable=False, default="pending")
    citizen_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    assigned_contractor_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    assigned_by_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    address = Column(String(512), nullable=True)
    area = Column(String(255), nullable=True)
    road_name = Column(String(255), nullable=True)
    cross_street = Column(String(255), nullable=True)
    ai_verified = Column(Boolean, nullable=False, default=False)
    ai_confidence = Column(Float, nullable=False, default=0.0)
    ai_result = Column(Text, nullable=True)
    image_url = Column(String(512), nullable=True)
    video_url = Column(String(512), nullable=True)
    severity = Column(String(32), nullable=False, default="medium")
    estimated_cost = Column(Float, nullable=True)
    work_start_date = Column(DateTime, nullable=True)
    work_end_date = Column(DateTime, nullable=True)
    workforce_count = Column(Integer, nullable=True)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(
        DateTime,
        nullable=False,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
    )
    resolved_at = Column(DateTime, nullable=True)

    citizen = relationship(
        "User",
        foreign_keys=[citizen_id],
        back_populates="reports_submitted",
    )
    assigned_contractor = relationship(
        "User",
        foreign_keys=[assigned_contractor_id],
        back_populates="reports_assigned",
    )
    daily_progress = relationship(
        "DailyProgress",
        back_populates="report",
        cascade="all, delete-orphan",
    )
    reviews = relationship("Review", back_populates="report")


class DailyProgress(Base):
    __tablename__ = "daily_progress"

    id = Column(Integer, primary_key=True, index=True)
    report_id = Column(Integer, ForeignKey("reports.id"), nullable=False)
    contractor_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    note = Column(Text, nullable=False, default="")
    photo_url = Column(String(512), nullable=True)
    video_url = Column(String(512), nullable=True)
    money_spent = Column(Float, nullable=False, default=0.0)
    workers_today = Column(Integer, nullable=False, default=0)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)

    report = relationship("Report", back_populates="daily_progress")


class Review(Base):
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True, index=True)
    report_id = Column(Integer, ForeignKey("reports.id"), nullable=False)
    reviewer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    reviewee_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    reviewer_role = Column(String(32), nullable=False)
    rating = Column(Integer, nullable=False)
    comment = Column(Text, nullable=True)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)

    report = relationship("Report", back_populates="reviews")


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    is_read = Column(Boolean, nullable=False, default=False)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)

    user = relationship("User", back_populates="notifications")
