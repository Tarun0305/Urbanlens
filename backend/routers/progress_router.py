import uuid
from pathlib import Path

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from sqlalchemy.orm import Session

from ..auth import get_current_user, require_roles
from ..database import get_db
from ..models import DailyProgress, Report, User

router = APIRouter()

PROGRESS_UPLOAD_DIR = (
    Path(__file__).resolve().parent.parent.parent / "uploads" / "progress"
)
PROGRESS_UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


@router.post("")
async def create_progress(
    report_id: int = Form(...),
    note: str = Form(""),
    money_spent: float = Form(0.0),
    workers_today: int = Form(0),
    photo: UploadFile | None = File(None),
    video: UploadFile | None = File(None),
    db: Session = Depends(get_db),
    current: User = Depends(require_roles("contractor")),
):
    r = db.query(Report).filter(Report.id == report_id).first()
    if not r or r.assigned_contractor_id != current.id:
        raise HTTPException(status_code=404, detail="Report not found")
    if r.status not in ("assigned", "in_progress"):
        raise HTTPException(
            status_code=400,
            detail="Progress can only be posted for assigned work",
        )

    photo_url = None
    video_url = None
    if photo and photo.filename:
        ext = Path(photo.filename).suffix or ".jpg"
        name = f"{uuid.uuid4().hex}{ext}"
        dest = PROGRESS_UPLOAD_DIR / name
        dest.write_bytes(await photo.read())
        photo_url = f"/uploads/progress/{name}"
    if video and video.filename:
        ext = Path(video.filename).suffix or ".mp4"
        name = f"{uuid.uuid4().hex}{ext}"
        dest = PROGRESS_UPLOAD_DIR / name
        dest.write_bytes(await video.read())
        video_url = f"/uploads/progress/{name}"

    entry = DailyProgress(
        report_id=report_id,
        contractor_id=current.id,
        note=note,
        photo_url=photo_url,
        video_url=video_url,
        money_spent=money_spent,
        workers_today=workers_today,
    )
    db.add(entry)
    if r.status == "assigned":
        r.status = "in_progress"
    db.commit()
    db.refresh(entry)
    return {
        "id": entry.id,
        "report_id": entry.report_id,
        "contractor_id": entry.contractor_id,
        "note": entry.note,
        "photo_url": entry.photo_url,
        "video_url": entry.video_url,
        "money_spent": entry.money_spent,
        "workers_today": entry.workers_today,
        "created_at": entry.created_at,
    }


@router.get("/{report_id}")
def list_progress(
    report_id: int,
    db: Session = Depends(get_db),
    current: User = Depends(get_current_user),
):
    r = db.query(Report).filter(Report.id == report_id).first()
    if not r:
        raise HTTPException(status_code=404, detail="Report not found")
    if current.role == "citizen" and r.citizen_id != current.id:
        raise HTTPException(status_code=403, detail="Forbidden")
    if current.role == "contractor" and r.assigned_contractor_id != current.id:
        raise HTTPException(status_code=403, detail="Forbidden")
    rows = (
        db.query(DailyProgress)
        .filter(DailyProgress.report_id == report_id)
        .order_by(DailyProgress.created_at.desc())
        .all()
    )
    return [
        {
            "id": x.id,
            "report_id": x.report_id,
            "contractor_id": x.contractor_id,
            "note": x.note,
            "photo_url": x.photo_url,
            "video_url": x.video_url,
            "money_spent": x.money_spent,
            "workers_today": x.workers_today,
            "created_at": x.created_at,
        }
        for x in rows
    ]
