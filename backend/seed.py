import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from backend.auth import get_password_hash
from backend.database import SessionLocal, engine, Base
from backend.models import User


def run():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        users = [
            (
                "Tarun Citizen",
                "tarun.citizen@test.com",
                "+919900000001",
                "citizen",
            ),
            (
                "Tarun Municipal",
                "tarun.municipal@test.com",
                "+919900000002",
                "municipal",
            ),
            (
                "Tarun Contractor",
                "tarun.contractor@test.com",
                "+919900000003",
                "contractor",
            ),
            ("Tarun Admin", "tarun.admin@test.com", "+919900000004", "admin"),
        ]
        for full_name, email, phone, role in users:
            existing = db.query(User).filter(User.email == email).first()
            if existing:
                continue
            db.add(
                User(
                    full_name=full_name,
                    email=email,
                    phone=phone,
                    password_hash=get_password_hash("password123"),
                    role=role,
                    language="en",
                )
            )
        db.commit()
    finally:
        db.close()


if __name__ == "__main__":
    run()
    print("Seed complete.")
