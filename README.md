# UrbanLens — AI-Powered Civic Issue Reporting Platform

UrbanLens is a full-stack civic issue reporting platform that combines citizen uploads, GPT-4o Vision verification, municipal assignment workflows, contractor progress tracking, and dual-sided ratings.

## Live URLs

- Frontend (Vercel): https://urbanlens.vercel.app
- Backend (Railway): https://urbanlens.railway.app

## Test accounts

| Email | Password | Role |
| --- | --- | --- |
| tarun.citizen@test.com | password123 | citizen |
| tarun.municipal@test.com | password123 | municipal |
| tarun.contractor@test.com | password123 | contractor |
| tarun.admin@test.com | password123 | admin |

## Local setup

Backend:

```bash
git clone https://github.com/Tarun0305/Urbanlens.git
cd Urbanlens
python -m venv .venv
.venv\Scripts\activate
pip install -r backend/requirements.txt
python -m backend.seed
uvicorn backend.main:app --reload --host 127.0.0.1 --port 8000
```

Frontend:

```bash
cd frontend
npm install
npm run dev
```

Create `frontend/.env` for a remote API:

```bash
VITE_API_URL=http://127.0.0.1:8000
```

## Tech stack

- Backend: Python 3.11, FastAPI, SQLAlchemy, SQLite, JWT (HS256), bcrypt, OpenAI GPT-4o Vision, Pillow, httpx.
- Frontend: React 18, Vite, TypeScript, Tailwind CSS, React Router, Axios, Zustand, Framer Motion, Lucide, React Hot Toast, i18next, React Leaflet.

## AI pipeline

When a citizen uploads a photo, the backend stores it under `uploads/reports/`, sends a base64 vision payload to GPT-4o, and parses strict JSON describing legitimacy, category alignment, confidence, and rationale. If the model rejects the capture as non-legitimate, the API responds with HTTP 400 and the citizen must upload a different image. When confidence falls below 45, the response flags `needs_review` so municipal staff can pay extra attention while still allowing compliant submissions to move forward.

After verification succeeds, the citizen completes structured fields (location, severity, narrative) and the report becomes `ai_verified` in the database. Municipal users can then assign contractors, which triggers notifications, while contractors stream daily progress with optional photo and video evidence. When a report is marked `done`, both citizens and municipal reviewers can rate the contractor, feeding the combined leaderboard scoring logic on the backend.

## Screenshots

Screenshots will be added here after deployment (hero landing, citizen reporting flow, municipal triage, contractor progress, admin user management).
