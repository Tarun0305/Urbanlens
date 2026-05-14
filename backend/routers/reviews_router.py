from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session

from ..auth import get_current_user, require_roles
from ..database import get_db
from ..models import Report, Review, User
from ..schemas import ReviewCreateIn

router = APIRouter()


def _recalc_contractor_rating(db: Session, contractor_id: int):
    contractor = db.query(User).filter(User.id == contractor_id).first()
    if not contractor:
        return
    avg = (
        db.query(func.avg(Review.rating))
        .filter(Review.reviewee_id == contractor_id)
        .scalar()
    )
    contractor.rating = float(avg) if avg is not None else 5.0


@router.post("")
def create_review(
    payload: ReviewCreateIn,
    db: Session = Depends(get_db),
    current: User = Depends(require_roles("citizen", "municipal")),
):
    r = db.query(Report).filter(Report.id == payload.report_id).first()
    if not r:
        raise HTTPException(status_code=404, detail="Report not found")
    if r.status != "done":
        raise HTTPException(
            status_code=400,
            detail="Reviews are only allowed when the report is done",
        )
    if current.role == "citizen" and r.citizen_id != current.id:
        raise HTTPException(status_code=403, detail="Forbidden")
    reviewee = db.query(User).filter(User.id == payload.reviewee_id).first()
    if not reviewee or reviewee.role != "contractor":
        raise HTTPException(status_code=400, detail="Invalid reviewee")
    if r.assigned_contractor_id != reviewee.id:
        raise HTTPException(
            status_code=400,
            detail="Reviewee must be the assigned contractor",
        )
    role_label = "citizen" if current.role == "citizen" else "municipal"
    rev = Review(
        report_id=payload.report_id,
        reviewer_id=current.id,
        reviewee_id=payload.reviewee_id,
        reviewer_role=role_label,
        rating=payload.rating,
        comment=payload.comment,
    )
    db.add(rev)
    db.commit()
    _recalc_contractor_rating(db, payload.reviewee_id)
    db.commit()
    db.refresh(rev)
    return {
        "id": rev.id,
        "report_id": rev.report_id,
        "reviewer_id": rev.reviewer_id,
        "reviewee_id": rev.reviewee_id,
        "reviewer_role": rev.reviewer_role,
        "rating": rev.rating,
        "comment": rev.comment,
        "created_at": rev.created_at,
    }


@router.get("/contractor/{contractor_id}")
def contractor_reviews(
    contractor_id: int,
    db: Session = Depends(get_db),
    current: User = Depends(get_current_user),
):
    rows = (
        db.query(Review)
        .filter(Review.reviewee_id == contractor_id)
        .order_by(Review.created_at.desc())
        .all()
    )
    out = []
    for rev in rows:
        reviewer = db.query(User).filter(User.id == rev.reviewer_id).first()
        out.append(
            {
                "id": rev.id,
                "report_id": rev.report_id,
                "rating": rev.rating,
                "comment": rev.comment,
                "reviewer_role": rev.reviewer_role,
                "created_at": rev.created_at,
                "reviewer_name": reviewer.full_name if reviewer else None,
            }
        )
    return out
