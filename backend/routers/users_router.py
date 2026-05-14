from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func
from sqlalchemy.orm import Session

from ..auth import (
    get_current_user,
    get_password_hash,
    get_user_by_email,
    require_roles,
)
from ..database import get_db
from ..models import Report, Review, User
from ..schemas import UserAdminCreateIn, UserAdminUpdateIn, UserPublic

router = APIRouter()


@router.get("", response_model=List[UserPublic])
def list_users(
    db: Session = Depends(get_db),
    current: User = Depends(get_current_user),
    role: Optional[str] = Query(None),
    q: Optional[str] = Query(None),
):
    if current.role not in ("admin", "municipal"):
        raise HTTPException(status_code=403, detail="Forbidden")
    if current.role == "municipal":
        if role != "contractor":
            raise HTTPException(
                status_code=403,
                detail="Municipal users may only list contractors",
            )
    query = db.query(User)
    if role:
        query = query.filter(User.role == role)
    if q:
        like = f"%{q}%"
        query = query.filter(
            (User.full_name.ilike(like))
            | (User.email.ilike(like))
            | (User.phone.ilike(like))
        )
    return query.order_by(User.rating.desc(), User.full_name.asc()).all()


@router.post("", response_model=UserPublic)
def admin_create_user(
    payload: UserAdminCreateIn,
    db: Session = Depends(get_db),
    current: User = Depends(require_roles("admin")),
):
    if get_user_by_email(db, payload.email):
        raise HTTPException(status_code=400, detail="Email already exists")
    user = User(
        full_name=payload.full_name,
        email=payload.email,
        phone=payload.phone,
        password_hash=get_password_hash(payload.password),
        role=payload.role,
        language=payload.language if payload.language in {"en", "kn", "hi"} else "en",
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.put("/{user_id}", response_model=UserPublic)
def admin_update_user(
    user_id: int,
    payload: UserAdminUpdateIn,
    db: Session = Depends(get_db),
    current: User = Depends(require_roles("admin")),
):
    u = db.query(User).filter(User.id == user_id).first()
    if not u:
        raise HTTPException(status_code=404, detail="User not found")
    data = payload.model_dump(exclude_unset=True)
    for k, v in data.items():
        setattr(u, k, v)
    db.commit()
    db.refresh(u)
    return u


@router.delete("/{user_id}", response_model=UserPublic)
def admin_deactivate(
    user_id: int,
    db: Session = Depends(get_db),
    current: User = Depends(require_roles("admin")),
):
    u = db.query(User).filter(User.id == user_id).first()
    if not u:
        raise HTTPException(status_code=404, detail="User not found")
    u.is_active = False
    db.commit()
    db.refresh(u)
    return u


@router.patch("/{user_id}/approve", response_model=UserPublic)
def approve_user(
    user_id: int,
    db: Session = Depends(get_db),
    current: User = Depends(get_current_user),
):
    u = db.query(User).filter(User.id == user_id).first()
    if not u:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Admin can approve anyone (mainly Municipal)
    # Municipal can only approve Contractors
    if current.role == "admin":
        pass
    elif current.role == "municipal" and u.role == "contractor":
        pass
    else:
        raise HTTPException(
            status_code=403,
            detail="You do not have permission to approve this user",
        )
    
    u.is_approved = True
    db.commit()
    db.refresh(u)
    return u


@router.get("/leaderboard")
def leaderboard(
    db: Session = Depends(get_db),
    limit: int = Query(20, ge=1, le=100),
):
    contractors = db.query(User).filter(User.role == "contractor").all()
    rows = []
    for c in contractors:
        citizen_avg = (
            db.query(func.avg(Review.rating))
            .filter(
                Review.reviewee_id == c.id,
                Review.reviewer_role == "citizen",
            )
            .scalar()
        )
        municipal_avg = (
            db.query(func.avg(Review.rating))
            .filter(
                Review.reviewee_id == c.id,
                Review.reviewer_role == "municipal",
            )
            .scalar()
        )
        ca = float(citizen_avg) if citizen_avg is not None else c.rating
        ma = float(municipal_avg) if municipal_avg is not None else c.rating
        combined = 0.5 * ma + 0.5 * ca
        jobs_done = (
            db.query(func.count(Report.id))
            .filter(
                Report.assigned_contractor_id == c.id,
                Report.status == "done",
            )
            .scalar()
        )
        rows.append(
            {
                "id": c.id,
                "full_name": c.full_name,
                "rating_display": round(c.rating, 2),
                "citizen_avg": round(ca, 2),
                "municipal_avg": round(ma, 2),
                "combined_score": round(combined, 2),
                "jobs_completed": int(jobs_done or 0),
                "avatar_url": c.avatar_url,
            }
        )
    rows.sort(key=lambda x: (x["combined_score"], x["jobs_completed"]), reverse=True)
    for idx, r in enumerate(rows[:limit], start=1):
        r["rank"] = idx
    return rows[:limit]
