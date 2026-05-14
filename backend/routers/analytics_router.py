from datetime import datetime, timedelta

from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from ..auth import get_current_user, require_roles
from ..database import get_db
from ..models import DailyProgress, Report, User

router = APIRouter()


@router.get("/public")
def public_summary(db: Session = Depends(get_db)):
    total_reports = int(db.query(func.count(Report.id)).scalar() or 0)
    resolved = int(
        db.query(func.count(Report.id)).filter(Report.status == "done").scalar() or 0
    )
    return {
        "total_reports": total_reports,
        "resolved": resolved,
        "cities": 12,
    }


@router.get("/summary")
def analytics_summary(
    db: Session = Depends(get_db),
    current: User = Depends(require_roles("municipal", "admin")),
):
    total_reports = db.query(func.count(Report.id)).scalar() or 0
    pending = (
        db.query(func.count(Report.id))
        .filter(Report.status.in_(("pending", "ai_verified")))
        .scalar()
        or 0
    )
    in_progress = (
        db.query(func.count(Report.id)).filter(Report.status == "in_progress").scalar()
        or 0
    )
    done = db.query(func.count(Report.id)).filter(Report.status == "done").scalar() or 0
    rejected = (
        db.query(func.count(Report.id)).filter(Report.status == "rejected").scalar()
        or 0
    )
    by_category = {}
    for cat in ("pothole", "garbage", "streetlight", "other"):
        c = (
            db.query(func.count(Report.id)).filter(Report.category == cat).scalar() or 0
        )
        by_category[cat] = int(c)

    top_q = (
        db.query(User)
        .filter(User.role == "contractor")
        .order_by(User.rating.desc())
        .limit(5)
        .all()
    )
    top_contractors = []
    for u in top_q:
        jobs = (
            db.query(func.count(Report.id))
            .filter(
                Report.assigned_contractor_id == u.id,
                Report.status == "done",
            )
            .scalar()
            or 0
        )
        top_contractors.append(
            {
                "id": u.id,
                "full_name": u.full_name,
                "rating": u.rating,
                "jobs_completed": int(jobs),
            }
        )

    since = datetime.utcnow() - timedelta(days=7)
    recent_reports = (
        db.query(Report).filter(Report.created_at >= since).order_by(Report.created_at.desc()).limit(10).all()
    )
    recent_activity = [
        {
            "type": "report",
            "id": r.id,
            "title": r.title,
            "status": r.status,
            "created_at": r.created_at,
        }
        for r in recent_reports
    ]
    recent_prog = (
        db.query(DailyProgress)
        .filter(DailyProgress.created_at >= since)
        .order_by(DailyProgress.created_at.desc())
        .limit(5)
        .all()
    )
    for p in recent_prog:
        recent_activity.append(
            {
                "type": "progress",
                "id": p.id,
                "report_id": p.report_id,
                "created_at": p.created_at,
            }
        )
    recent_activity.sort(key=lambda x: x["created_at"], reverse=True)
    recent_activity = recent_activity[:15]

    return {
        "total_reports": int(total_reports),
        "pending": int(pending),
        "in_progress": int(in_progress),
        "done": int(done),
        "rejected": int(rejected),
        "by_category": by_category,
        "top_contractors": top_contractors,
        "recent_activity": recent_activity,
    }
