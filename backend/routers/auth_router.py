from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..auth import (
    authenticate_user,
    create_access_token,
    get_current_user,
    get_password_hash,
    get_user_by_email,
)
from ..database import get_db
from ..models import User
from ..schemas import LoginIn, LoginOut, RegisterIn, UserPublic

router = APIRouter()


@router.post("/register", response_model=UserPublic)
def register(payload: RegisterIn, db: Session = Depends(get_db)):
    if get_user_by_email(db, payload.email):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )
    allowed_roles = {"citizen", "municipal", "contractor", "admin"}
    role = payload.role if payload.role in allowed_roles else "citizen"
    lang = payload.language if payload.language in {"en", "kn", "hi"} else "en"
    # Approval logic: Citizen and Admin are pre-approved. Municipal and Contractor need approval.
    is_approved = True
    if role in {"municipal", "contractor"}:
        is_approved = False

    user = User(
        full_name=payload.full_name,
        email=payload.email,
        phone=payload.phone,
        password_hash=get_password_hash(payload.password),
        role=role,
        language=lang,
        achievements=payload.achievements,
        is_approved=is_approved,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.post("/login", response_model=LoginOut)
def login(payload: LoginIn, db: Session = Depends(get_db)):
    user = authenticate_user(db, payload.email, payload.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )
    
    if not user.is_approved:
        role_map = {
            "municipal": "Municipal Authority approval pending. Please contact Admin.",
            "contractor": "Contractor approval pending. Please contact Municipal Authority."
        }
        detail = role_map.get(user.role, "Account pending approval.")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=detail,
        )

    token = create_access_token({"sub": user.email})
    return LoginOut(token=token, user=user)


@router.get("/me", response_model=UserPublic)
def me(current: User = Depends(get_current_user)):
    return current
